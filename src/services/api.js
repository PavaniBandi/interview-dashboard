const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = {
  // Panelists
  async getPanelists() {
    const response = await fetch(`${API_BASE_URL}/panelists`);
    if (!response.ok) throw new Error('Failed to fetch panelists');
    return response.json();
  },

  async createPanelist(panelist) {
    const response = await fetch(`${API_BASE_URL}/panelists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(panelist),
    });
    if (!response.ok) throw new Error('Failed to create panelist');
    return response.json();
  },

  async updatePanelist(id, updates) {
    const response = await fetch(`${API_BASE_URL}/panelists/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update panelist');
    return response.json();
  },

  async deletePanelist(id) {
    const response = await fetch(`${API_BASE_URL}/panelists/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete panelist');
    return response.json();
  },

  // Interviews
  async getInterviews() {
    const response = await fetch(`${API_BASE_URL}/interviews`);
    if (!response.ok) throw new Error('Failed to fetch interviews');
    return response.json();
  },

  async createInterview(interview) {
    const response = await fetch(`${API_BASE_URL}/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(interview),
    });
    if (!response.ok) throw new Error('Failed to create interview');
    return response.json();
  },

  async deleteInterview(id) {
    const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete interview');
    return response.json();
  },
};

export default api;

