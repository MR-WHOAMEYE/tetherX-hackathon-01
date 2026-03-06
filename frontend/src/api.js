// Auto-detect environment
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL + '/api';
    if (import.meta.env.DEV) return 'http://localhost:8000/api';
    return '/api'; // Production fallback (same origin on Vercel)
};

const API = getApiUrl();

async function request(url, options = {}) {
    const res = await fetch(`${API}${url}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Request failed');
    }
    return res.json();
}

export const api = {
    // Auth
    login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

    // Patients
    getPatients: (status, search, limit = 100) => {
        const params = new URLSearchParams();
        if (status && status !== 'all') params.set('status', status);
        if (search) params.set('search', search);
        params.set('limit', limit);
        return request(`/patients?${params}`);
    },
    getPatient: (id) => request(`/patients/${id}`),
    createPatient: (data) => request('/patients', { method: 'POST', body: JSON.stringify(data) }),
    getPatientCount: () => request('/patients/count'),
    getStatusDistribution: () => request('/patients/status-distribution'),

    // Vitals
    getVitals: (pid, limit = 10) => request(`/patients/${pid}/vitals?limit=${limit}`),
    addVitals: (data) => request('/vitals', { method: 'POST', body: JSON.stringify(data) }),

    // Labs
    getLabs: (pid) => request(`/patients/${pid}/labs`),

    // Medications
    getMedications: (pid) => request(`/patients/${pid}/medications`),

    // AI Copilot
    analyzeSymptomsRaw: (data) => request('/copilot/analyze', { method: 'POST', body: JSON.stringify(data) }),
    analyzePatient: (pid) => request(`/copilot/analyze-patient/${pid}`),

    // Triage
    triageAll: () => request('/triage/all'),
    triagePatient: (pid) => request(`/triage/patient/${pid}`),
    triageCalculate: (data) => request('/triage/calculate', { method: 'POST', body: JSON.stringify(data) }),

    // Risk
    getRisk: (pid) => request(`/risk/${pid}`),
    getRiskTrend: (pid, days = 7) => request(`/risk/${pid}/trend?days=${days}`),

    // Recommendations
    getRecommendations: (data) => request('/recommendations', { method: 'POST', body: JSON.stringify(data) }),
    getPatientRecommendations: (pid) => request(`/recommendations/patient/${pid}`),

    // Drugs
    getInteractions: () => request('/drugs/interactions'),
    checkDrugs: (drugs) => request('/drugs/check', { method: 'POST', body: JSON.stringify({ drugs }) }),
    checkNewDrug: (existing, newDrug) => request('/drugs/check-new', { method: 'POST', body: JSON.stringify({ existing_drugs: existing, new_drug: newDrug }) }),
    checkPatientDrugs: (pid) => request(`/drugs/check-patient/${pid}`),

    // Similarity
    findSimilar: (pid, topN = 10) => request(`/similarity/${pid}?top_n=${topN}`),

    // Outcomes
    getOutcomes: (pid) => request(`/outcomes/${pid}`),

    // Timeline
    getTimeline: (pid) => request(`/timeline/${pid}`),
    addTimelineEvent: (data) => request('/timeline', { method: 'POST', body: JSON.stringify(data) }),

    // Follow-ups
    getFollowups: (pid) => {
        const params = pid ? `?patient_id=${pid}` : '';
        return request(`/followups${params}`);
    },
    getFollowupStats: () => request('/followups/stats'),
    createFollowup: (data) => request('/followups', { method: 'POST', body: JSON.stringify(data) }),
    completeFollowup: (id) => request(`/followups/${id}/complete`, { method: 'PUT' }),
    cancelFollowup: (id) => request(`/followups/${id}/cancel`, { method: 'PUT' }),
    getReminders: (pid) => request(`/followups/reminders/${pid}`),

    // Appointments
    getAppointments: (pid) => request(`/patients/${pid}/appointments`),

    // Dashboard
    getMetrics: () => request('/dashboard/metrics'),
    getDepartments: () => request('/dashboard/departments'),
    getAdmissions: () => request('/dashboard/admissions'),

    // Real-Time Events
    getEvents: (limit = 50, eventType = null) => {
        const params = new URLSearchParams({ limit });
        if (eventType) params.set('event_type', eventType);
        return request(`/events?${params}`);
    },

    // Alerts
    getAlerts: (limit = 50) => request(`/alerts?limit=${limit}`),
    getAlertStats: () => request('/alerts/stats'),
    acknowledgeAlert: (id) => request(`/alerts/${id}/acknowledge`, { method: 'PUT' }),

    // Staff Activity
    getStaffActivity: (limit = 50) => request(`/staff-activity?limit=${limit}`),

    // Command Center
    getCommandCenterMetrics: () => request('/command-center/metrics'),
    getPriorityQueue: (limit = 20) => request(`/command-center/priority-queue?limit=${limit}`),
    getWorkload: () => request('/command-center/workload'),

    // Live Vitals
    getLiveVitals: (pid) => request(`/vitals/${pid}/live`),
    getVitalsTrend: (pid, limit = 30) => request(`/vitals/${pid}/trend?limit=${limit}`),
    getAllLatestVitals: () => request('/vitals/all/latest'),

    // Risk History
    getRiskHistory: (pid, limit = 20) => request(`/risk/${pid}/history?limit=${limit}`),

    // AI Insights
    getAIInsights: (limit = 10) => request(`/ai-insights?limit=${limit}`),
};
