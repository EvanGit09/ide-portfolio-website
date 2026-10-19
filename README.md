# ide-portfolio-website

Corey Birnie's portfolio at [coreybirnie.com](https://coreybirnie.com): a VS Code-style site (Dracula theme) with an AI agent chat in the side panel.

## How it fits together

| Part | Where | Notes |
|---|---|---|
| Editor shell | `index.html`, `js/`, `css/` | Vanilla JS, bundled by Vite |
| Chat panel | `src/chat/` | React 19 + assistant-ui primitives, lazy-loaded into `#chat-root` |
| Chat API | `api/chat.ts` → `server/chat/` | Vercel Node function using AI SDK v7 and OpenRouter (`@preset/free`) |
| Static files | `public/` | CV PDF, profile photo, `robots.txt`, `sitemap.xml` |

The browser only ever talks to `/api/chat`. The OpenRouter key lives in the server environment and is never sent to the client. The server builds the system prompt from `server/chat/cv.ts`, so visitors can ask about Corey's experience as well as general questions.

## Local development

Requires Node 24 (`nvm use`).

```bash
npm install
cp .env.example .env   # then set OPENROUTER_API_KEY
npm run dev            # site + /api/chat on http://localhost:5173
```

## Tests

```bash
npm test               # unit + integration (Vitest)
npm run coverage       # coverage report, 80% threshold
npm run typecheck
npm run test:e2e       # Playwright, desktop + mobile, with a mocked /api/chat
```

Live smoke test against the real model (uses 2 OpenRouter requests):

```bash
LIVE_CHAT=1 E2E_SERVER_CMD="npm run dev -- --port 5174 --strictPort" \
  E2E_BASE_URL=http://localhost:5174 npx playwright test chat.live --project desktop
```

## Updating the CV

The PDF and the chat's knowledge are separate. When the CV changes:

1. Replace `public/assets/Corey_Birnie_CV.pdf`.
2. Update `server/chat/cv.ts` to match. Leave out the phone number and home address; `cv.test.ts` fails if either appears.

## Chat limits and protection

| Control | Where | Setting |
|---|---|---|
| Rate limit per IP | Vercel Firewall rule (dashboard) | 6 requests / 60 s on `POST /api/chat` |
| Bot protection | Vercel BotID (`botid` package + `vercel.json` rewrites) | Basic mode |
| Request validation | `server/chat/validate-request.ts` | 64 KB body, 2,000 chars per user message, text parts only, last 12 messages |
| Model output | `server/chat/config.ts` | 800 tokens, 1 retry, 50 s upstream timeout |
| Daily quota | OpenRouter | 1,000 free-model requests per day (with $10+ credit) |

### Content Security Policy

The policy lives in `vercel.json` as a `Content-Security-Policy-Report-Only` header on `/` and `/index.html` only. It is kept off the CV PDF because a CSP on that response can break Chrome's PDF viewer. `vite preview` reads the same policy through `server/dev/csp.ts` and enforces it, so `npm run test:e2e` fails on any violation (`tests/e2e/csp.spec.ts`).

Check the deployed site (records violations, never run in CI):

```bash
PROD_CSP_URL=https://coreybirnie.com npx playwright test -c playwright.prod.config.ts
```

To enforce the policy, rename the header key to `Content-Security-Policy` on both `vercel.json` rules, then redeploy. Run the prod check first and confirm it reports no violations.

## Deploying to Vercel

The site moved from GitHub Pages to Vercel so the chat API can keep the key server-side. Follow these steps in order. GitHub Pages keeps serving the old site until the DNS change in step 9, so nothing goes down while you set up.

### OpenRouter (once)

1. Add at least $10 of credit. This raises the free-model limit from 50 to 1,000 requests per day.
2. Lower this API key's spend limit to about $1, so a paid model added to the preset by mistake cannot run up a bill.
3. In the `free` preset, add 2 or 3 fallback `:free` models. Individual free providers often return 429 or 502.

### Create the Vercel project

4. Sign in at [vercel.com](https://vercel.com) with GitHub (Hobby plan is fine for a personal site).
5. **Add New → Project →** import `EvanGit09/ide-portfolio-website`.
   - Framework preset: **Vite** (build `vite build`, output `dist`). `vercel.json` sets this too.
   - Environment variable: `OPENROUTER_API_KEY`, type **Secret**, for Production and Preview.
   - If the first production build of `main` fails before the chat branch is merged, ignore it. DNS still points at GitHub Pages.
6. **Firewall → Configure → New Rule:** if *Request Path* equals `/api/chat` and *Method* equals `POST`, then **Rate Limit**: fixed window, 60 s, 6 requests, key **IP**, action **429**. Publish the rule.
7. Open the pull request's preview deployment and try the chat. Previews sit behind Vercel login by default, so strangers cannot use up the quota there.
8. Merge the pull request, then test the production `*.vercel.app` URL: chat replies, the CV PDF, and the mobile layout.

### Move the domain

9. In **Settings → Domains**, add `coreybirnie.com` and `www.coreybirnie.com`. Make the apex domain primary and redirect `www` to it, because the canonical URL, Open Graph tags and sitemap all use `https://coreybirnie.com`.
10. Optional, for no HTTPS gap: choose **Pre-generate SSL certificate** and add the `_acme-challenge` TXT record it shows at Spaceship before changing anything else.
11. At **Spaceship → Advanced DNS → coreybirnie.com**:
    - Delete the four GitHub Pages A records (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).
    - Delete the `www` CNAME pointing to `evangit09.github.io`.
    - Add an **A** record for `@` with the IP shown on Vercel's domain card (for example `76.76.21.21` or `216.198.79.1`; use exactly what Vercel shows).
    - Add a **CNAME** for `www` with the project-specific value Vercel shows (it looks like `xxxx.vercel-dns-0xx.com`).
    - Use a TTL of 300 s or the lowest offered. Remove any AAAA records, and check that no CAA record blocks Let's Encrypt.
12. Wait until Vercel shows **Valid Configuration** and an issued certificate. Then check `curl -I https://coreybirnie.com` returns `server: Vercel`.

### Retire GitHub Pages (only after step 12)

13. In the GitHub repo, **Settings → Pages → Unpublish site**.
14. Delete the `CNAME` file from the repo root and push.

Do not unpublish Pages while DNS still points at GitHub: someone else could claim the domain on GitHub Pages in that window. Until step 13, restoring the old DNS records brings the GitHub Pages site back.

### Check the protection after go-live

These checks do not use any OpenRouter quota when the protection works.

```bash
# BotID: a scripted request should be rejected with 403 "Request blocked."
curl -i -X POST https://coreybirnie.com/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"id":"1","role":"user","parts":[{"type":"text","text":"hi"}]}]}'

# Firewall: the 7th request inside a minute should return 429
for i in $(seq 1 7); do
  curl -s -o /dev/null -w '%{http_code}\n' -X POST https://coreybirnie.com/api/chat \
    -H 'content-type: application/json' -d '{}'
done
```

If the first command streams a reply instead of returning 403, BotID is not active. Search the function logs in Vercel for `bot-check-failed` to see why. The chat still works in that case; it is only less protected.
