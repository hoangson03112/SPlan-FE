import axios, { AxiosError } from "axios";

export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiErrorPayload {
  statusCode: number;
  timestamp: string;
  path: string;
  message: string[];
}

export class ApiError extends Error {
  statusCode: number;
  messages: string[];

  constructor(payload: ApiErrorPayload) {
    super(payload.message?.[0] ?? "Đã có lỗi xảy ra");
    this.statusCode = payload.statusCode;
    this.messages = payload.message ?? [this.message];
  }
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>;
    response.data = envelope?.data;
    return response;
  },
  (error: AxiosError<ApiErrorPayload>) => {
    if (error.response?.data) {
      return Promise.reject(new ApiError(error.response.data));
    }
    return Promise.reject(error);
  },
);
