import axios, { AxiosInstance } from "axios";

const API_URL = "http://localhost:3009";

// Create an Axios instance
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Utility to get default headers with optional authorization
export const getDefaultHeaders = (isAuthRequired: boolean = false, tokenKey?: string) => {
  const headers: Record<string, string> = {};

  if (isAuthRequired && tokenKey) {
    const token = localStorage.getItem(tokenKey);
    if (!token) throw new Error("Invalid token");
    headers["Authorization"] = token;
  }

  return headers;
};


export const fetchData = async (
    endpoint: string,
    options: { method: "GET" | "POST" | "PUT" | "DELETE"; data?: any; isAuthRequired?: boolean; tokenKey?: string },
    errorMessage: string
  ) => {
    try {
      const { method, data, isAuthRequired, tokenKey } = options;
  
      const response = await axiosInstance.request({
        url: endpoint,
        method,
        data,
        headers: getDefaultHeaders(isAuthRequired, tokenKey),
      });
  
      return response.data; 
    } catch (error: any) {
      const errorData = error.response?.data || error.message;
      console.error(errorMessage, errorData);
      throw new Error(errorData.message || errorMessage);
    }
  };