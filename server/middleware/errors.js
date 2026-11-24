export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Do not return exception details, SQL, file paths, or submitted HTML to clients.
export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: { code: 'INVALID_INPUT', message: 'The request body is too large. Submit at most 20,000 characters of HTML.' } });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'The request body must be valid JSON.' } });
  }
  if (error.type === 'charset.unsupported' || error.type === 'encoding.unsupported') {
    return res.status(415).json({ error: { code: 'INVALID_INPUT', message: 'Send UTF-8 JSON using a supported content encoding.' } });
  }
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: { code: error.code, message: error.message } });
  }
  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'The request could not be completed. Please try again.' } });
}
