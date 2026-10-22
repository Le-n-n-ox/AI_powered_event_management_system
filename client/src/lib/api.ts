import { supabase } from "./supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Calls the backend API with the current user's access token attached.
 * Used for the things the browser must not do on its own: M-Pesa prompts
 * (they need the Daraja secrets) and admin account actions.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Can't reach the server. Check that the backend is running.",
      0,
      "offline",
    );
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      body?.error || `Request failed (${response.status})`,
      response.status,
      body?.code,
    );
  }

  return body as T;
}
