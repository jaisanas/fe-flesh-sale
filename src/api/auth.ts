import axios from 'axios';
import { API_BASE_URL, STATIC_DEV_TOKEN } from '../config';
import type { AuthTokens, LoginResponse } from '../types';

const devHeaders = {
  Authorization: `Bearer ${STATIC_DEV_TOKEN}`,
};

export async function registerUser(
  username: string,
  password: string
): Promise<void> {
  await axios.post(
    `${API_BASE_URL}/users`,
    { username, password },
    { headers: devHeaders }
  );
}

export async function loginUser(
  username: string,
  password: string
): Promise<AuthTokens> {
  const { data } = await axios.post<LoginResponse & Record<string, string>>(
    `${API_BASE_URL}/users/login`,
    { username, password }
  );
  const accessToken = data.accessToken ?? data.access_token;
  const refreshToken = data.refreshToken ?? data.refresh_token;
  if (!accessToken || !refreshToken) {
    throw new Error('Invalid login response: missing tokens');
  }
  return { accessToken, refreshToken };
}
