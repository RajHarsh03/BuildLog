import { revalidateTag } from "next/cache";
import { cached } from "@/lib/content/cached";
import { dbConnect } from "@/lib/db/mongodb";
import { AboutModel, serializeAbout } from "@/lib/db/models/About";
import type { AboutContent, AboutInput } from "@/types/about";

/** Initial document, seeded on first read so /about never renders empty. */
export const DEFAULT_ABOUT: AboutInput = {
  intro:
    "I'm a full-stack engineer and backend infrastructure enthusiast obsessed with mechanical sympathy, latency budgets, and minimal developer toolchains. When not shipping production APIs, I write open-source diagnostics and curate this journal.",
  skills: [
    {
      group: "Languages",
      icon: "code",
      items: ["TypeScript", "JavaScript", "Go", "Rust", "Python", "SQL"],
    },
    {
      group: "Backend & Data",
      icon: "database",
      items: ["Node.js", "PostgreSQL", "MongoDB", "Redis", "gRPC", "pgvector"],
    },
    {
      group: "Frontend",
      icon: "web",
      items: ["React", "Next.js", "Tailwind CSS", "Vite", "WebAssembly"],
    },
    {
      group: "Infrastructure",
      icon: "cloud",
      items: ["Docker", "Linux", "CI/CD", "Observability", "Edge SSR"],
    },
  ],
  journey: [
    {
      year: "2022",
      title: "First lines in production",
      body: "Started shipping internal tools and learned that readable code beats clever code the moment someone else has to maintain it at 2am.",
      featured: true,
    },
    {
      year: "2023",
      title: "Down the systems rabbit hole",
      body: "Built embedded queues and caches, profiled latency budgets, and developed a lasting obsession with mechanical sympathy.",
      featured: true,
    },
    {
      year: "2024",
      title: "Open source & writing",
      body: "Released diagnostics tooling and started documenting every postmortem. This journal is the compounding artifact of that habit.",
      featured: true,
    },
    {
      year: "2025",
      title: "Agentic tooling",
      body: "Currently exploring AST-aware automation and AI-assisted code review that respects developer intent instead of guessing at it.",
      featured: true,
    },
  ],
};

async function getAboutContentUncached(): Promise<AboutContent> {
  await dbConnect();
  let doc = await AboutModel.findOne({}).lean();
  if (!doc) {
    doc = (await AboutModel.create(DEFAULT_ABOUT)).toObject();
  }
  return serializeAbout(doc as never);
}

// Cached across requests like posts/projects; edits revalidate the "about" tag.
export const getAboutContent = cached(
  getAboutContentUncached,
  ["getAboutContent"],
  { tags: ["about"], revalidate: 300 },
);

/** Replace the singleton About document (dashboard editor entry point). */
export async function updateAboutContent(input: AboutInput): Promise<AboutContent> {
  await dbConnect();
  const doc = await AboutModel.findOneAndUpdate({}, input, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true,
  }).lean();
  revalidateTag("about");
  return serializeAbout(doc as never);
}

/** Starred milestones for the public page: newest first, capped at 4, chronological. */
export const JOURNEY_MAX = 4;

export function featuredJourney(content: AboutContent) {
  return content.journey
    .filter((j) => j.featured)
    .sort((a, b) => Number(b.year) - Number(a.year))
    .slice(0, JOURNEY_MAX)
    .sort((a, b) => Number(a.year) - Number(b.year));
}
