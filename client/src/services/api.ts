import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 20_000,
});

export interface ApiError {
  status: number;
  message: string;
  fields?: Record<string, string[] | undefined>;
}

const FALLBACKS: Record<number, string> = {
  400: 'Some of the information looks invalid. Please check and try again.',
  401: 'Please log in to continue.',
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  409: 'That already exists.',
  429: 'Too many requests. Please wait a moment.',
  500: 'Something went wrong on our side. Please try again.',
};

/** Turns any thrown value into a safe, user-friendly error. */
export function toApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data = err.response?.data as { message?: string; details?: ApiError['fields'] } | undefined;
    const fallback = status === 0 ? 'Cannot reach the server. Check your connection.' : FALLBACKS[status] ?? FALLBACKS[500];
    return { status, message: data?.message ?? fallback, fields: data?.details };
  }
  return { status: 0, message: 'Something went wrong. Please try again.' };
}

/** A 401 on a normal request means the session ended: tell the AuthContext. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && !String(error.config?.url).startsWith('/auth/')) {
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);
