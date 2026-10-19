export interface SignInConfiguration {
  cognitoDomainUrl: string;
  clientId: string;
  redirectUri: string;
}

export function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function buildGoogleAuthorizeUrl(configuration: SignInConfiguration, state: string, codeChallenge: string): URL {
  const destination = new URL("/oauth2/authorize", configuration.cognitoDomainUrl);
  destination.search = new URLSearchParams({
    client_id: configuration.clientId,
    identity_provider: "Google",
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: configuration.redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  }).toString();
  return destination;
}
