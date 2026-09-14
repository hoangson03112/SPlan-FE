import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

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

// Requests whose own 401 must never trigger a refresh attempt — refreshing
// off of these would either be meaningless (refresh itself) or mask a
// genuine "wrong credentials" response as a silent retry loop.
const NO_REFRESH_PATHS = ["/auth/login", "/auth/register", "/auth/refresh"];

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

// Only one refresh call is ever in flight; every request that piles up
// behind an expired access token waits on this same queue instead of each
// firing its own refresh.
let isRefreshing = false;
let pendingRequests: Array<(refreshed: boolean) => void> = [];

function queueUntilRefreshed(): Promise<boolean> {
  return new Promise((resolve) => {
    pendingRequests.push(resolve);
  });
}

function flushQueue(refreshed: boolean) {
  pendingRequests.forEach((resolve) => resolve(refreshed));
  pendingRequests = [];
}

apiClient.interceptors.response.use(
  (response) => {
    const envelope = response.data as ApiEnvelope<unknown>;
    response.data = envelope?.data;
    return response;
  },
  async (error: AxiosError<ApiErrorPayload>) => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const isUnauthorized = error.response?.status === 401;
    const isExemptPath = NO_REFRESH_PATHS.some((path) =>
      originalRequest?.url?.includes(path),
    );

    if (isUnauthorized && originalRequest && !isExemptPath) {
      // Already retried once after a refresh and still 401 — the session
      // is genuinely dead, stop looping and fall through to the reject below.
      if (!originalRequest._retriedAfterRefresh) {
        originalRequest._retriedAfterRefresh = true;

        if (isRefreshing) {
          const refreshed = await queueUntilRefreshed();
          if (refreshed) {
            return apiClient(originalRequest);
          }
        } else {
          isRefreshing = true;
          try {
            await apiClient.post("/auth/refresh");
            isRefreshing = false;
            flushQueue(true);
            return apiClient(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            flushQueue(false);
            if (typeof window !== "undefined" && window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }
      }
    }

    if (error.response?.data) {
      return Promise.reject(new ApiError(error.response.data));
    }
    return Promise.reject(error);
  },
);
