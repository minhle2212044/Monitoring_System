// Nếu test trên điện thoại thật: dùng IP LAN của máy tính
export const API_URL = "http://192.168.137.1:3000";

// Định nghĩa các endpoint
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_URL}/auth/signin`,
    REGISTER: `${API_URL}/auth/signup`,
    REFRESH: `${API_URL}/auth/refresh`,
    VERIFY_TOKEN: `${API_URL}/api/auth/verify-token`,
  },
  // User endpoints
  USER: {
    GET_ALL: `${API_URL}/api/v1/users`,
    GET_BY_ID: (id) => `${API_URL}/api/v1/users/${id}`,
    UPDATE: (id) => `${API_URL}/api/v1/users/${id}`,
    DELETE: (id) => `${API_URL}/api/v1/users/${id}`,
    UPDATE_PASSWORD: (id) => `${API_URL}/api/v1/users/${id}/change-password`,
  },
  // Notice endpoints
  NOTICE: {
    GET_BY_USER: (userId) => `${API_URL}/api/v1/notice/${userId}`,
    MARK_AS_READ: (id) => `${API_URL}/api/v1/notice/${id}/read`,
    CREATE: `${API_URL}/api/v1/notice`,
    CREATE_WARNING_IF_NEEDED: `${API_URL}/api/v1/notice/warning`,
  },
  HISTORY: {
    GET: `${API_URL}/api/v1/history`, // Sử dụng query params: ?userId=...&type=...&startDate=...&endDate=...&page=...&pageSize=...
  },
  // Activity endpoints
  ACTIVITY: {
    GET_ALL: `${API_URL}/activity`, // query: ?page=1&pageSize=20
    GET_SUGGESTED: (userId, page = 1, pageSize = 20) =>
      `${API_URL}/api/v1/activity/suggested?userId=${userId}&page=${page}&pageSize=${pageSize}`,
  },
  COREIOT: {
    FETCH_FROM_COREIOT: (userId, token) => `${API_URL}/api/v1/coreiot/${userId}/fetch?token=${token}`,
    SEND_TELEMETRY: (deviceId) => `${API_URL}/api/v1/coreiot/${deviceId}/send`,
    GET_LOCAL_DATA: (userId) => `${API_URL}/api/v1/coreiot/${userId}/data`,
  },
};