import axios from "axios";

// Always ensure /api is appended, regardless of how VITE_API_URL is set
const RAW = import.meta.env.VITE_API_URL || "http://localhost:5050";
const BASE = RAW.replace(/\/$/, "").replace(/\/api$/, "") + "/api";

const API = axios.create({
  baseURL: BASE,
});

console.log("🌐 API base URL:", BASE); // remove later

// Attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  } else {
    delete req.headers.Authorization;
  }

  return req;
});

export default API;