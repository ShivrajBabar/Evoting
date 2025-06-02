
import axios from 'axios';

// Base URL for API
const API_BASE_URL = '/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const AuthService = {
  login: async (email, password, role) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password, role });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// User Services
export const UserService = {
  getAllUsers: async (role) => {
    try {
      const response = await apiClient.get('/users', { params: { role } });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getUserById: async (id) => {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateUser: async (id, userData) => {
    try {
      const response = await apiClient.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateUserStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await apiClient.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Election Services
export const ElectionService = {
  getAllElections: async (filters) => {
    try {
      const response = await apiClient.get('/elections', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getElectionById: async (id) => {
    try {
      const response = await apiClient.get(`/elections/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createElection: async (electionData) => {
    try {
      const response = await apiClient.post('/elections', electionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateElection: async (id, electionData) => {
    try {
      const response = await apiClient.put(`/elections/${id}`, electionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteElection: async (id) => {
    try {
      const response = await apiClient.delete(`/elections/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Candidate Services
export const CandidateService = {
  getAllCandidates: async (filters) => {
    try {
      const response = await apiClient.get('/candidates', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getCandidateById: async (id) => {
    try {
      const response = await apiClient.get(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createCandidate: async (candidateData) => {
    try {
      const response = await apiClient.post('/candidates', candidateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCandidate: async (id, candidateData) => {
    try {
      const response = await apiClient.put(`/candidates/${id}`, candidateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateCandidateStatus: async (id, status) => {
    try {
      const response = await apiClient.patch(`/candidates/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteCandidate: async (id) => {
    try {
      const response = await apiClient.delete(`/candidates/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Voting Services
export const VotingService = {
  castVote: async (electionId, candidateId, boothId) => {
    try {
      const response = await apiClient.post('/votes/cast', { 
        election_id: electionId, 
        candidate_id: candidateId,
        booth_id: boothId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getVoterStatus: async (electionId) => {
    try {
      const response = await apiClient.get(`/votes/status/${electionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Result Services
export const ResultService = {
  getAllResults: async (filters) => {
    try {
      const response = await apiClient.get('/results', { params: filters });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getResultById: async (id) => {
    try {
      const response = await apiClient.get(`/results/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  publishResult: async (id, publish) => {
    try {
      const response = await apiClient.patch(`/results/${id}/publish`, { published: publish });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  generateResults: async (electionId, constituencyId) => {
    try {
      const response = await apiClient.post('/results/generate', { 
        election_id: electionId,
        constituency_id: constituencyId
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default {
  AuthService,
  UserService,
  ElectionService,
  CandidateService,
  VotingService,
  ResultService,
};
