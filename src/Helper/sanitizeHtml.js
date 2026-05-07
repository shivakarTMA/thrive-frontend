import DOMPurify from "dompurify";

export const sanitizeHtml = (html) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "b",
      "strong",
      "i",
      "em",
      "u",
      "ul",
      "ol",
      "li",
      "table",
      "thead",
      "tbody",
      "tr",
      "td",
      "th",
      "a",
      "img",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "style",
      "target",
    ],
    // ALLOWED_ATTR: ["style"],

    FORBID_TAGS: ["script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],

    ALLOW_DATA_ATTR: false
  });
};