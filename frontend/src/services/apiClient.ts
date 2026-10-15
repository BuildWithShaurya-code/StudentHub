/**
 * Centralized API Client for StudentHub
 * Connects frontend screens to Python Flask REST API and MySQL database.
 */

// Default to Flask backend on port 5001 (port 5000 is reserved on macOS by AirPlay)
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  'http://127.0.0.1:5001/api';

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

class ApiClient {
  private baseUrl: string;
  private pendingRequests: Set<string> = new Set();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Generic HTTP request handler with JSON parsing, error normalization,
   * and in-flight duplicate submission prevention.
   */
  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const method = (options.method || 'GET').toUpperCase();
    const requestId = `${method}:${url}`;

    // Prevent duplicate mutations (POST, PUT, DELETE) while already in progress
    if (method !== 'GET' && this.pendingRequests.has(requestId)) {
      throw new Error(`A ${method} request to this resource is already in progress. Please wait.`);
    }

    if (method !== 'GET') {
      this.pendingRequests.add(requestId);
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON or empty responses
      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch {
          data = null;
        }
      } else {
        const text = await response.text();
        data = { message: text };
      }

      // Check HTTP status code
      if (!response.ok) {
        const errorMsg =
          data?.message ||
          data?.error ||
          `Server returned HTTP ${response.status}: ${response.statusText}`;
        throw new ApiError(errorMsg, response.status);
      }

      return data as T;
    } catch (err: any) {
      // Differentiate between network connection failure and API error responses
      if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
        throw new Error(
          `Cannot reach Flask backend at ${this.baseUrl}. Please verify the Python backend is running on port 5001.`
        );
      }
      throw err;
    } finally {
      if (method !== 'GET') {
        this.pendingRequests.delete(requestId);
      }
    }
  }

  public get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
