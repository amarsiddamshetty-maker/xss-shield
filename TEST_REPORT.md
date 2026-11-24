# XSS Shield test report

## Latest follow-up: free public demonstration mode

On 24 November 2026, the user requested a free online demo. The updated source passed **119 tests: 107 backend/unit/integration tests across 6 files and 12 Chromium tests across 2 files, with zero failures or skips**. Backend run: 4.39s; browser run: 21.7s. Lint and the production build passed (229 modules, 384ms).

Updated measured backend coverage, now including `server/config.js`: **100% lines (141/141), 98.92% statements (184/186), 99.05% branches (209/211), 96.96% functions (32/33)**. Sanitizer, repository, query validation and runtime configuration have 100% coverage in all measured categories.

Additional tests cover local-default preservation, strict HTTPS public origins, Render proxy/port handling, same-origin hosted writes, rejected foreign/spoofed hosts and origins, forwarded-client rate limits, the latest-500-event retention rule, public-data notices, public-mode scanning, and the public-demo PDF disclaimer. Both browser servers were bound to loopback with separate test databases; the hosted-mode test used port 3101.

GitHub access is now verified for `amarsiddamshetty-maker/xss-shield`. GitHub Actions and Render outcomes are **not yet verified** in this report; Linux runner behavior and the eventual public application URL require separate cloud verification. The prepared source keeps localhost as its default, and the local server was stopped at the user's request.

The results below preserve the original local-delivery record, before the hosted-demo extension.

Verification date: 24 November 2026 (Asia/Calcutta). Results below describe execution in this workspace, not assumed outcomes.

## Objective and environment

Verify real HTML sanitization, safe rendering, persistent SQLite records, accurate monitoring and reporting, accessible navigation, and responsive local operation.

- Windows x64 with PowerShell; project at `C:\workspace\college`.
- Host Node 20.19.0/npm 10.8.2; npm scripts use installed project-local Node 24.22.3.
- React 19.3.1, Express 5.3.0, DOMPurify 3.5.0, jsdom 31.0.1, Vite 8.3.8, jsPDF 4.2.1.
- Vitest 5.1.1, Supertest 7.3.2, Playwright 1.65.1 with Chromium 159.0.8154.6.
- Tests use in-memory or unique temporary SQLite databases. Normal application data is `data/xss-shield.sqlite`.
- Browser tests use `127.0.0.1:3100`. Production uses `127.0.0.1:3000`. No external sites are scanned.

## Execution status

Final regression passed: **86 tests executed, 86 passed, 0 failed, 0 skipped** (75 backend/unit/integration tests and 11 browser tests). Production deployment is verified and was left running at [http://localhost:3000](http://localhost:3000).

| Check | Last observed result |
| --- | --- |
| Dependency installation and lockfile | Passed |
| `npm run lint` | Passed, zero errors/warnings |
| Backend suite | 75 passed, 0 failed, 0 skipped across 4 files; final run 3.43s |
| `npm run test:coverage` | Passed: 100% lines, 98.70% statements, 98.30% branches, 96.77% functions |
| Production build | Passed after all corrections; 228 modules, 394ms |
| Browser suite | 11 passed, 0 failed, 0 skipped; final run 18.5s |
| Development command/proxy | Passed: frontend 200, health ok, POST sanitized correctly |
| `npm audit` | Passed: zero known vulnerabilities across all severities |
| Final production deployment | Passed: health 200, frontend accessible, browser scan/preview/PDF workflow, persisted event, 127.0.0.1 binding |

All scenarios in the following table passed in the final regression. Browser assertions recorded zero unexpected JavaScript/CSP console errors and no requests outside the local application.

## Scenarios and expected behavior

| Area | Scenarios | Expected result |
| --- | --- | --- |
| Sanitizer | Plain text, allowed formatting, parser repairs, disallowed elements/attributes, defensive script/SVG/MathML/form/template fixtures | Restrictive safe output; truthful unchanged/sanitized/normalized classification |
| Validation | Empty/non-string input, maximum length, oversized body, malformed JSON, unsupported content type/charset | Consistent 400/413/415 responses; no invalid event stored |
| Telemetry | Element/attribute counts, synthetic parser wrapper exclusion, lengths | Accurate reported operations without calling removals confirmed attacks |
| Database | Insert/retrieve, indexes, constraints, empty totals, aggregate totals, seven-day zero fill, literal search | Parameterized queries and accurate records |
| Persistence | Close/reopen SQLite and terminate/restart the real server process | Event and summary remain available |
| API | Health, scans, lists/details, filters, dates, pagination, summaries, reports | Consistent JSON and correct HTTP status |
| Security controls | Foreign Host/Origin, cross-site writes, rate limit, internal DB failure | Rejected requests and generic error responses; strict Helmet CSP |
| Browser workflow | All seven screens, samples, clear, invalid input, preview, dashboard, logs/detail dialog | Functional interactions and current SQLite data |
| Browser defense | Original HTML as text; script marker remains unset; deliberately altered response re-sanitized | No unsafe execution; no external requests or unexpected console/CSP errors |
| Learning Lab | All three XSS types with protection on/off | Visual simulation only |
| PDF | Actual counts, saved text, long excerpts, multiple pages, recommendations, scope, page numbers | Valid downloaded PDF reflecting report data |
| Responsive layout | Desktop 1440×1000 and mobile 390×844 across all screens | Usable controls and no page-level horizontal overflow |

## Defects and corrections

1. **Runtime compatibility:** host Node 20 is too old for current jsdom. Installed Node 24 within the project and run all npm scripts with it; no system runtime replacement.
2. **Synthetic removal telemetry:** DOMPurify's FORCE_BODY sentinel initially affected counts. Exclude the synthetic first sentinel and parser BODY wrapper while retaining counts for actual user elements.
3. **Unsupported charset response:** corrected generic 500 to a safe 415 response.
4. **Development origins:** permitted the two explicit local Vite origins only in development; production retains same-origin writes.
5. **Navigation accessibility:** hid the decorative scanner arrow from the accessible link name.
6. **Learning Lab toggle:** browser testing identified an obscured native checkbox click target. The transparent native input now covers the visual switch and receives pointer events; all protected/unprotected lesson checks pass.
7. **Mobile dashboard:** browser testing identified 425px document width in a 390px viewport. An absolutely positioned screen-reader-only table label escaped the scrolling container. Establishing that container as its positioning context fixed the overflow without clipping the page; all seven mobile screens pass.
8. **Test cleanup lint:** moved a temporary-path guard out of `finally`, preserving path validation and ensuring the original test exception is not masked.
9. **Documentation/PDF verification:** corrected development-port documentation and added assertions for PDF values, text, recommendations, and scope.

The initial Vitest sandbox attempt could not spawn its worker (`EPERM`); it was rerun with the required process permission. The initial browser attempt could not launch because browser installation was still running; Chromium was installed before the functional run. These were environment/setup failures, not passing tests. No security controls were disabled to obtain test passes.

## Coverage evidence

`coverage/coverage-summary.json` contains machine-readable measured results; `coverage/index.html` contains the detailed report. Coverage applies to server application routes, sanitizer, validation/error middleware, and repository. The startup process is exercised separately by the restart integration test. Coverage is not a claim of exhaustively proving security.

| Measured scope | Lines | Statements | Branches | Functions |
| --- | --- | --- | --- | --- |
| All included backend code | 100% (118/118) | 98.70% (153/155) | 98.30% (116/118) | 96.77% (30/31) |
| Sanitization service | 100% | 100% | 100% | 100% |
| SQLite repository | 100% | 100% | 100% | 100% |
| Request query validation | 100% | 100% | 100% | 100% |

The remaining uncovered branches concern unusual middleware/host error handling; the sanitizer and critical database/query logic meet the requested 80% target in every measured category.

## Local deployment verification

`npm start` launched the compiled frontend and API together. The health response was `{status:"ok",service:"XSS Shield",protection:"active",storage:"sqlite"}`. A Windows listener inspection confirmed `127.0.0.1:3000`, not a public interface.

A Chromium visit to `http://localhost:3000/#scanner` submitted harmless demonstration HTML, received a sanitized result, and displayed the expected safe preview. The Reports page downloaded `docs/sample-security-report.pdf`. No browser errors occurred. The harmless event created during development was still present after the development processes stopped and production started. The normal database now contains two demonstration records; automated regression fixtures remain in separate temporary databases.

The live process was left running as requested. Restart from the project directory with `npm start`; rebuild first with `npm run build` after changing source. Runtime availability after the coding environment closes depends on that environment retaining the local process.

## Artifacts and limitations

Playwright produced `playwright-report/index.html` and its tested PDF under `test-results/`. Eight full-page screenshots are retained in `docs/screenshots/`: `home.png`, `scanner.png`, `learning-lab.png`, `dashboard.png`, `activity-logs.png`, `reports.png`, `about.png`, and `mobile.png`. Desktop viewport: 1440×1000; mobile viewport: 390×844. Screenshots use harmless isolated test data. A separate production demonstration report is saved as `docs/sample-security-report.pdf`.

Only Chromium on this Windows environment is covered. Firefox, WebKit, real mobile hardware, stress testing, public hosting, and external vulnerability scanning are not tested. The latter two are outside the requested local scope. PDF excerpts are limited to 500 characters, the activity section to 100 recent events, and built-in PDF fonts substitute non-ASCII text. Sanitized text may still contain personal information; use demonstration inputs. Removal telemetry includes DOM nodes such as comments and is not a complete subtree census or attack count.
