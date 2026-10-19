import assert from "node:assert/strict";
import test from "node:test";
import { buildGoogleAuthorizeUrl, encodeBase64Url } from "../src/signInUrl";

test("authorize URL asks Cognito for Google with PKCE", () => {
  const url = buildGoogleAuthorizeUrl({ cognitoDomainUrl: "https://login.example.test", clientId: "client-1", redirectUri: "https://1.anth.us/" }, "state-1", "challenge-1");
  assert.equal(url.origin, "https://login.example.test");
  assert.equal(url.pathname, "/oauth2/authorize");
  assert.equal(url.searchParams.get("identity_provider"), "Google");
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.equal(url.searchParams.get("redirect_uri"), "https://1.anth.us/");
  assert.equal(url.searchParams.get("state"), "state-1");
});

test("base64url encoding has no padding or unsafe characters", () => {
  assert.equal(encodeBase64Url(new Uint8Array([251, 255, 254])), "-__-");
});
