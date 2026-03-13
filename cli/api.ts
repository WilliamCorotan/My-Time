import { Config } from './config';

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export async function apiRequest<T = unknown>(
  config: Config,
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${config.endpoint}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData: any = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function clockInApi(config: Config) {
  return apiRequest(config, '/api/cli/clock-in', {
    method: 'POST',
  });
}

export async function clockOutApi(config: Config, note: string) {
  return apiRequest(config, '/api/cli/clock-out', {
    method: 'POST',
    body: JSON.stringify({ note }),
  });
}

export async function getStatusApi(config: Config) {
  return apiRequest(config, '/api/cli/status', {
    method: 'GET',
  });
}
