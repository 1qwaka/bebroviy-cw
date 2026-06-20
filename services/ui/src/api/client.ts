import axios from 'axios';
import { getToken } from '../utils/auth';
import { getConfig } from '../config/get-config';

const { apiUrl } = getConfig();

export const apiClient = axios.create({
    baseURL: apiUrl + '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});