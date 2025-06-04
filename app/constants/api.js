// Nếu test trên điện thoại thật: dùng IP LAN của máy tính
//export const API_URL = "http://192.168.137.1:3000";

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
    UPDATE_PASSWORD: (id) => `${API_URL}/api/v1/users/${id}/password`,
  },
};