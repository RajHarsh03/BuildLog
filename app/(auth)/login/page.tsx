import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
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
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[6px_6px_0px_0px_var(--color-ink)] p-8">
        <div className="flex flex-col items-center text-center space-y-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BuildLog Wordmark Logo"
            className="h-9 w-auto object-contain dark:[filter:invert(1)_hue-rotate(180deg)]"
            src={WORDMARK_URL}
          />

          <LoginError error={error} />

          <div className="space-y-1.5">
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
              Admin Access
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sign in with GitHub to manage articles and projects.
            </p>
          </div>

          <GitHubSignInButton />
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono-code text-label-md font-bold text-on-surface-variant hover:text-primary transition-colors"
        >
          <Icon name="arrow_back" size={16} />
          <span>Back to the journal</span>
        </Link>
      </div>
    </div>
  );
}
