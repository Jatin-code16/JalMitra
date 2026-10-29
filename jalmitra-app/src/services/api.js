// src/services/api.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Backend URL comes from EXPO_PUBLIC_API_URL (see .env.example) ──
// Physical phone: your computer's LAN IP (ipconfig / ifconfig)
// Android emulator: http://10.0.2.2:8000 · iOS simulator / web: localhost
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'hi',
  },
});

// ── Auto-attach token to every request ──
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('jalmitra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto-handle 401 (token expired) ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('jalmitra_token');
    }
    return Promise.reject(error);
  }
);


// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────

export const authAPI = {
  sendOTP: (phone) =>
    api.post('/auth/send-otp', { phone }),

  verifyOTP: (phone, otp, name) =>
    api.post('/auth/verify-otp', { phone, otp, name }),

  getProfile: () =>
    api.get('/auth/profile'),

  updateProfile: (data) =>
    api.put('/auth/profile', data),
};


// ─────────────────────────────────────────
// SENSORS
// ─────────────────────────────────────────

export const sensorAPI = {
  getLatest: (farmId) =>
    api.get(`/sensors/latest?farm_id=${farmId}`),

  getHistory: (farmId, from=null, to=null) => {
    let url = `/sensors/history?farm_id=${farmId}`;
    if (from) url += `&from=${from}`;
    if (to) url += `&to=${to}`;
    return api.get(url);
  },
};


// ─────────────────────────────────────────
// PUMP
// ─────────────────────────────────────────

export const pumpAPI = {
  getStatus: (farmId) =>
    api.get(`/pump/status?farm_id=${farmId}`),

  control: (farmId, action, duration = 30) =>
    api.post('/pump/control', {
      farm_id: farmId,
      action,
      duration_minutes: duration,
      triggered_by: 'farmer',
    }),

  getHistory: (farmId, limit = 10) =>
    api.get(`/pump/history?farm_id=${farmId}&limit=${limit}`),
};


// ─────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────

export const analyticsAPI = {
  getRecommendation: (farmId) =>
    api.get(`/analytics/recommendation?farm_id=${farmId}`),

  getWeekly: (farmId) =>
    api.get(`/analytics/weekly?farm_id=${farmId}`),
};


// ─────────────────────────────────────────
// CHATBOT
// ─────────────────────────────────────────

export const chatAPI = {
  sendMessage: (userId, farmId, message) =>
    api.post('/chat/message', {
      user_id: userId,
      farm_id: farmId,
      message,
      language: 'hi',
    }),

  getHistory: (userId, limit = 20) =>
    api.get(`/chat/history?user_id=${userId}&limit=${limit}`),

  getSuggestions: (farmId) =>
    api.get(`/chat/suggestions?farm_id=${farmId}`),
};

export default api;