class ApiClient {
  constructor() {
    this.baseURL = '/api';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Add auth token if available
    const token = auth?.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET'
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  async upload(endpoint, formData) {
    const token = auth?.getToken();
    const config = {
      method: 'POST',
      body: formData
    };

    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      };
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
}

// Global API instance
const api = new ApiClient();

// Specific API methods for different resources
const messageAPI = {
  async generate(data) {
    return api.post('/messages/generate', data);
  },

  async save(data) {
    return api.post('/messages/save', data);
  },

  async getAll(params = {}) {
    return api.get('/messages', params);
  },

  async getById(id) {
    return api.get(`/messages/${id}`);
  },

  async update(id, data) {
    return api.put(`/messages/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/messages/${id}`);
  },

  async improve(id, feedback) {
    return api.post(`/messages/${id}/improve`, { feedback });
  }
};

const templateAPI = {
  async getAll(params = {}) {
    return api.get('/templates', params);
  },

  async getById(id) {
    return api.get(`/templates/${id}`);
  },

  async create(data) {
    return api.post('/templates', data);
  },

  async update(id, data) {
    return api.put(`/templates/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/templates/${id}`);
  },

  async getCategories() {
    return api.get('/templates/categories');
  },

  async getPopular() {
    return api.get('/templates/popular/trending');
  }
};

const guidelinesAPI = {
  async getAll(params = {}) {
    return api.get('/guidelines', params);
  },

  async getActive() {
    return api.get('/guidelines/active');
  },

  async getById(id) {
    return api.get(`/guidelines/${id}`);
  },

  async create(data) {
    return api.post('/guidelines', data);
  },

  async update(id, data) {
    return api.put(`/guidelines/${id}`, data);
  },

  async delete(id) {
    return api.delete(`/guidelines/${id}`);
  },

  async activate(id) {
    return api.post(`/guidelines/${id}/activate`);
  },

  async upload(formData) {
    return api.upload('/guidelines/upload', formData);
  }
};

const integrationAPI = {
  async send(data) {
    return api.post('/integrations/send', data);
  },

  async testConnection(data) {
    return api.post('/integrations/test-connection', data);
  },


  async getUserIntegrations() {
    return api.get('/integrations/user-integrations');
  },

  async updateUserIntegrations(data) {
    return api.put('/integrations/user-integrations', data);
  },

  async schedule(data) {
    return api.post('/integrations/schedule', data);
  },

  async getDeliveryStatus(messageId) {
    return api.get(`/integrations/delivery-status/${messageId}`);
  }
};