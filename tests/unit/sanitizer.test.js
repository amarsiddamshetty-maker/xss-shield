import { describe, it, expect } from 'vitest';
import { analyzeHtml } from '../../server/services/sanitizer.js';

describe('HTML sanitization engine', () => {
  it('keeps ordinary text unchanged', () => {
    const result = analyzeHtml('Hello engineering students');
    expect(result.status).toBe('unchanged');
    expect(result.sanitized_content).toBe('Hello engineering students');
    expect(result.removed_count).toBe(0);
  });
  it('retains permitted formatting', () => {
    const html = '<p>Hello <strong>world</strong> and <em>friends</em>.</p>';
    expect(analyzeHtml(html).sanitized_content).toBe(html);
  });
  it('removes a disallowed element without calling it a confirmed attack', () => {
    const result = analyzeHtml('<p>Welcome</p><iframe></iframe>');
    expect(result.status).toBe('sanitized');
    expect(result.sanitized_content).toBe('<p>Welcome</p>');
    expect(result.removed_elements).toBeGreaterThan(0);
  });
  it('removes event attributes', () => {
    const result = analyzeHtml('<p onclick="void(0)">Hello</p>');
    expect(result.sanitized_content).toBe('<p>Hello</p>');
    expect(result.removed_attributes).toBe(1);
  });
  it('counts elements and attributes separately', () => {
    const result = analyzeHtml('<p title="hello">Welcome</p><iframe></iframe>');
    expect(result.removed_count).toBe(result.removed_elements + result.removed_attributes);
    expect(result.removed_elements).toBe(1);
    expect(result.removed_attributes).toBe(1);
  });
  it('classifies parser repairs as normalized', () => {
    const result = analyzeHtml('<P>Hello');
    expect(result.status).toBe('normalized');
    expect(result.sanitized_content).toBe('<p>Hello</p>');
    expect(result.removed_count).toBe(0);
  });
  it.each(['', '  ', '\n\t'])('rejects empty input %j', html => expect(() => analyzeHtml(html)).toThrow());
  it.each([undefined, null, 42, true, [], {}])('rejects non-string %j', html => expect(() => analyzeHtml(html)).toThrow());
  it('accepts the maximum length and rejects excess', () => {
    expect(analyzeHtml('a'.repeat(20000)).original_length).toBe(20000);
    expect(() => analyzeHtml('a'.repeat(20001))).toThrow();
  });
  it.each([
    '<script>void(0)</script><p>Keep</p>',
    '<svg><g onload="void(0)"></g></svg><p>Keep</p>',
    '<math><mtext><img src=x onerror="void(0)"></mtext></math><p>Keep</p>',
    '<a href="javascript:void(0)">Keep</a>',
    '<form id="attributes"><input name="parentNode"></form><p>Keep</p>',
    '<style>body{display:none}</style><p>Keep</p>',
    '<p data-any="value" aria-label="value" style="color:red">Keep</p>',
    '<template><img src=x onerror="void(0)"></template><p>Keep</p>',
    '<noscript><p title="x">Keep</p></noscript>',
  ])('keeps a restrictive policy for defensive fixture %s', html => {
    const result = analyzeHtml(html);
    expect(result.sanitized_content).not.toMatch(/<(script|svg|math|img|form|input|style|template|noscript|a)(\s|>)/i);
    expect(result.sanitized_content).not.toMatch(/\s(?:on\w+|style|href|src|data-any|aria-label)=/i);
    expect(analyzeHtml(result.sanitized_content || 'empty').sanitized_content).toBe(result.sanitized_content || 'empty');
  });
  it('reports original and output lengths accurately', () => {
    const html = '<p title="one">Hello</p>';
    const result = analyzeHtml(html);
    expect(result.original_length).toBe(html.length);
    expect(result.sanitized_length).toBe(result.sanitized_content.length);
    expect(result.action).toBeTruthy();
    expect(result.explanation).toBeTruthy();
  });
  it('does not treat synthetic DOM body as a removed input element', () => {
    expect(analyzeHtml('hello').removed_elements).toBe(0);
  });
  it('counts a user remove tag while excluding the parser sentinel', () => {
    const result = analyzeHtml('<remove>Keep this text</remove>');
    expect(result.status).toBe('sanitized');
    expect(result.removed_elements).toBe(1);
    expect(result.sanitized_content).toBe('Keep this text');
  });
});
