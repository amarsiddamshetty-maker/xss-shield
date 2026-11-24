// Both tiers use the same deliberately small, presentation-only HTML vocabulary.
// No URLs, images, forms, styles, IDs, event handlers, or other attributes survive.
export const MAX_HTML_LENGTH = 20000;
export const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'hr', 'span', 'div', 'sub', 'sup'],
  ALLOWED_ATTR: [],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  FORCE_BODY: true,
};
