import { useEffect, useState } from "react";
import { completeSignInIfReturning, readAccessToken, readSignInConfiguration, signOutLocally, startGoogleSignIn } from "./auth";

const signInConfiguration = readSignInConfiguration();

export function App() {
  const [signedIn, setSignedIn] = useState(() => Boolean(readAccessToken()));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!signInConfiguration) return;
    completeSignInIfReturning(signInConfiguration)
      .then((completed) => { if (completed) setSignedIn(true); })
      .catch((cause: Error) => setErrorMessage(cause.message));
  }, []);

  if (signedIn) {
    return (
      <main>
        <p className="eyebrow">Anthus One</p>
        <h1>You are signed in</h1>
        <p>Your accounts will appear here soon.</p>
        <button className="quiet" onClick={signOutLocally}>Sign out</button>
      </main>
    );
  }

  return (
    <main>
      <p className="eyebrow">Anthus</p>
      <h1>Anthus One</h1>
      <p>One account for every Anthus system.</p>
      {errorMessage && <p role="alert" className="error">{errorMessage}</p>}
      {signInConfiguration
        ? <button onClick={() => void startGoogleSignIn(signInConfiguration).catch((cause: Error) => setErrorMessage(cause.message))}>Continue with Google</button>
        : <p>Sign-in has not been configured yet.</p>}
    </main>
  );
}
