import { GitHubSignInButton } from "@/components/admin/GitHubSignInButton";
import { LoginError } from "@/components/admin/LoginError";
import { WORDMARK_URL } from "@/lib/utils";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[6px_6px_0px_0px_var(--color-ink)] overflow-hidden">
        {/* Terminal chrome - same visual family as the code blocks inside articles.
            Fixed dark palette on purpose: it is the window title bar, not content. */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1C2B33] border-b-2 border-on-surface">
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] border border-black/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] border border-black/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#28C840] border border-black/40" />
          </span>
          <span className="font-mono-code text-[11px] tracking-wider text-[#9CDCB4] truncate">
            admin@buildlog: ~/auth
          </span>
          <span className="ml-auto flex items-center gap-1.5 font-mono-code text-[10px] uppercase tracking-wider text-[#8FA8B8]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#28C840] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#28C840]" />
            </span>
            secure
          </span>
        </div>

        <div className="p-7 sm:p-8 space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="BuildLog Wordmark Logo"
              className="h-9 w-auto object-contain dark:[filter:invert(1)_hue-rotate(180deg)]"
              src={WORDMARK_URL}
            />

            <div className="space-y-1.5">
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                Admin Access
              </h1>
              <p className="font-body-md text-[13px] leading-relaxed sm:text-body-md text-on-surface-variant">
                Sign in with GitHub to manage articles, projects and comments.
              </p>
            </div>
          </div>

          <LoginError error={error} />

          <GitHubSignInButton />
        </div>
      </div>
    </div>
  );
}
