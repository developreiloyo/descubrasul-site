import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor: adicionar token JWT em toda requisição autenticada
api.interceptors.request.use((config) => {
  // Token salvo apenas em cookie httpOnly — lido pelo middleware
  return config;
});

// Interceptor: tratar erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se token expirado
      if (typeof window !== "undefined") {
        window.location.href = "/painel/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
