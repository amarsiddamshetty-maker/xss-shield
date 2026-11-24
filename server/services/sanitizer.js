import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { MAX_HTML_LENGTH, SANITIZE_CONFIG } from '../../shared/sanitizer-policy.js';
import { HttpError } from '../middleware/errors.js';

// jsdom never runs scripts or loads remote resources; do not enable either option.
const window = new JSDOM('').window;
const purifier = createDOMPurify(window);

export function validateHtml(html) {
  if (typeof html !== 'string') throw new HttpError(400, 'INVALID_INPUT', 'HTML input must be a string.');
  if (!html.trim()) throw new HttpError(400, 'INVALID_INPUT', 'Enter some text or HTML before scanning.');
  if (html.length > MAX_HTML_LENGTH) throw new HttpError(413, 'INVALID_INPUT', `HTML input must contain at most ${MAX_HTML_LENGTH.toLocaleString('en-US')} characters.`);
}

export function analyzeHtml(html) {
  validateHtml(html);
  const sanitized_content = purifier.sanitize(html, SANITIZE_CONFIG);
  // DOMPurify.removed is diagnostic telemetry only, never an attack detector.
  // BODY is a synthetic parser wrapper. FORCE_BODY also inserts a sentinel
  // <remove> as the first removal; skip only that first entry, not user tags.
  const removals = purifier.removed.filter((item, index) => !(index === 0 && item.element?.nodeName === 'REMOVE'));
  const removed_elements = removals.filter(item => item.element && item.element.nodeName !== 'BODY').length;
  const removed_attributes = removals.filter(item => item.attribute).length;
  const removed_count = removed_elements + removed_attributes;
  const status = removed_count > 0 ? 'sanitized' : sanitized_content === html ? 'unchanged' : 'normalized';
  const explanations = {
    unchanged: 'The submitted text or basic formatting already matches the allowed HTML policy. No changes were needed.',
    sanitized: `The formatting-only policy removed ${removed_elements} HTML node(s) and ${removed_attributes} attribute(s). A removal indicates a policy change, not proof of an XSS attack.`,
    normalized: 'The HTML parser repaired or standardized the markup, such as tag casing, entities, or closing tags. No disallowed nodes or attributes were reported removed.',
  };
  return {
    status,
    sanitized_content,
    removed_count,
    removed_elements,
    removed_attributes,
    original_length: html.length,
    sanitized_length: sanitized_content.length,
    action: { unchanged: 'Accepted', sanitized: 'Removed disallowed HTML', normalized: 'Standardized HTML' }[status],
    explanation: explanations[status],
  };
}
