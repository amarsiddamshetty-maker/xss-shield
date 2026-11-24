# XSS Shield viva questions and answers

## Web development basics

1. **What is HTML?**  
   HTML describes the structure of a web page, such as headings, paragraphs, forms, and links.

2. **What is CSS?**  
   CSS controls how a page looks, including colors, spacing, typography, and responsive layouts.

3. **What is JavaScript used for in this project?**  
   It handles browser interactions, API requests, server logic, database access, and PDF generation.

4. **What is the DOM?**  
   The Document Object Model is a tree of objects representing the elements and text in a document.

5. **What is responsive design?**  
   It makes a layout adapt to different screen sizes so the application remains usable on desktops and phones.

6. **Why do form labels and keyboard focus indicators matter?**  
   They help people understand inputs and operate the interface with a keyboard or assistive technology.

## React and the frontend

7. **What is React?**  
   React is a JavaScript library for building interfaces from reusable components.

8. **What is a component?**  
   A component is a reusable part of the interface, such as a status badge, navigation bar, or scan result card.

9. **What is state in React?**  
   State is data that a component remembers and uses to update what the user sees, such as the current HTML input.

10. **Why is the original input displayed as text?**  
    Rendering it as HTML could interpret untrusted content. A text display lets the user inspect the source safely.

11. **Why does the preview require special care?**  
    The preview intentionally renders formatting. It therefore uses the restrictive policy and browser-side DOMPurify before insertion.

12. **What does Vite do?**  
    Vite provides the frontend development server and creates the production files served by Express.

## Node.js, Express, and APIs

13. **What is Node.js?**  
    Node.js runs JavaScript outside a browser. Here it runs the backend and accesses SQLite.

14. **What is Express?**  
    Express is a Node.js framework for handling HTTP requests, routes, and middleware.

15. **What is middleware?**  
    Middleware is code that runs during request processing, for example to apply security headers or handle errors.

16. **What is a REST API?**  
    It is an HTTP interface organized around resources and operations. This project uses routes such as `/api/events` to read records and `/api/scan` to submit a scan.

17. **What is JSON?**  
    JSON is a text format for structured values. The frontend and backend use it to exchange scan requests and results.

18. **What is the difference between GET and POST here?**  
    GET retrieves data, while POST submits a new scan that creates a saved event.

19. **Why use HTTP status codes?**  
    They let the client distinguish success, invalid requests, missing data, too many requests, and server problems.

20. **Why does production use one local port?**  
    Express serves both the built frontend and the API, making the demonstration simpler and keeping requests on the same origin.

## Cybersecurity and XSS

21. **What is cybersecurity?**  
    It is the practice of protecting systems and information from unauthorized access, change, and disruption.

22. **What is XSS?**  
    Cross-Site Scripting occurs when untrusted content can cause unwanted script execution in a trusted website context.

23. **What is stored XSS?**  
    Untrusted content is saved and later displayed unsafely, such as through a stored comment.

24. **What is reflected XSS?**  
    A request value is copied into an immediate response without appropriate protection.

25. **What is DOM-based XSS?**  
    Browser code takes untrusted data and places it into an unsafe document operation.

26. **Why is XSS dangerous?**  
    Unwanted code in a trusted page can mislead users, read accessible information, or act with their permissions.

27. **What is a WAF?**  
    A Web Application Firewall inspects web traffic and can block requests according to rules. It is one layer of protection.

28. **Is XSS Shield a WAF or an external vulnerability scanner?**  
    No. It sanitizes fragments submitted to its own local application and teaches the protection workflow.

29. **Why is the unprotected Learning Lab only a simulation?**  
    The educational comparison does not require real unsafe execution. A visual simulation explains the risk without creating an exploitable feature.

## Sanitization and safe handling

30. **What is input validation?**  
    It checks whether a request has an acceptable shape and size, such as a nonblank string within the length limit.

31. **What is HTML sanitization?**  
    It removes HTML elements or attributes that are not allowed by a chosen policy.

32. **What is output encoding?**  
    It represents data so it is treated as text in a particular output context, rather than as instructions.

33. **Why are validation, sanitization, and output encoding separate?**  
    A correctly typed string can still contain disallowed HTML, and sanitized HTML is not suitable for every possible context.

34. **What does DOMPurify do?**  
    It uses a DOM to inspect HTML and remove structures outside the configured rules.

35. **Why is jsdom needed on the server?**  
    Node.js does not provide a browser DOM by default. jsdom supplies the DOM used by server-side DOMPurify.

36. **Why not sanitize HTML with regular expressions?**  
    HTML parsing has complicated edge cases. A maintained DOM-based sanitizer is designed to handle them more reliably.

37. **Why sanitize on both the server and browser?**  
    The server is the main boundary because browser checks can be bypassed. Re-sanitizing the preview adds protection before browser rendering.

38. **Does a sanitized result prove that an attack occurred?**  
    No. A harmless element or attribute may be removed simply because the project's policy does not allow it.

39. **What does normalized mean?**  
    The HTML parser changed the representation without tracked policy removals, such as converting tag names to lowercase.

40. **Does unchanged mean safe everywhere?**  
    No. It means unchanged under this policy and rendering context. SQL, URLs, JavaScript, and CSS each require their own handling.

41. **What is Content Security Policy?**  
    CSP is a browser policy sent in a response header that restricts resources and script execution sources. It supports, but does not replace, safe application code.

42. **What is Helmet used for?**  
    Helmet helps Express send security-related HTTP headers, including the project's CSP.

43. **Why limit request size and request frequency?**  
    These limits reduce excessive input processing and repeated requests that could consume resources.

44. **Why bind to a loopback address?**  
    It limits the server to the local machine, matching the project's demonstration scope.

## SQLite and monitoring

45. **What is SQLite?**  
    SQLite is a relational database stored in a local file, without a separate database server process.

46. **What is a primary key?**  
    It is a value that identifies a table row uniquely. Each saved event has an integer identifier.

47. **Why use parameterized SQL?**  
    Parameters keep user values separate from SQL instructions, helping prevent SQL injection.

48. **Why add indexes?**  
    Indexes help the database find records more efficiently for common timestamp and status queries.

49. **What data is saved for a scan?**  
    The sanitized content, result category, timestamp, removal counts, input/output lengths, action, and explanation are saved.

50. **Why not store the raw submitted HTML?**  
    The requirement avoids retaining potentially unsafe source content. Saved results are enough for this demonstration's monitoring needs.

51. **Does sanitization remove private information?**  
    No. A name or secret written as ordinary text can remain. Only nonsensitive demonstration inputs should be used.

52. **How do records survive a restart?**  
    They are written to a SQLite file on disk, which is reopened when the server starts.

53. **What is pagination?**  
    Pagination returns a limited page of records at a time instead of loading the whole history at once.

54. **Are dashboard values hardcoded?**  
    No. The dashboard requests aggregate statistics calculated from the SQLite records.

55. **Why are dates stored in UTC?**  
    UTC gives one consistent time reference. The UI can display local time while date filters use documented UTC boundaries.

## Reports, testing, and project scope

56. **What does jsPDF do?**  
    It creates the downloadable PDF in the browser from data returned by the report API.

57. **Does the PDF contain every event?**  
    Its totals cover all accepted scans, but the activity section contains at most 100 recent events and bounds long text.

58. **What is a unit test?**  
    It tests a small piece of behavior, such as how the sanitizer handles a permitted formatting tag.

59. **What is an integration test?**  
    It checks parts working together, such as an API request creating and retrieving a database record.

60. **What is an end-to-end test?**  
    It uses the application through a browser to check a complete user workflow.

61. **What does code coverage measure?**  
    It measures which source statements, lines, functions, or branches ran during tests. It does not prove the absence of bugs.

62. **Why keep test databases separate?**  
    Tests can create and remove their own records without changing the real demonstration history.

63. **What is regression testing?**  
    It reruns checks after a change to detect whether previously working behavior was broken.

64. **Why run a dependency audit?**  
    It checks installed package versions against known published vulnerability advisories. New issues can still be discovered later.

65. **What is the purpose of `package-lock.json`?**  
    It records the resolved dependency tree so installations can be reproduced more consistently.

66. **What is the difference between development and production mode?**  
    Development uses Vite for convenient frontend updates. Production uses compiled files served by Express on one local port.

67. **What are the main limitations of this project?**  
    It protects only its supported local HTML workflow, uses a restrictive policy, has no user accounts or automatic retention, and is not designed for public deployment.

68. **What future improvement would you prioritize?**  
    A justified choice might be broader browser testing, accessible interaction testing, or controlled retention. Any wider deployment would first need authentication and a separate security review.

69. **Where should you find actual test counts and coverage?**  
    In `TEST_REPORT.md`. Never quote invented or assumed results in the presentation.

70. **What is the main learning outcome?**  
    Untrusted data must be handled safely at each boundary: validate requests, sanitize permitted HTML, render in the correct context, store appropriate records, and verify behavior with tests.
