import type { ImageData } from '../types';

const API_BASE_URL = '';

// These functions will automatically include credentials (cookies)
// because the server.js is configured with CORS `credentials: true`.

export const login = async (credential: string) => {
  const response = await fetch(`${API_BASE_URL}/api/session/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(errorData.error);
  }
  return response.json();
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Logout failed' }));
    throw new Error(errorData.error);
  }
  return response.json();
};

export const getMe = async () => {
  const response = await fetch(`${API_BASE_URL}/api/me`, {
    credentials: 'include',
  });
  if (response.status === 401) {
    return null; // This is an expected case for a user that is not logged in.
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch user' }));
    throw new Error(errorData.error);
  }
  return response.json();
};

export const generateImage = async (
  location: ImageData | string,
  selfieImage: ImageData
) => {
    const body: {
        selfie: { base64: string; mimeType: string };
        location?: { base64: string; mimeType: string };
        locationPrompt?: string;
    } = {
        selfie: { base64: selfieImage.base64, mimeType: selfieImage.mimeType },
    };

    if (typeof location === 'string') {
        body.locationPrompt = location;
    } else {
        body.location = { base64: location.base64, mimeType: location.mimeType };
    }

    const response = await fetch(`${API_BASE_URL}/api/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred during image generation.' }));
        throw new Error(errorData.error || 'Image generation failed.');
    }

    return response.json();
};