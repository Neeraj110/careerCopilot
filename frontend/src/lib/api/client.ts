import axios from "axios";
import { dispatchAppToast } from "../toast-events";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1` : "http://localhost:7000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const message =
      status >= 500
        ? "Something went wrong. Please try again."
        : err.response?.data?.message ||
          err.response?.data?.error?.message ||
          "Unable to connect to the server. Check your connection and try again.";
    dispatchAppToast({
      title: status >= 500 ? "Server error" : "Request failed",
      description: message,
      variant: "error",
    });
    return Promise.reject({
      status,
      message,
      details: err.response?.data?.error?.details,
      original: err,
    });
  },
);
