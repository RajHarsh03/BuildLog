/* eslint-disable no-console */
import { config as loadEnv } from "dotenv";
import { resolve } from "path";
import readingTime from "reading-time";

// Load .env.local (and fall back to .env) before importing anything that reads env.
loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

import { dbConnect } from "../lib/db/mongodb";
import { PostModel } from "../lib/db/models/Post";
import { ProjectModel } from "../lib/db/models/Project";
import { slugify } from "../lib/utils";

const FEATURED_CONTENT = `Running code locally is a profound narcotic. Your queries return in under 1.2 milliseconds over UNIX domain sockets, your Redis instance has zero contention, and your mock payment gateway responds with pristine HTTP 200 statuses on every invocation.

When we cut DNS records over to our inaugural edge cluster on a Tuesday morning, that tranquil equilibrium evaporated within forty minutes. We experienced our first cascade outage not because of incorrect business logic, but because our service treated network boundaries as if they were zero-cost function calls.

## The Illusion of Localhost

On your laptop, memory allocations are cheap, cache locality is perfect, and network jitter simply does not exist. Inside a Kubernetes pod sharing a physical node with twelve noisy neighbors, TCP connection handshakes take real time. If your client does not reuse connections via HTTP Keep-Alive, ephemeral port exhaustion will silently choke your container long before your CPU reaches 50% utilization.

| Environment | p50 | p90 | p99 |
| --- | --- | --- | --- |
| Localhost | 1.2ms | 2.8ms | 4.1ms |
| Production node | 18.4ms | 64.0ms | 312.8ms |

The tail latency degradation factor was **76.2x**. That single number reshaped our entire approach to timeouts.

## Mistake #1: Unbounded Connection Pools

The natural rookie inclination when requests back up is to increase pool sizes. We configured Postgres pool parameters to \`max_connections: 300\` per replica. When traffic multiplied during a marketing burst, thirty API replicas each opened hundreds of sockets.

PostgreSQL operates on a process-per-connection model. Instead of speeding up throughput, the database engine spent 80% of its CPU time context switching across active backend worker threads. Latency skyrocketed from 25ms to timeout levels (>10,000ms).

\`\`\`ts title="src/middleware/rate-limiter.ts"
// Redis-backed sliding window rate limiter to protect downstream pool
import { Redis } from 'ioredis';

export async function slidingWindowCheck(
  redis: Redis,
  identifier: string,
  limit: number,
  windowMs: number = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const key = \`rate_limit:\${identifier}\`;
  const clearBefore = now - windowMs;

  const tx = redis.multi();
  tx.zremrangebyscore(key, 0, clearBefore);
  tx.zadd(key, now, \`\${now}-\${Math.random()}\`);
  tx.zcard(key);
  tx.pexpire(key, windowMs);

  const results = await tx.exec();
  const totalRequests = results?.[2]?.[1] as number || 0;

  return {
    allowed: totalRequests <= limit,
    remaining: Math.max(0, limit - totalRequests)
  };
}
\`\`\`

## The Idempotency Key Pattern

Clients will retry requests. When an upstream gateway times out at 3,000ms, the mobile application does not know whether the database commit succeeded or failed. If you blindly re-process financial or creation payloads, you risk duplicate charges and data corruption.

By caching the cryptographic SHA-256 digest of incoming bodies alongside the idempotency key, we detect both naive retries and fraudulent key reuse with conflicting transaction payloads.

## Graceful Degradation & Circuit Breakers

When third-party fraud detection APIs began responding with 8,000ms latency, our web tier threads stacked up waiting for upstream responses. Our service died without our own infrastructure ever doing any heavy lifting.

We implemented an in-memory circuit breaker pattern: after five consecutive failures or timeouts, the breaker trips to **OPEN** for 30 seconds. In this degraded mode, non-essential analysis was offloaded to an asynchronous background worker pool, allowing core write transactions to finalize unhindered.

## What Broke in Production

> "The hardest bugs are rarely syntax errors; they are mismatched implicit assumptions between asynchronous boundaries."
> — Incident Post-Mortem #INC-1094

The most catastrophic failure during month one occurred during an automatic database maintenance failover. The DNS record for our primary database switched in AWS Route53, but the Node.js process runtime had cached the IP address indefinitely at the OS libc level. The app continued banging on a read-only replica for fifteen harrowing minutes until we forced container restarts.

## Key Takeaways for Solo Devs

If you are building your first service intended to handle real-world transactions without an operations team, burn these four principles into your memory:

1. **Enforce aggressive client timeouts.** Never invoke an external HTTP endpoint without an explicit 2.5s \`AbortController\` timeout. Indefinite socket hangs are system killers.
2. **Size pools to CPU cores, not request optimism.** Optimal pool sizing is usually \`(CPU cores * 2) + disk spindles\`. For a 4-core database, a pool of 10-15 connections consistently outperforms 200.
3. **Make mutating operations idempotent by default.** Store idempotency records in the same relational transaction as your business state whenever absolute reliability is non-negotiable.
4. **Instrument structured logging with trace IDs.** When an issue occurs at 3 AM, regex-matching across unstructured logs is painful. Propagate a unique request ID across every sub-system.
`;

function sectioned(title: string, paragraphs: string[], code?: { lang: string; body: string }) {
  let md = `${paragraphs[0]}\n\n## Why it matters\n\n${paragraphs[1] ?? ""}\n`;
  if (code) {
    md += `\n\`\`\`${code.lang}\n${code.body}\n\`\`\`\n`;
  }
  md += `\n## What I would do differently\n\n${paragraphs[2] ?? paragraphs[1] ?? ""}\n`;
  md += `\n## Key takeaways\n\n- Start small and measure everything.\n- Prefer boring, well-understood tools.\n- Write the postmortem while the details are fresh.\n`;
  return md;
}

type SeedPost = {
  title: string;
  category: string;
  tags: string[];
  date: string;
  excerpt: string;
  content: string;
  featured?: boolean;
};

const POSTS: SeedPost[] = [
  {
    title: "What I Learned Building My First Production-Ready API",
    category: "Software Engineering",
    tags: ["Node.js", "Postgres", "Performance"],
    date: "2024-10-14",
    featured: true,
    excerpt:
      "Architectural lessons on connection pooling, idempotency keys, and graceful backoff under heavy loads.",
    content: FEATURED_CONTENT,
  },
  {
    title: "Understanding React Rendering by Building It From Scratch",
    category: "Web Development",
    tags: ["React", "TypeScript"],
    date: "2024-10-02",
    excerpt:
      "Deconstructing the reconciliation engine, component fiber trees, and commit phases with 200 lines of plain JavaScript.",
    content: sectioned(
      "React",
      [
        "React feels like magic until you build a miniature version of it yourself. The moment you implement a fiber tree and a scheduler, the reconciliation algorithm stops being mysterious and starts being obvious.",
        "The core insight is that React never touches the real DOM during render. It builds a virtual description first, diffs it against the previous tree, and only then commits the minimal set of mutations.",
        "Batching state updates is what makes the whole model performant. Without it, every keystroke would trigger a full synchronous re-render.",
      ],
      { lang: "jsx", body: "function render(fiber) {\n  const children = fiber.type(fiber.props);\n  reconcile(fiber, children);\n  commitWork(fiber.alternate);\n}" },
    ),
  },
  {
    title: "What Broke When I Added Authentication",
    category: "DevOps",
    tags: ["Auth", "Security", "JWT"],
    date: "2024-09-21",
    excerpt:
      "The subtle security bugs, cookie race conditions, and CORS pitfalls that only show up on cross-domain production setups.",
    content: sectioned(
      "Auth",
      [
        "Authentication is the first feature where a working localhost demo tells you almost nothing about production behavior. Cookies, SameSite attributes, and CORS all interact in ways that only surface once you deploy behind a real domain.",
        "Silent JWT rotation failures were the worst offender: the refresh worked in isolation but raced with concurrent tabs, invalidating sessions at random.",
        "The fix was to serialize refreshes through a single in-flight promise and to make cookie attributes explicit rather than relying on browser defaults.",
      ],
      { lang: "ts", body: "let refreshInFlight: Promise<string> | null = null;\nexport function refresh() {\n  refreshInFlight ??= doRefresh().finally(() => (refreshInFlight = null));\n  return refreshInFlight;\n}" },
    ),
  },
  {
    title: "Why I Started Building My Own Developer Tools",
    category: "Career & Philosophy",
    tags: ["Productivity", "CLI", "Rust"],
    date: "2024-09-08",
    excerpt:
      "Off-the-shelf tooling often has 80% bloat. How building hyper-specific internal CLI tools 10x'd my velocity.",
    content: sectioned(
      "Tools",
      [
        "Every off-the-shelf tool solves a general problem, which means it carries 80% of features you will never use and hides the 20% you actually need behind menus.",
        "Building small, opinionated CLI tools removed that friction. A 120-line Rust binary that does exactly one thing beats a configurable suite you have to relearn every month.",
        "The compounding leverage is real: each tool saves minutes daily, and those minutes turn into shipped features.",
      ],
      { lang: "bash", body: "# my one-job deploy script\ndeploy() { pnpm build && rsync -az dist/ prod:/var/www && systemctl reload app; }" },
    ),
  },
  {
    title: "Lessons From Shipping My First Full-Stack Project",
    category: "Projects",
    tags: ["Full-Stack", "Next.js", "Stripe"],
    date: "2024-08-24",
    excerpt:
      "The emotional rollercoaster of going from localhost:3000 to real users, bug reports, and database migrations.",
    content: sectioned(
      "Shipping",
      [
        "Shipping is a different skill from building. The first time a real stranger filed a bug report, I understood why production experience matters more than clean abstractions.",
        "Database migrations were the scariest part. A single bad migration on live data is irreversible in a way that a bad deploy never is.",
        "I now write every migration to be backward compatible and reversible, and I run it against a copy of production before touching the real thing.",
      ],
      { lang: "sql", body: "ALTER TABLE orders ADD COLUMN currency TEXT DEFAULT 'USD';\n-- backfill, verify, then tighten the constraint in a later deploy" },
    ),
  },
  {
    title: "How I Organize Large React Applications",
    category: "Web Development",
    tags: ["Architecture", "Clean Code"],
    date: "2024-08-12",
    excerpt:
      "Feature-sliced design vs layer-based folders: a pragmatic breakdown after maintaining a 50k LOC codebase.",
    content: sectioned(
      "Structure",
      [
        "Folder structure is a communication tool. After maintaining a 50k LOC React codebase, I stopped organizing by technical layer and started organizing by feature.",
        "Feature-sliced design keeps related code together, which makes deletion safe and ownership obvious. Layer-based folders scatter a single feature across five directories.",
        "The pragmatic middle ground: slice by feature, but keep a thin shared layer for truly generic primitives.",
      ],
      { lang: "text", body: "src/\n  features/checkout/\n    ui/ model/ api/\n  shared/ui/" },
    ),
  },
  {
    title: "Demystifying Vector Databases: A Practical Guide",
    category: "AI / ML",
    tags: ["Vector DB", "Python", "AI"],
    date: "2024-07-29",
    excerpt:
      "Embeddings, cosine similarity, and building HNSW index pipelines in pgvector without paying managed API taxes.",
    content: sectioned(
      "Vectors",
      [
        "A vector database is just an index over embeddings with a similarity operator. Once you see it that way, pgvector covers 90% of what a managed service sells you.",
        "Cosine similarity and an HNSW index give you approximate nearest-neighbor search that is fast enough for most retrieval workloads.",
        "The real work is chunking and embedding quality, not the database. Garbage chunks produce garbage retrieval no matter how good your index is.",
      ],
      { lang: "sql", body: "CREATE INDEX ON items USING hnsw (embedding vector_cosine_ops);\nSELECT * FROM items ORDER BY embedding <=> $1 LIMIT 5;" },
    ),
  },
  {
    title: "Zero-Downtime Database Migrations in Postgres",
    category: "DevOps",
    tags: ["Database", "PostgreSQL"],
    date: "2024-07-15",
    excerpt:
      "Table locks, concurrent index creation, and column renaming strategies for live multi-tenant tables.",
    content: sectioned(
      "Migrations",
      [
        "A migration that locks a busy table is an outage with extra steps. Every schema change on live data must assume the table is hot.",
        "CREATE INDEX CONCURRENTLY, expand/contract column renames, and nullable-first additions let you change schema without stopping writes.",
        "The expand/contract pattern is the backbone: add the new column, dual-write, backfill, switch reads, then drop the old column in a later deploy.",
      ],
      { lang: "sql", body: "CREATE INDEX CONCURRENTLY idx_orders_email ON orders (email);" },
    ),
  },
  {
    title: "Why Postgres B-Trees Degrade Over High Write Churn",
    category: "Database Internals",
    tags: ["Postgres", "Performance"],
    date: "2024-09-28",
    excerpt:
      "Investigating index page fragmentation and the mechanics of HOT updates under write-heavy loads.",
    content: sectioned(
      "B-Trees",
      [
        "Under heavy write churn, Postgres indexes fragment and bloat, and query plans quietly get worse even though the data volume barely changed.",
        "HOT updates avoid touching indexes when the indexed columns are unchanged, but they only work when there is free space on the same page.",
        "Regular REINDEX CONCURRENTLY and sane fillfactor settings keep B-trees compact and predictable.",
      ],
      { lang: "sql", body: "REINDEX INDEX CONCURRENTLY idx_orders_email;" },
    ),
  },
  {
    title: "Zero-Dependency Observability: Building an eBPF Probe in Rust",
    category: "Dev Tools",
    tags: ["Rust", "eBPF", "Observability"],
    date: "2024-08-19",
    excerpt:
      "Tracing socket latencies at the kernel layer without adding APM agent overhead to Node services.",
    content: sectioned(
      "eBPF",
      [
        "APM agents add overhead and dependencies to every service. An eBPF probe observes the kernel directly and costs the application nothing.",
        "Attaching to socket syscalls lets you measure real network latency from outside the process, with no code changes to the app.",
        "Rust plus libbpf gives you a safe, single-binary collector you can drop onto any host.",
      ],
      { lang: "rust", body: "#[kprobe]\npub fn sys_sendmsg(ctx: ProbeContext) -> u32 {\n    let start = bpf_ktime_get_ns();\n    record_start(ctx.pid()?, start);\n    0\n}" },
    ),
  },
  {
    title: "TCP Head-of-Line Blocking and HTTP/3 Realities",
    category: "Networking",
    tags: ["Networking", "HTTP/3", "QUIC"],
    date: "2024-07-02",
    excerpt:
      "Benchmarking packet loss resilience across transcontinental edge connections using QUIC.",
    content: sectioned(
      "HTTP/3",
      [
        "HTTP/2 multiplexes streams over one TCP connection, which means a single lost packet stalls every stream. That is head-of-line blocking.",
        "QUIC runs streams over UDP so a lost packet only affects its own stream. On lossy long-haul links the difference is dramatic.",
        "In our benchmarks, HTTP/3 cut p95 page load by 30% on transcontinental connections with 1% packet loss.",
      ],
      { lang: "text", body: "HTTP/2 over TCP: one lost segment stalls all streams\nHTTP/3 over QUIC: only the affected stream waits" },
    ),
  },
];

const PROJECTS = [
  {
    name: "AI Code Reviewer",
    description:
      "An automated pull request intelligence agent that parses AST diffs, traces variable call graphs, and identifies potential concurrency races before PRs hit staging.",
    technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "OpenAI API", "Docker"],
    status: "active" as const,
    featured: true,
    githubUrl: "https://github.com",
    liveUrl: "https://github.com",
  },
  {
    name: "QueryLens",
    description:
      "A lightweight desktop visualizer for PostgreSQL EXPLAIN ANALYZE execution plans. Converts recursive node JSON into bottleneck heatmaps and memory consumption trees.",
    technologies: ["Tauri", "Rust", "React", "TailwindCSS", "Chart.js"],
    status: "shipped" as const,
    featured: false,
    githubUrl: "https://github.com",
  },
  {
    name: "FastQueue",
    description:
      "An ultra-minimalist embedded in-memory FIFO message broker with disk-backed write-ahead logging. Zero network dependencies, sub-millisecond serialization over gRPC.",
    technologies: ["Go", "RocksDB", "gRPC", "Protobuf"],
    status: "active" as const,
    featured: false,
    githubUrl: "https://github.com",
  },
  {
    name: "Dotfiles & Dev Environment",
    description:
      "My curated reproducible Neovim, Tmux, and macOS development setup. Custom Lua keymaps, LSP zero-config, and auto-syncing terminal colorways.",
    technologies: ["Lua", "Bash", "Neovim", "Tmux"],
    status: "shipped" as const,
    featured: false,
    githubUrl: "https://github.com",
  },
  {
    name: "StaticCraft",
    description:
      "A zero-dependency markdown static site generator built to explore compilation pipelines, incremental file hashing, and edge SSR generation.",
    technologies: ["TypeScript", "Node.js", "Marked"],
    status: "shipped" as const,
    featured: false,
    githubUrl: "https://github.com",
  },
  {
    name: "MicroCache",
    description:
      "Experimental LRU cache with adaptive eviction based on access frequency histograms. Compiled to WASM for in-browser memoization benchmarking.",
    technologies: ["Rust", "WebAssembly", "Wasm-bindgen"],
    status: "archived" as const,
    featured: false,
    githubUrl: "https://github.com",
  },
];

async function main() {
  await dbConnect();
  console.log("Connected to MongoDB. Seeding...");

  await PostModel.deleteMany({});
  await ProjectModel.deleteMany({});

  for (const p of POSTS) {
    const minutes = Math.max(1, Math.round(readingTime(p.content).minutes));
    await PostModel.create({
      title: p.title,
      slug: slugify(p.title),
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      tags: p.tags,
      status: "published",
      featured: p.featured ?? false,
      readingTime: minutes,
      publishedAt: new Date(p.date),
      seoTitle: p.title,
      seoDescription: p.excerpt,
    });
  }

  for (const proj of PROJECTS) {
    await ProjectModel.create({
      name: proj.name,
      slug: slugify(proj.name),
      description: proj.description,
      technologies: proj.technologies,
      status: proj.status,
      featured: proj.featured,
      githubUrl: proj.githubUrl,
      liveUrl: proj.liveUrl,
    });
  }

  console.log(`Seeded ${POSTS.length} posts and ${PROJECTS.length} projects.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
