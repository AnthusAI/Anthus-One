# Anthus One

The customer account portal at 1.anth.us: one account for every Anthus system. Customers sign in with Google, manage their accounts and members, and launch into the products their account has.

Anthus One has no account or membership data of its own. [Prospectus](https://github.com/AnthusAI/Prospectus) is the single account service; the design is in `docs/accounts/ANTHUS_ONE_PORTAL.md` there and work is tracked in Prospectus Kanbus epic kanbus-78d27014.

## Develop

```sh
npm ci
npm run dev        # http://127.0.0.1:5430
npm run typecheck
npm test
npm run build
```

Sign-in is configured at build time with `VITE_COGNITO_DOMAIN_URL`, `VITE_COGNITO_CLIENT_ID` and `VITE_COGNITO_REDIRECT_URI`. Without them the shell says sign-in is not configured.
