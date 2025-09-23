// frontend/src/services/api.js
import axios from 'axios';

// Create an Axios instance with a base URL
const api = axios.create({
    baseURL: '/api',
});

// Attach the token on every request, before every request is sent
api.interceptors.request.use(config => {
    // Look for a saved JWT token in localStorage
    const token = localStorage.getItem('token');
    // If a token exists, add it to the Authorization header
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// This runs after every response is received
api.interceptors.response.use(
    // If the response is successful, just return it
    response => response,
    // If an error occurs, check if it's a 401 Unauthorized error
    error => {
        if (error.response?.status === 401) {
            // clear stored auth and send back to login
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
