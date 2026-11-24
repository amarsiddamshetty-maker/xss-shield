# XSS Shield demonstration guide

## Before the presentation

1. Open a terminal in the project folder.
2. Run `npm install` if dependencies are not installed.
3. Run `npm run build`, then `npm start`.
4. Open [http://localhost:3000](http://localhost:3000), or the exact local URL printed by the server.
5. Confirm that the Home page loads. Open Dashboard and note the existing scan total.
6. Use only harmless demonstration text. Do not enter personal information or secrets.
7. Keep this guide and [VIVA_QUESTIONS.md](VIVA_QUESTIONS.md) available for preparation.

Existing records are expected: SQLite preserves history after a restart. Describe a change in counts rather than assuming the database begins at zero. Do not expose the server to the internet or scan external websites.

## Two-minute introduction

“Our project is XSS Shield, an educational Cross-Site Scripting detection and prevention prototype. Cross-Site Scripting, or XSS, can happen when a website treats untrusted input as active browser instructions. It can affect what users see and what actions run inside a trusted page.

“We focus on safe handling of submitted HTML. The user enters a small fragment in a React interface. An Express server first validates the request, then uses DOMPurify with jsdom to remove anything outside a restrictive formatting policy. SQLite stores the sanitized result and event details. The interface shows the original input as text, displays a protected preview, and explains the decision.

“The project has four outcomes: unchanged, sanitized, normalized, and invalid input. A sanitized result does not automatically mean an attack was found. Even a harmless attribute can be outside our policy. Normalization means the HTML parser changed the representation, such as repairing an unclosed formatting tag.

“The Learning Lab explains stored, reflected, and DOM-based XSS with visual simulations. It never runs unsafe scripts. The dashboard and activity logs show real database records, and the Reports page creates a PDF from those records.

“This runs only on localhost. It is not a Web Application Firewall or a tool for scanning other websites. Its purpose is to demonstrate validation, HTML sanitization, safe rendering, persistent logging, and testing in a project a student can understand and explain.”

## Five-minute demonstration

| Time | Screen and action | What to explain |
| --- | --- | --- |
| 0:00–0:35 | Home: show objective and workflow | Input travels through validation, sanitization, a decision, and storage |
| 0:35–2:00 | XSS Scanner: run the examples below | Contrast text, allowed formatting, removal, and normalization |
| 2:00–2:45 | Learning Lab: change XSS type and compare flows | Unsafe behavior is simulated; protected flow prevents interpretation of disallowed content |
| 2:45–3:30 | Dashboard: observe updated counts | Metrics and charts come from SQLite records |
| 3:30–4:15 | Activity Logs: search, filter, open details | Saved content is sanitized; raw input is not retained |
| 4:15–4:45 | Reports: download and open the PDF | Totals are lifetime figures; recent activity is bounded |
| 4:45–5:00 | About: state scope and conclusion | Explain limits and key learning outcomes |

## Step-by-step scanner scenarios

Use the sample selector where an equivalent example is available, or paste the examples below. Press **Analyze and Sanitize** after each one.

| Scenario | Input | Expected outcome |
| --- | --- | --- |
| Normal text | `Hello, engineering class!` | Safe/Unchanged; plain text remains |
| Permitted formatting | `<p>Hello <strong>class</strong></p>` | Safe/Unchanged; paragraph and bold formatting remain |
| Disallowed attribute | `<p title="classroom">Hello class</p>` | Sanitized; `title` is removed, paragraph text remains |
| Disallowed element | `<button>Classroom demo</button>` | Sanitized; the button element is removed, remaining text follows the sanitizer policy |
| Parser normalization | `<STRONG>Hello class</STRONG>` | Normalized; tag names serialize in lowercase without tracked policy removals |
| Invalid input | An empty or spaces-only field | Validation message; accepted scan count does not increase |

For each accepted example, point to the result category, removal counts, explanation, timestamp, original source, sanitized source, and rendered preview. Explain that the original source panel is plain text. The preview is the only place where sanitized formatting is intentionally rendered.

If a sample produces more than one removal, explain that the displayed counts come from DOMPurify's removal telemetry. They are not a score of attack severity. Do not promise that each removed subtree produces one count for every original descendant.

## Learning Lab walkthrough

1. Open **Learning Lab**.
2. Select the stored XSS flow and describe “saved content → later page display.”
3. Compare the unprotected simulation with the protected flow. State clearly that both are safe visual illustrations.
4. Switch to reflected XSS and describe “request input → immediate response.”
5. Switch to DOM-based XSS and describe “browser data → unsafe document operation.”
6. Explain why safe server handling and safe browser rendering both matter.

Do not try to make the lab execute an unsafe example. The absence of real exploitation is a deliberate requirement.

## Dashboard and log walkthrough

1. Open **Dashboard** and compare the total with the number noted before the demo.
2. Show unchanged, sanitized, and normalized counts, total removals, daily trends, and recent activity.
3. Open **Activity Logs** and search for `class`.
4. Filter by sanitized results, then clear the filter to recover the full list.
5. Apply a suitable date range. Date filters use UTC calendar dates; displayed times may be local.
6. Open one event's details and explain its saved output and action.
7. If enough records exist, use the pagination controls.

The database does not retain the original raw HTML. Sanitized text may still contain private information, which is why demonstration inputs must be nonsensitive.

## PDF walkthrough

Open **Reports**, fetch or refresh the current data if needed, and use the PDF download control. Open the downloaded PDF in a local viewer. Point out the project name, generation date, totals, removal counts, recent events, recommendations, limitations, and page numbers.

The report summarizes all accepted scans but includes at most 100 recent events. Each event's excerpt is limited to 500 characters. Non-ASCII characters appear as `?` with the PDF's built-in font, while the log details preserve the saved Unicode content.

## Explaining every screen

| Screen | One-sentence explanation |
| --- | --- |
| Home | “This introduces the problem and shows where protection happens.” |
| XSS Scanner | “This performs real validation and DOMPurify sanitization.” |
| Learning Lab | “This explains three XSS paths through safe visual simulations.” |
| Dashboard | “This summarizes actual accepted scans stored in SQLite.” |
| Activity Logs | “This lets us inspect and filter individual saved decisions.” |
| Reports | “This produces a portable PDF snapshot of the application's records.” |
| About | “This explains the stack, scope, and security concepts.” |

## Optional persistence demonstration

After recording an event identifier, stop the foreground server with Ctrl+C and run `npm start` again. Reload Activity Logs and find the same event. This demonstrates that SQLite stores records on disk rather than only in the browser's memory.

Do this outside the five-minute presentation if restarting would interrupt your flow. Do not delete the database to create an empty dashboard.

## If something interrupts the demo

| Problem | Response |
| --- | --- |
| Page cannot connect | Check the terminal and restart the local server using the documented command |
| Port is already in use | Reuse the already-running project server or stop that project process before restarting |
| Data is older than expected | Refresh the page; use the latest event timestamp to confirm the current record |
| Date filter hides records | Clear the date range and explain UTC filter boundaries |
| Rate limit appears | Wait for the request window to reset; do not disable the control |
| PDF download is blocked | Check browser download permissions and retry |
| Browser test evidence is requested | Open `TEST_REPORT.md` and discuss the recorded results and limitations |

## Learning outcomes and conclusion

The project demonstrates full-stack request flow, the differences between validation and sanitization, context-appropriate output handling, parameterized database queries, persistent monitoring, PDF generation, and several layers of automated testing.

Conclude with: “XSS Shield makes a security decision visible and explainable. It shows how a maintained sanitizer, careful rendering, and supporting controls work together in a local application. The result is a teaching prototype with a clearly defined scope, not a claim of universal website protection.”
