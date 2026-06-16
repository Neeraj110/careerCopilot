import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : "http://localhost:7000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error?.message ||
      err.message ||
      "Request failed";
    return Promise.reject({
      status: err.response?.status,
      message,
      details: err.response?.data?.error?.details,
      original: err,
    });
  },
);
