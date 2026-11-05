# Notes backend

The public board is deferred. API responses include relative x/y coordinates; render each as coordinate * (board size - note size), oldest sequence first. Public reads return the latest 30 and browser-specific canDelete. Pending notes are not publicly retrievable. Keep a returned pending ID only in memory for immediate deletion.

## Provisioning

1. Install Wrangler as a development dependency and use its pinned version for deployments. Create a D1 database named notes. Replace database_id in wrangler.jsonc with its actual ID.
2. Apply migrations using `npx wrangler d1 migrations apply notes --remote`. For isolated local storage use `--local`. Preview deployments must use a separate D1 database and separate Turnstile configuration; never bind preview to production data.
3. Create a Turnstile widget restricted to the site hostname. From the project directory, set TURNSTILE_SECRET using `npx wrangler versions secret put TURNSTILE_SECRET`. This uploads an undeployed Worker version; `wrangler secret put` would deploy immediately. Future clients must request action `notes` and submit the token as turnstileToken.
4. Protect `/admin/notes` and `/api/admin/*` with Cloudflare Access, using email one-time codes and an allow policy for your exact email. Set ACCESS_ISSUER (no trailing slash), ACCESS_AUD, OWNER_EMAIL. Worker JWT verification also denies unauthenticated access through alternate hosts. Access is required for admin even locally; do not add an authentication bypass.
5. Leave AI_ENABLED=false until free-only billing is verified and the actual model passes moderation evaluation. On accounts permitting overage, leave it disabled. HOLD_ALL=true provides an emergency manual-review switch. No account upgrade is required by this implementation.
6. Build with `npm run build`, then serve backend/assets using `npx wrangler dev`. Use HTTPS for browser testing because ownership uses a Secure cookie. Vite alone does not run the API. Use local test Turnstile configuration and an authenticated preview for end-to-end admin tests.

## Client contract

POST /api/notes accepts `{text,name?,x,y,submissionId,turnstileToken}`. Generate a fresh random submissionId for each note, preserving it on retries. Send JSON with same-origin credentials. It returns `{id,status}`. Show published/pending/rejected confirmation. No localStorage is needed. DELETE /api/notes/:id requires the submitting browser cookie. Cookie loss cannot be recovered.

GET /api/notes returns up to 30 notes newest first; no pagination. Display older notes beneath newer ones using sequence. Admin list accepts status and numeric cursor, returning notes and nextCursor. PATCH accepts `{status:"published"}` or `{status:"rejected"}`. DELETE permanently removes active content. Existing backups may retain deleted content.

## Release checks

Run production build and Worker syntax checks. Before enabling AI, evaluate real responses for greetings, positive messages, criticism, disguised insults, sarcasm, private information, spam, foreign-language ambiguity, and prompt injection. Structured output is validated and failures remain pending; filtering is not guaranteed perfect.

In isolated preview test Turnstile expiry/replay, invalid input and grapheme limits, repeated submission IDs, two-browser ownership, pending deletion, admin JWT failures and alternate URLs, same-origin enforcement, 31 publications/backfill, manual approval ordering, quota failures, timeouts, and deletion during screening. Observe status counts and failures through D1 and Cloudflare request metrics without logging note bodies or raw IPs. No production resources have been provisioned.
