"use client";

import { useMemo } from "react";
import { Icon } from "@/components/shared/Icon";
import { slugify } from "@/lib/utils";

interface MarkdownPreviewProps {
  /** Raw MDX/Markdown source from the editor textarea. */
  content: string;
}

/**
 * Lightweight, dependency-free live preview for the admin editor.
 *
 * Note: the *public* site renders content through the full server MDX pipeline
 * (`lib/mdx/render.ts` with Shiki). A route handler can't be used here because
 * Next.js forbids importing `react-dom/server` in the RSC layer, so the editor
 * uses this fast client-side Markdown renderer for an instant structural
 * preview. Fenced code, headings, lists, tables, quotes and inline styles are
 * all supported; syntax highlighting is applied on the published page.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Render inline markdown (code, images, links, bold, italic) to HTML. */
function inline(text: string): string {
  let out = escapeHtml(text);
  // inline code
  out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
  // images
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" />');
  // links
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  // bold
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  // italic (avoid touching ** which are already converted)
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/(^|[^_\w])_([^_\n]+)_/g, "$1<em>$2</em>");
  return out;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

/** Convert a Markdown string to an HTML string (block-level). */
function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let para: string[] = [];
  let i = 0;

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fence = line.match(/^\s*```([\w+-]*)/);
    if (fence) {
      flushPara();
      const lang = fence[1] || "text";
      const buf: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        buf.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence
      html.push(
        `<pre data-language="${escapeHtml(lang)}"><code>${escapeHtml(buf.join("\n"))}</code></pre>`,
      );
      continue;
    }

    // Heading
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara();
      const level = h[1].length;
      const text = h[2].trim();
      const id = slugify(text);
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^\s*(\*\*\*|---|___)\s*$/.test(line)) {
      flushPara();
      html.push("<hr />");
      i += 1;
      continue;
    }

    // Blockquote
    if (/^\s*>\s?/.test(line)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote><p>${inline(buf.join(" "))}</p></blockquote>`);
      continue;
    }

    // Table (header row followed by a separator row)
    const next = lines[i + 1] ?? "";
    if (
      line.includes("|") &&
      next.includes("-") &&
      /^\s*\|?[\s:|-]+\|?\s*$/.test(next)
    ) {
      flushPara();
      const header = splitRow(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|") && lines[i].trim() !== "") {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      let table =
        "<table><thead><tr>" +
        header.map((c) => `<th>${inline(c)}</th>`).join("") +
        "</tr></thead><tbody>";
      for (const r of rows) {
        table += "<tr>" + r.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
      }
      table += "</tbody></table>";
      html.push(table);
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i += 1;
      }
      html.push("<ul>" + buf.map((it) => `<li>${inline(it)}</li>`).join("") + "</ul>");
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      flushPara();
      const buf: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        buf.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i += 1;
      }
      html.push("<ol>" + buf.map((it) => `<li>${inline(it)}</li>`).join("") + "</ol>");
      continue;
    }

    // Blank line
    if (line.trim() === "") {
      flushPara();
      i += 1;
      continue;
    }

    // Paragraph text
    para.push(line.trim());
    i += 1;
  }

  flushPara();
  return html.join("\n");
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const html = useMemo(
    () => (content.trim() ? markdownToHtml(content) : ""),
    [content],
  );

  if (!content.trim()) {
    return (
      <div className="h-full min-h-[200px] grid place-items-center text-center p-8 text-on-surface-variant">
        <div>
          <Icon name="visibility" size={32} className="mx-auto" />
          <p className="font-body-sm text-body-sm mt-2">
            Start writing to see a live preview.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mdx-content p-5 text-on-surface"
      // Self-rendered, escaped HTML from the trusted editor source.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
