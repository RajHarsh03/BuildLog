import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { ReactElement } from "react";
import { CodeBlock } from "@/components/blog/CodeBlock";
import { slugify } from "@/lib/utils";
import type { TocItem } from "@/types/post";

export interface RenderedMdx {
  content: ReactElement;
  toc: TocItem[];
}

/** Minimal hast node shape (avoids a hard dependency on @types/hast). */
interface HastNode {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function nodeText(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  if (!node.children) return "";
  return node.children.map(nodeText).join("");
}

/**
 * Rehype plugin factory that assigns heading ids (h2/h3) using our `slugify` and
 * collects the table of contents in the same pass — guaranteeing the TOC anchors
 * exactly match the rendered heading ids (no github-slugger divergence).
 */
function makeTocPlugin(toc: TocItem[]) {
  return () => (tree: unknown) => {
    const seen = new Map<string, number>();
    const visit = (node: HastNode) => {
      if (
        node.type === "element" &&
        (node.tagName === "h2" || node.tagName === "h3")
      ) {
        const text = nodeText(node).trim();
        // The TOC renders its own 01/02 index — strip the author's leading
        // "1." / "2)" numbering from the display text (ids keep the full text).
        const display = text.replace(/^\d+[.)\-–]\s+/, "").trim() || text;
        const base = slugify(text) || "section";
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count === 0 ? base : `${base}-${count}`;
        node.properties = node.properties ?? {};
        node.properties.id = id;
        toc.push({ id, text: display, depth: node.tagName === "h2" ? 2 : 3 });
      }
      node.children?.forEach(visit);
    };
    visit(tree as HastNode);
  };
}

/** Wrap every <table> in a horizontally scrollable div. Tables cannot shrink
 * below their min-content width, so at larger reader font sizes a wide table
 * would otherwise burst out of the viewport. */
function makeTableWrapPlugin() {
  return () => (tree: unknown) => {
    const visit = (node: HastNode) => {
      if (!node.children) return;
      const nextChildren: HastNode[] = [];
      for (const child of node.children) {
        if (child.type === "element" && child.tagName === "table") {
          // Recurse INTO the table first (for nested tables), then wrap it.
          // The fresh wrapper is never re-visited, otherwise the wrap would
          // recurse onto itself and blow the stack.
          visit(child);
          nextChildren.push({
            type: "element",
            tagName: "div",
            properties: { className: ["table-scroll"] },
            children: [child],
          });
        } else {
          nextChildren.push(child);
          visit(child);
        }
      }
      node.children = nextChildren;
    };
    visit(tree as HastNode);
  };
}

/** Compile an MDX string (from the DB) into a React element + table of contents. */
export async function renderMdx(source: string): Promise<RenderedMdx> {
  const toc: TocItem[] = [];

  const { content } = await compileMDX({
    source: source || "",
    components: {
      // Wrap code blocks in the neo-brutalist terminal window with a copy button.
      pre: CodeBlock as never,
    },
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          makeTocPlugin(toc),
          makeTableWrapPlugin(),
          [
            rehypePrettyCode,
            {
              // Dual themes: emits code[data-theme="light|dark"] blocks; CSS
              // in globals.css toggles them with the .dark class.
              theme: { light: "github-light", dark: "github-dark" },
              keepBackground: false,
            },
          ],
        ],
      },
    },
  });

  return { content, toc };
}
