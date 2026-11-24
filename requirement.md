You can build this complete prototype using **Visual Studio Code and GitHub Copilot in Agent mode** with a single comprehensive master prompt.

The prompt should instruct Copilot not only to generate code but also to install dependencies, build the application, run tests, fix errors, deploy locally, verify functionality and prepare documentation.

Since this is a first-year engineering cybersecurity project, the implementation should be simple enough for the student to understand, explain and demonstrate independently.

## **1. Initial setup in Visual Studio Code**

1. Install Node.js LTS.
2. Install Visual Studio Code.
3. Install the GitHub Copilot extension and sign in.
4. Create an empty folder named `XSS-Shield`.
5. Open the folder in Visual Studio Code.
6. Open Copilot Chat and select **Agent mode**.
7. Paste the complete master prompt below.

Ensure that workspace editing and terminal tools are available in Copilot. These allow the agent to create files, execute commands, inspect errors and run tests. Review the terminal permission requests as they appear.&#x20;

[image](https://www.google.com/s2/favicons?domain=https://code.visualstudio.com\&sz=32)

Visual Studio Code+1



## **2. Complete master prompt for GitHub Copilot**

Copy the entire prompt below and paste it into Copilot Agent mode.

# PROJECT: XSS Shield – Cross-Site Scripting Detection and Prevention System

## 1. Role and responsibility

Act as a senior full-stack developer, cybersecurity architect, UI/UX designer, QA engineer and technical documentation specialist.

Develop a complete, functional, tested and locally deployed cybersecurity website prototype for a first-year engineering student.

Perform the complete software development lifecycle within the current VS Code workspace.

Do not just provide instructions, sample code or recommendations. Create all required files, implement the application, install dependencies, execute commands, run tests, resolve errors and verify the application.

Keep the implementation simple, modular, readable and suitable for a beginner to understand and demonstrate.

## 2. Project objective

Build a web-based application called **XSS Shield** that demonstrates Cross-Site Scripting detection, prevention, HTML sanitization, security monitoring and reporting.

The application should accept user-submitted HTML content, analyze it, remove potentially unsafe elements and attributes using DOMPurify, display sanitized content safely, record security events in SQLite and generate downloadable PDF reports.

The application must provide actual HTML sanitization and prevention within its own local environment rather than relying entirely on simulated responses.

## 3. Mandatory technology stack

Use the following technologies:

- HTML5 – Website structure.
- CSS3 – Website styling and responsive design.
- JavaScript – Application logic.
- React.js – Frontend development.
- Node.js – Backend runtime.
- Express.js – REST API development.
- SQLite – Persistent database.
- DOMPurify – HTML sanitization.
- jsdom – Server-side DOM support for DOMPurify.
- jsPDF – PDF report generation.
- Vite – Frontend development and build tooling.

Use compatible, maintained dependency versions and generate a package-lock.json file.

Do not introduce unnecessary frameworks, paid services, cloud infrastructure, Docker, artificial intelligence or machine learning.

Prefer JavaScript instead of TypeScript to keep the implementation beginner-friendly.

## 4. Application architecture

Implement the following architecture:

User Browser → React Frontend → Express REST API → Input Validation → DOMPurify Sanitization Engine → Security Decision → SQLite Database.

The sanitized response should be returned to the React frontend for safe display.

The frontend should provide dashboard visualization, activity logs and PDF report generation.

Implement server-side sanitization as the primary security control. Browser-side sanitization should provide additional protection.

The production build should be served directly through the Express server using a single local port.

## 5. Functional requirements

### Module 1: Home page

Create an attractive cybersecurity-themed landing page containing:

- Application name and logo.
- Project objective.
- Explanation of Cross-Site Scripting.
- Explanation of Stored, Reflected and DOM-based XSS.
- Importance of XSS prevention.
- Introduction to DOMPurify.
- Application workflow diagram.
- Start Security Scan button.

Explain cybersecurity concepts in simple language suitable for first-year engineering students.

### Module 2: XSS scanner

Create an interactive security scanner containing:

- HTML input textarea.
- Sample input selection.
- Analyze and Sanitize button.
- Clear button.
- Original input display.
- Sanitized HTML output.
- Safe rendered preview.
- Scan result.
- Number of removed elements and attributes.
- Explanation of the sanitization decision.
- Date and time of the scan.

Provide harmless sample inputs covering normal text, allowed HTML formatting and disallowed HTML elements or attributes.

Implement the following result categories:

- Safe/Unchanged.
- Sanitized.
- Normalized.
- Invalid Input.

Do not classify every sanitization event as a confirmed XSS attack.

Display original content as plain text only. Never execute unsanitized content.

### Module 3: XSS prevention engine

Implement a reusable backend sanitization service using DOMPurify and jsdom.

Requirements:

- Validate request body and input type.
- Validate maximum input length.
- Handle empty input.
- Sanitize submitted HTML.
- Use a restrictive allowlist of basic HTML formatting elements.
- Remove disallowed HTML elements.
- Remove disallowed HTML attributes.
- Prevent executable user-provided content.
- Return the sanitized HTML.
- Record sanitization statistics.
- Provide a beginner-friendly explanation of the result.
- Handle errors gracefully.

Use DOMPurify rather than implementing HTML sanitization with regular expressions.

Use context-appropriate safe rendering in React.

Explain the difference between input validation, sanitization and output encoding.

### Module 4: XSS learning laboratory

Create an educational demonstration page explaining:

- Stored XSS.
- Reflected XSS.
- DOM-based XSS.
- How untrusted input reaches a browser.
- How sanitization prevents unsafe content from being interpreted.
- How safe rendering protects users.

Provide interactive visual simulations comparing protected and unprotected behavior.

The unprotected behavior must be a visual simulation only. Do not execute unsafe scripts, create deliberately exploitable endpoints or interact with external websites.

### Module 5: Security dashboard

Create a professional monitoring dashboard containing:

- Total security scans.
- Unchanged inputs.
- Sanitized inputs.
- Normalized inputs.
- Removed HTML elements and attributes.
- Protection status.
- Recent security activity.
- Daily scan trends.
- Scan result distribution.

Use actual SQLite database records instead of hardcoded dashboard values.

Use simple SVG or CSS-based charts where appropriate to minimize dependencies.

Ensure the dashboard updates after each scan.

### Module 6: Security activity logs

Implement a security log page displaying:

- Event ID.
- Date and time.
- Scan status.
- Sanitized content.
- Removed item count.
- Security action.
- Result explanation.

Provide:

- Search functionality.
- Status filtering.
- Date filtering.
- Pagination.
- Empty-state messages.
- Event details view.

Do not persist raw potentially unsafe HTML or sensitive user information.

Display all log content safely.

### Module 7: PDF security report

Use jsPDF to generate and download a professional PDF report containing:

- Project name and report title.
- Report generation date.
- Total scans.
- Unchanged input count.
- Sanitized input count.
- Normalized input count.
- Total removed items.
- Recent security activity.
- Security recommendations.
- Project scope and limitations.
- Page numbers.

Handle long content and multiple pages appropriately.

The PDF should be generated from actual application data.

## 6. Backend REST APIs

Implement the following APIs:

- GET /api/health – Application health status.
- POST /api/scan – Validate and sanitize HTML content.
- GET /api/events – Retrieve security events with filtering and pagination.
- GET /api/events/:id – Retrieve an individual security event.
- GET /api/summary – Retrieve dashboard statistics.
- GET /api/report – Retrieve security report data.

Use consistent JSON request and response formats.

Implement proper HTTP status codes, request validation and centralized error handling.

Use parameterized SQLite queries.

## 7. Database requirements

Use SQLite as the persistent database.

Create the database and required tables automatically during application startup.

Create a security_events table containing:

- id
- created_at
- status
- sanitized_content
- removed_count
- original_length
- sanitized_length
- action
- explanation

Add indexes where appropriate for event timestamps and statuses.

Verify that security logs remain available after restarting the application.

Keep test databases separate from the actual application database.

## 8. UI/UX requirements

Design a modern, professional, responsive cybersecurity-themed website.

Use:

- Dark navy blue or charcoal background.
- Blue and cyan accents.
- Green for successful security operations.
- Amber for sanitized content.
- Red for errors and warnings.
- Clear typography.
- Professional security icons.
- Cards and dashboard widgets.
- Responsive navigation.
- Accessible forms and buttons.

Provide the following navigation:

Home | XSS Scanner | Learning Lab | Dashboard | Activity Logs | Reports | About

Ensure consistent styling across all pages.

Make the website suitable for a college project exhibition and live demonstration.

Avoid unnecessary animations or overly complex UI designs.

## 9. Security requirements

Apply secure development practices throughout the application.

Implement:

- Server-side input validation.
- Server-side DOMPurify sanitization.
- Safe frontend content rendering.
- Content Security Policy using appropriate security headers.
- Express security headers using Helmet.
- Request body size limits.
- Basic request rate limiting.
- Parameterized SQL queries.
- Safe error responses.
- Secure handling of database content.
- Dependency vulnerability checks.

Do not use unsafe JavaScript execution functions.

Do not disable security controls to make tests pass.

Do not rely exclusively on keyword detection.

Limit deployment and testing to localhost and the current authorized project workspace.

Do not expose the prototype to the public internet.

Document that this application is an educational application-level protection prototype, not an enterprise Web Application Firewall or external website vulnerability scanner.

## 10. Project structure

Create a clean project structure similar to:

```
XSS-Shield/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── vite.config.js
├── server/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── database/
│   └── app.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── data/
├── docs/
├── package.json
├── package-lock.json
├── .gitignore
├── .env.example
├── README.md
├── PROJECT_EXPLANATION.md
├── TEST_REPORT.md
└── IMPLEMENTATION_STATUS.md
```

Adjust the structure if necessary to ensure the application builds and runs correctly.

Maintain a single root-level npm command interface.

Provide complete implementations without placeholders, incomplete functions, TODO-only modules or nonfunctional buttons.

Add meaningful comments explaining important operations and security concepts.

## 11. Testing requirements

Create and execute automated tests.

Use suitable lightweight testing tools such as Vitest or Node.js test runner, Supertest and Playwright.

### Unit testing

Verify:

- Normal text processing.
- Allowed HTML formatting.
- Disallowed HTML element removal.
- Disallowed HTML attribute removal.
- Empty input validation.
- Maximum input length validation.
- Invalid input type handling.
- Sanitization result classification.
- Security statistics calculation.
- Error handling.

Use harmless fixtures and established defensive sanitizer regression tests.

### Integration testing

Verify:

- Backend health API.
- HTML sanitization API.
- Security event creation.
- Security event retrieval.
- Search and filtering.
- Pagination.
- Dashboard statistics.
- Report data retrieval.
- Database persistence.
- Invalid request handling.

### UI and end-to-end testing

Verify:

- Application loads successfully.
- All navigation links function.
- Scanner accepts valid inputs.
- Sanitized output is displayed correctly.
- Original input is displayed only as text.
- Safe preview works.
- Dashboard updates after a scan.
- Security logs are displayed.
- Search and filters work.
- PDF report downloads successfully.
- Application works at desktop and mobile screen sizes.
- No unexpected browser console errors occur.

Run browser tests against the locally hosted application only.

### Test execution and defect resolution

Execute all implemented tests.

If any test fails:

1. Analyze the failure.
2. Identify the root cause.
3. Correct the implementation.
4. Execute the affected tests again.
5. Execute the complete regression test suite.

Do not remove valid tests or weaken security controls merely to achieve passing results.

Generate actual code coverage results for critical backend services where supported.

Aim for at least 80% coverage of the security engine and critical backend business logic.

Record actual results rather than inventing test results or coverage percentages.

## 12. Build and deployment

Inspect the local development environment.

Verify Node.js and npm availability.

Install all required project dependencies.

Configure the following npm commands:

- npm install
- npm run dev
- npm run lint
- npm test
- npm run test:coverage
- npm run test:e2e
- npm run build
- npm start

Ensure all defined commands work as documented.

Perform the production build.

Deploy the application locally using Express and the compiled React frontend.

Use the following default URL:

[http://localhost:3000](http://localhost:3000)

Bind the server to the loopback interface only.

If port 3000 is unavailable, select an available local port and document the actual URL.

Verify:

- Server startup.
- Database initialization.
- Health endpoint.
- Frontend accessibility.
- Complete user workflow.
- Security log persistence.
- PDF report generation.

Use the available browser tools or Playwright to verify the locally deployed website.

Capture screenshots of the main pages and save them under docs/screenshots where browser tooling is available.

Leave the verified local application running when the environment supports it.

Do not claim deployment is successful unless the local application has actually been started and verified.

## 13. README documentation

Create a comprehensive README.md containing:

- Project title.
- Project overview.
- Problem statement.
- Project objectives.
- Features.
- Technology stack.
- Purpose of each technology.
- Architecture diagram.
- Application workflow.
- Project folder structure.
- System prerequisites.
- Installation instructions.
- Development instructions.
- Production build instructions.
- Local deployment instructions.
- Application URL.
- API documentation.
- SQLite database schema.
- Testing instructions.
- Screenshots.
- Security practices.
- Troubleshooting guide.
- Known limitations.
- Future enhancements.

Write the README in simple English suitable for a first-year engineering student.

Ensure a new user can run the application by following the README without requiring additional instructions.

## 14. Project explanation document

Create PROJECT_EXPLANATION.md containing a detailed beginner-friendly explanation.

Include:

1. What is cybersecurity?
2. What is a website security vulnerability?
3. What is Cross-Site Scripting?
4. What are the three major types of XSS?
5. Why is XSS dangerous?
6. What is a Web Application Firewall?
7. What is HTML sanitization?
8. How does DOMPurify work?
9. What is React.js?
10. What is Node.js?
11. What is Express.js?
12. What is SQLite?
13. What is jsPDF?
14. How do frontend and backend communicate?
15. How does the security engine process a request?
16. How are security logs stored?
17. How is the PDF report generated?
18. Explanation of each important source-code file.
19. Explanation of the complete application workflow.
20. Project limitations and future enhancements.

Include simple examples and Mermaid architecture and sequence diagrams.

Explain technical terms without assuming previous software development knowledge.

## 15. College presentation and demonstration

Create docs/DEMO_GUIDE.md containing:

- A two-minute project introduction.
- A five-minute project demonstration.
- Step-by-step demonstration instructions.
- Explanation of each website screen.
- Expected outcomes for harmless demonstration scenarios.
- Key learning outcomes.
- Project conclusion.

Create docs/VIVA_QUESTIONS.md containing at least 30 relevant viva questions with simple answers.

Cover HTML, CSS, JavaScript, React, Node.js, Express, SQLite, XSS, DOMPurify, REST APIs, PDF reporting and software testing.

## 16. Test report

Create TEST_REPORT.md containing:

- Testing objective.
- Test environment.
- Test tools.
- Test scenarios.
- Expected results.
- Actual observed results.
- Pass/fail status.
- Defects identified.
- Fixes implemented.
- Regression test results.
- Actual code coverage results.
- Deployment verification status.
- Known limitations.

Clearly distinguish tests that passed, failed, were skipped or could not be executed.

Do not fabricate test execution evidence.

## 17. Execution workflow

Execute the project in the following sequence:

Phase 1: Requirements analysis and implementation planning.

Phase 2: Environment verification and project initialization.

Phase 3: Application architecture and database implementation.

Phase 4: Backend API and DOMPurify security engine development.

Phase 5: React frontend and UI development.

Phase 6: Dashboard, activity logs and PDF reporting.

Phase 7: Frontend and backend integration.

Phase 8: Unit and integration testing.

Phase 9: End-to-end browser testing.

Phase 10: Defect resolution and regression testing.

Phase 11: Production build and local deployment.

Phase 12: Documentation and demonstration guide preparation.

Phase 13: Final verification and project completion report.

Maintain IMPLEMENTATION_STATUS.md throughout development.

Record each phase as Pending, In Progress, Completed or Blocked.

Update the status file with actual execution results, outstanding issues and the next action.

Proceed through all phases without unnecessarily stopping after generating a plan or implementing an individual module.

Request user involvement only when a required tool permission, environment dependency or essential decision prevents further progress.

## 18. Definition of Done

The project is considered complete only when:

- All required source files are created.
- All required website pages are implemented.
- Frontend and backend are integrated.
- DOMPurify performs actual HTML sanitization.
- SQLite records and retrieves security events.
- Dashboard uses actual database statistics.
- PDF report generation works.
- Required automated tests are executed successfully.
- Production build completes successfully.
- Application starts locally.
- Application health endpoint responds successfully.
- End-to-end user workflow is verified.
- README is complete.
- Project explanation is complete.
- Test report is complete.
- Demonstration guide is complete.
- Viva questions and answers are complete.
- Remaining limitations are documented.

Do not mark unverified requirements as completed.

## 19. Final deliverables

At the end of execution, provide a concise completion summary containing:

- Project implementation status.
- List of implemented modules.
- Technology stack.
- Application URL.
- Build status.
- Deployment status.
- Number of tests executed.
- Number of tests passed and failed.
- Actual code coverage.
- Documentation files created.
- Screenshots created.
- Outstanding issues, if any.
- Exact commands to restart the application.

Begin implementation now.

Work directly within the current VS Code workspace. Do not respond with only a project plan or code snippets. Create the complete working application, test it, resolve defects, deploy it locally and prepare all required documentation.

## **3. How Copilot should execute the project**

The master prompt instructs Copilot to follow a complete SDLC workflow.

## **4. Expected website design**

The master prompt is intended to produce a professional website similar to the following visual references.

[Fekra Systems | Développement Web & Mobile, IA au Maroc | Rabat](https://images.openai.com/static-rsc-4/uW7xljmKCI5R5vM8tZ8YsXYSXreq3GxjfO9236FcLpcVEy9Z3_y2B8PjkPgL1behCPauqxH0TUFrRBJEMHgatJCWw338GKmseFaLUZhyrLN7UsjvTPeeljgyRtNEHTNKUKD72evfofq1TrePIqAlxWkY9ikXWssmJUUmgoCCumM?purpose=inline)

**Home page**

Project introduction and security concepts

[Comprehensive Auditing in PostgreSQL on AWS RDS | by Prathamesh Satyarthi | Medium](https://images.openai.com/static-rsc-4/7ZG2krOekuw88z6C4p9lv326cPBnE6Xb2mgrLC4Ynju9uk9amIdCDSeoVA1aUkf7X4j6Y7TU0hu3nmuoOh_mOopOvU7wsPEq6P-kKOCinOhXyZ_YUPW39JH7LWDoJ9GEhFtoEIsCJZYaRip105v6P3ClV6Aofb-ArrUAVzJPGno?purpose=inline)

**XSS scanner**

Input analysis and sanitized output

[Intruex | AI-Powered Security Operations](https://images.openai.com/static-rsc-4/rDl62MvoOOGWSB7dOYrZ80ZXta--qHRfGaJI32u8J9ohv9NXt8hQnQFXYidk5kvktEdIhZDEHzL21IRs7Kot-9Lgu0Vww397IxSeuGFQm9JAujUKiT32dNap4RIgygtJPGT9iMqQXjckAv-K5Ua_0L7lgK9ptRlX_aioe1rslOE?purpose=inline)

**Security dashboard**

Scan statistics and activity monitoring

[50 SOC Analyst Interview Questions + Answers](https://images.openai.com/static-rsc-4/vNh3S9hyMXabmj99V5ucb4BL5yCS2VhefxWZhUBb2D_tD1Yohoxuzlgsw8V3-nVcpub7RRriBkXIiRQRd8DOY2Mm5JYi8Lh7NKQd0Z9J6aQg7vNz9l5ick2CzfQri7P8N-ZjCYalTH2RB_1Z1wsrhC8aEqEgpVWwGp6NRvnsXDo?purpose=inline)

**Activity logs**

Historical security events and filters

These are design references, not screenshots of the application Copilot will generate.

## **5. If Copilot stops before completing the project**

A large implementation may require multiple agent iterations because of tool permissions, context limits or execution limits.

You do not need to provide the entire master prompt again. Use this continuation prompt.

Continue implementing the XSS Shield project based on the original requirements.

Read IMPLEMENTATION_STATUS.md, README.md and the existing project files.

Identify all incomplete, pending, failed or blocked requirements.

Continue from the last completed phase without unnecessarily rebuilding working components.

Complete all outstanding implementations, run unit tests, integration tests and end-to-end tests, resolve defects, execute the production build and verify local deployment.

Complete all documentation and update the implementation status and test report with actual results.

Do not stop after providing recommendations. Perform the required actions directly within the workspace until the Definition of Done is satisfied or an actual blocker requires user involvement.

## **6. Final independent review prompt**

Once Copilot reports that development is complete, I recommend opening a new Copilot chat session in the same workspace and submitting the following prompt. This provides a second review without relying entirely on the original implementation conversation.

Act as an independent senior QA engineer and cybersecurity code reviewer.

Review the complete XSS Shield application in the current workspace.

Compare the implementation against the original project requirements and Definition of Done.

Perform an independent review of:

- Application architecture.
- Functional completeness.
- Frontend and backend integration.
- DOMPurify sanitization implementation.
- Safe HTML rendering.
- API functionality.
- SQLite persistence.
- Dashboard accuracy.
- Activity logs.
- PDF report generation.
- Security controls.
- Error handling.
- Responsive UI.
- Code readability.
- Documentation accuracy.

Identify missing functionality, defects, security weaknesses and incomplete implementations.

Run all automated tests and verify the actual local application using harmless test scenarios.

Fix identified issues without introducing unnecessary complexity.

Execute regression tests after corrections.

Rebuild and restart the application locally.

Update README.md, TEST_REPORT.md and IMPLEMENTATION_STATUS.md with verified results.

Create FINAL_REVIEW\.md containing findings, corrections, test results, deployment verification and remaining limitations.

Do not declare the application complete unless the functional, security, testing and documentation requirements have been verified.

## **7. Final deliverables checklist**

The following is what you should expect at the end of the Copilot development process.

### **Project completion tracker**

## **0/19**

Complete React frontend

Node.js and Express backend

DOMPurify security engine

SQLite database integration

XSS educational learning laboratory

Security dashboard

Searchable activity logs

Downloadable PDF report

Unit and integration tests

End-to-end browser tests

Successful production build

Verified local deployment

README.md

PROJECT_EXPLANATION.md

TEST_REPORT.md

DEMO_GUIDE.md

VIVA_QUESTIONS.md

IMPLEMENTATION_STATUS.md

FINAL_REVIEW\.md

Copy completion checklist

## **8. Recommended Copilot execution approach**

| Configuration         | Recommendation                              |
| --------------------- | ------------------------------------------- |
| IDE                   | Visual Studio Code                          |
| Copilot mode          | Agent                                       |
| Model                 | A capable coding model available in Copilot |
| Programming language  | JavaScript                                  |
| Development approach  | End-to-end agentic development              |
| Execution environment | Local laptop                                |
| Deployment            | Localhost                                   |
| Test approach         | Automated testing and independent review    |
| Documentation         | Markdown with architecture diagrams         |

**My recommendation is to use the three prompts in sequence:**

Master Development Prompt → Continuation Prompt (only if required) → Independent Review Prompt.

This approach covers the complete development lifecycle rather than just code generation.

I have assumed that deployment means a fully functioning website on the student's laptop, not a public cloud deployment. Actual completion will depend on Copilot's available tools, permissions and local environment.

Most importantly, after development, the student should go through `PROJECT_EXPLANATION.md`, understand the code flow, manually demonstrate the application and study the viva questions. That will make this both a working cybersecurity prototype and a meaningful engineering learning project.