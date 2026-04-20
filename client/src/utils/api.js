
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user')); // Depending on how we stored it. The previous code saved "accessToken" inside the user object in redux or localStorage?
        // Let's check how Login.jsx saved it.
        // Actually, let's wait to see Login.jsx implementation. 
        // Assuming we store token in localStorage for now as 'token' or inside a user object.
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
