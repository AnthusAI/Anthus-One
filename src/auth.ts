import { buildGoogleAuthorizeUrl, encodeBase64Url, type SignInConfiguration } from "./signInUrl";

const PENDING_SIGN_IN_STORAGE_KEY = "anthus-one.pending-sign-in";
const SESSION_STORAGE_KEY = "anthus-one.session";

interface PendingSignIn { state: string; verifier: string }
interface StoredSession { accessToken: string; expiresAtMilliseconds: number }

export function readSignInConfiguration(): SignInConfiguration | null {
  const cognitoDomainUrl = import.meta.env.VITE_COGNITO_DOMAIN_URL;
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
  return cognitoDomainUrl && clientId && redirectUri ? { cognitoDomainUrl, clientId, redirectUri } : null;
}

export function readAccessToken(): string | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) ?? "null") as StoredSession | null;
    return session && session.expiresAtMilliseconds > Date.now() ? session.accessToken : null;
  } catch {
    return null;
  }
}

export async function startGoogleSignIn(configuration: SignInConfiguration): Promise<void> {
  const state = encodeBase64Url(crypto.getRandomValues(new Uint8Array(32)));
  const verifier = encodeBase64Url(crypto.getRandomValues(new Uint8Array(64)));
  const challenge = encodeBase64Url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
  sessionStorage.setItem(PENDING_SIGN_IN_STORAGE_KEY, JSON.stringify({ state, verifier } satisfies PendingSignIn));
  window.location.assign(buildGoogleAuthorizeUrl(configuration, state, challenge));
}

export async function completeSignInIfReturning(configuration: SignInConfiguration): Promise<boolean> {
  const parameters = new URLSearchParams(window.location.search);
  if (!parameters.has("code") && !parameters.has("error")) return false;
  let pending: PendingSignIn | null = null;
  try {
    pending = JSON.parse(sessionStorage.getItem(PENDING_SIGN_IN_STORAGE_KEY) ?? "null") as PendingSignIn | null;
  } catch {
    pending = null;
  }
  sessionStorage.removeItem(PENDING_SIGN_IN_STORAGE_KEY);
  window.history.replaceState({}, "", "/");
  if (!pending || parameters.get("state") !== pending.state) throw new Error("Sign-in could not be verified. Please try again.");
  const authorizationCode = parameters.get("code");
  if (parameters.has("error") || !authorizationCode) throw new Error("Sign-in was not completed.");
  const response = await fetch(new URL("/oauth2/token", configuration.cognitoDomainUrl), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", client_id: configuration.clientId, redirect_uri: configuration.redirectUri, code: authorizationCode, code_verifier: pending.verifier }),
  });
  const result = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!response.ok || !result.access_token || !result.expires_in) throw new Error("Sign-in failed. Please try again.");
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ accessToken: result.access_token, expiresAtMilliseconds: Date.now() + result.expires_in * 1000 } satisfies StoredSession));
  return true;
}

export function signOutLocally(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  window.location.assign("/");
}
