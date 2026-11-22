import axios from 'axios';

// Stateless API client — no auth tokens or local storage tracking
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8085',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
