# Free online demonstration: GitHub + Render

## Current state

The app is prepared and locally tested for a free hosted demonstration. Its source repository is [amarsiddamshetty-maker/xss-shield](https://github.com/amarsiddamshetty-maker/xss-shield). GitHub access and write permission have been verified, and both provider toolsets are now available. **The hosted application has not yet been deployed and verified.** A real public Render URL will be recorded here only after successful deployment and verification.

Recommended names:

- GitHub repository: `xss-shield`.
- Render web service: `xss-shield-demo` (Render may require another available name).
- Plan: **Free**. Use the supplied `onrender.com` address; no custom domain is necessary.

## What the free demo includes

The complete React frontend, Express API, server-side DOMPurify/jsdom sanitization, SQLite activity, learning laboratory, dashboard, and PDF reports all run on one Render web service. GitHub stores source code; GitHub Pages is not used.

Free Render services sleep after 15 minutes without traffic and take about one minute to wake. SQLite history is temporary and is lost on sleep, restart, or redeploy. This mode keeps only the latest 500 shared events, and totals describe those retained events. Anyone with the URL can see sanitized submissions, so the interface displays a prominent warning and should only receive harmless sample content. Raw inputs are not saved. Download a PDF before leaving a demonstration if you want to keep its results.

Render grants a monthly allowance of free instance hours and also applies bandwidth/build usage limits. Use the Free service plan; the included configuration does not provision a paid disk, database, or other service. Provider account verification may still be required. Review the service summary before creation and do not select paid upgrades for this setup.

Sources checked on 24 November 2026: [Render free-plan limits](https://render.com/docs/free), [Express deployment](https://render.com/docs/deploy-node-express-app), [Blueprint configuration](https://render.com/docs/blueprint-spec), [provider environment variables](https://render.com/docs/environment-variables).

## Connect accounts to this assistant

1. In ChatGPT, open **Settings → Plugins** or the [plugin directory](https://chatgpt.com/plugins).
2. Find **GitHub**, install its plugin if needed, and complete the **Connect** authorization flow with your GitHub account.
3. Repeat for **Render** using the intended Render account/workspace.
4. Return to this conversation and confirm the connections. Do not paste passwords, tokens, or API keys into chat.

Creating provider accounts does not itself authorize this assistant. Complete provider sign-in and permission review in the connection screens. See [OpenAI's account connection instructions](https://help.openai.com/en/articles/20001494-connecting-and-managing-app-accounts-in-chatgpt).

If new tools do not become available in an existing conversation, start a new Codex chat in the ChatGPT desktop app with this project workspace and refer to this deployment guide. OpenAI's plugin documentation says bundled skills/tools load in new chats and that plugins are not available in the IDE extension. Connecting accounts on the ChatGPT website does not add plugin tools to the VS Code IDE extension. A supported Codex CLI session is another option. The code and configuration are already saved. See [supported plugin surfaces and new-session guidance](https://learn.chatgpt.com/docs/plugins).

## Publishing with the prepared configuration

Create a Render Blueprint from the existing `amarsiddamshetty-maker/xss-shield` GitHub repository. The root `render.yaml` defines:

| Setting | Value |
| --- | --- |
| Type | Web Service, Node runtime |
| Instance plan | Free |
| Node version | 24.22.3 |
| Build command | `npm ci --include=dev && npm run build` |
| Start command | `npm start` |
| Health check | `/api/health` |
| `NODE_ENV` | `production` |
| `PUBLIC_DEMO` | `true` |
| `DB_PATH` | `/tmp/xss-shield/public-demo.sqlite` |
| `RATE_LIMIT_MAX` | `120` |

Do not attach a disk or add a Postgres database. Render automatically supplies `PORT` and `RENDER_EXTERNAL_URL`. Public mode requires the exact public origin and uses Render's URL automatically; set `PUBLIC_ORIGIN` only if using a different configured domain. `PUBLIC_ORIGIN` must be an HTTPS origin, without paths or query strings. Loopback HTTP is allowed only for local hosted-mode tests.

`PUBLIC_DEMO=true` enables public listening, exact hosted-domain checks, same-origin browser writes, HTTPS security headers, shared-data notices, and bounded history. Render's single proxy hop is trusted only when `RENDER=true`; the original Host header still has to match the configured origin. The default local mode remains bound to `127.0.0.1` and retains all local records. Hosted demo defaults use a separate database filename to avoid pruning normal local history.

## Manual alternative

If publishing from the assistant is unavailable, the same prepared files work through the two websites:

1. On GitHub, create a repository named `xss-shield`. Public source is suitable for a college demonstration, provided you are comfortable sharing the source and project documentation. A private repository is also supported by Render when authorized; GitHub Actions quotas may differ.
2. Upload the contents of the prepared `xss-shield-source.zip` after extracting it. Upload the project files, not the ZIP itself. Keep `package.json`, `package-lock.json`, and `render.yaml` at the repository root. Include `.github/workflows/ci.yml` if using automated GitHub checks.
3. In Render, choose **New → Blueprint**, connect GitHub, authorize this repository, and select it.
4. Review the Blueprint: exactly one **Free** web service, with no paid disk or database. Create the service and wait for the deploy to finish.
5. Open the URL Render actually assigns. Do not assume a suggested service name is available.

The source package includes app source, tests, configuration and project documentation. It excludes `.env`, local databases, dependencies, test/coverage output, and credentials. Do not upload those excluded items separately.

## Verify the live deployment

1. Open `/api/health` at the assigned URL: it should return `status: "ok"`, `publicDemo: true`, and `eventLimit: 500`.
2. Confirm the **Public demonstration — shared, temporary history** notice appears before scanning.
3. Select **Disallowed attribute** and scan. Verify the output removes attributes and the preview is safe.
4. Check Dashboard and Activity Logs; the new event should appear.
5. Download the report. It must identify the public demonstration and temporary retained data.
6. Test on a phone using mobile data to verify access beyond your local machine.
7. Before a presentation, open the URL early and wait for the free service to wake. Do not depend on previous history being present.

The included GitHub workflow runs lint, build, measured backend coverage and Chromium browser tests on Linux after publication. Those cloud checks and the actual Render deploy cannot be claimed as passing until they execute in the connected accounts. The Windows local runs are recorded separately in TEST_REPORT.md.

## Troubleshooting

- **First visit shows a loading page:** allow about a minute for the sleeping free service to wake.
- **Old events are gone:** expected after a free-host restart/sleep/redeploy or the 500-event retention limit.
- **403 Invalid origin:** check `PUBLIC_ORIGIN`; use the assigned Render origin exactly. A custom domain requires updating it to match.
- **No listening port:** confirm `PUBLIC_DEMO=true`, a valid public origin, and the supplied start command. Render's `PORT` is used automatically.
- **Missing Node/SQLite dependency:** keep Node 24.22.3 and `npm ci --include=dev` in the build command.
- **429 response:** wait for the one-minute API rate-limit window to reset.
- **Deploy asks for paid resources:** stop and review the service settings against `render.yaml`; this demo needs only one Free web service.
