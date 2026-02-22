import DOMPurify from "dompurify";

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Allows common formatting tags used in chapter content while
 * stripping dangerous elements like <script>, event handlers, etc.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return "";

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      // Text formatting
      "b", "i", "u", "s", "em", "strong", "sub", "sup", "mark",
      // Block elements
      "p", "br", "hr", "div", "span", "blockquote", "pre", "code",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Lists
      "ul", "ol", "li",
      // Tables
      "table", "thead", "tbody", "tr", "th", "td",
      // Media (images only — no iframes, embeds)
      "img",
      // Links
      "a",
    ],
    ALLOWED_ATTR: [
      // Links
      "href", "target", "rel",
      // Images
      "src", "alt", "width", "height",
      // Tables
      "colspan", "rowspan",
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.-]|$))/i,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input", "textarea", "select", "button"],
    FORBID_ATTR: ["style", "id", "class", "onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur"],
  });
}
