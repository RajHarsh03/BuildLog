import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind class names, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a Date (or ISO string) as "Oct 14, 2024". */
export function formatDate(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** Turn an arbitrary title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Humanize a slug for display: hyphens → spaces, each word capitalized.
 * e.g. "linux-file-system-hunting" -> "Linux File System Hunting" */
export function prettifySlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Build an absolute URL from the configured site URL. */
export function absoluteUrl(path = "/"): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/** GitHub account the profile image is served from (avatar stays in sync). */
export const GITHUB_USERNAME =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME || "RajHarsh03";

/** Author profile pulled from environment (single-author blog). */
export const author = {
  name: process.env.NEXT_PUBLIC_AUTHOR_NAME || "Harsh",
  handle: process.env.NEXT_PUBLIC_AUTHOR_HANDLE || "@harshxdotin",
  // Personal site the handle links to everywhere it appears.
  website: process.env.NEXT_PUBLIC_AUTHOR_WEBSITE || "https://harshx.in",
  // github.com/<user>.png 308-redirects to the account's current avatar.
  avatar:
    process.env.NEXT_PUBLIC_AUTHOR_AVATAR || `https://github.com/${GITHUB_USERNAME}.png`,
  role: "Author & Systems Builder",
  bio: "I'm a full-stack engineer and backend infrastructure enthusiast obsessed with mechanical sympathy, latency budgets, and minimal developer toolchains. When not shipping production APIs, I write open-source diagnostics and curate this journal.",
};

/** Wordmark logo, bundled from /public so it can never expire or 404. */
export const WORDMARK_URL = "/wordmark.png";
