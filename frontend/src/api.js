// Every request to the backend goes through this file.
//
// The backend address comes from the REACT_APP_API_URL environment variable
// (set it in Vercel for the deployed site). Locally it falls back to http://localhost:4000.
import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Use it like axios:  api.get('/admin/startups'),  api.post('/auth/login', { email, password })
const api = axios.create({ baseURL: API_URL });

// Reads the error message sent by the backend, e.g. { message: 'Invalid password' }
export function getErrorMessage(error) {
  return error.response?.data?.message || 'Could not reach the server. Please try again.';
}

export default api;
