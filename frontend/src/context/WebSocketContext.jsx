import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
    const [isConnected, setIsConnected] = useState(false)
    const [lastEvent, setLastEvent] = useState(null)
    const [events, setEvents] = useState([])
    const [alerts, setAlerts] = useState([])
    const wsRef = useRef(null)
    const reconnectRef = useRef(null)
    const listenersRef = useRef(new Map())

    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) return

        const ws = new WebSocket('ws://localhost:8000/ws/events')

        ws.onopen = () => {
            setIsConnected(true)
            console.log('[WS] Connected to ClinIQ Real-Time Stream')
        }

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data)
                if (msg.type === 'pong') return

                setLastEvent(msg)

                if (msg.type === 'vitals_update') {
                    setEvents(prev => [msg, ...prev].slice(0, 100))
                }
                if (msg.type === 'alert') {
                    setAlerts(prev => [msg.data, ...prev].slice(0, 50))
                }
                if (msg.type === 'alert_acknowledged') {
                    setAlerts(prev => prev.filter(a => a.id !== msg.data.id))
                }

                // Notify all listeners
                listenersRef.current.forEach((callback, key) => {
                    try { callback(msg) } catch (e) { console.error('[WS] Listener error:', e) }
                })
            } catch (e) {
                console.error('[WS] Parse error:', e)
            }
        }

        ws.onclose = () => {
            setIsConnected(false)
            console.log('[WS] Disconnected. Reconnecting in 3s...')
            reconnectRef.current = setTimeout(connect, 3000)
        }

        ws.onerror = (err) => {
            console.error('[WS] Error:', err)
            ws.close()
        }

        wsRef.current = ws
    }, [])

    useEffect(() => {
        connect()
        return () => {
            clearTimeout(reconnectRef.current)
            wsRef.current?.close()
        }
    }, [connect])

    const subscribe = useCallback((key, callback) => {
        listenersRef.current.set(key, callback)
        return () => listenersRef.current.delete(key)
    }, [])

    const send = useCallback((data) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data))
        }
    }, [])

    return (
        <WebSocketContext.Provider value={{ isConnected, lastEvent, events, alerts, subscribe, send }}>
            {children}
        </WebSocketContext.Provider>
    )
}

export function useWebSocket() {
    const ctx = useContext(WebSocketContext)
    if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider')
    return ctx
}
