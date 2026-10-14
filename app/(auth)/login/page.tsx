import Link from "next/link";
import { Icon } from "@/components/shared/Icon";
import { GitHubSignInButton } from "@/components/admin/GitHubSignInButton";
import { WORDMARK_URL } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-surface-container-lowest border-2 border-on-surface rounded-lg shadow-[6px_6px_0px_0px_var(--color-ink)] p-8">
        <div className="flex flex-col items-center text-center space-y-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BuildLog Wordmark Logo"
            className="h-9 w-auto object-contain"
            src={WORDMARK_URL}
          />

          <div className="space-y-1.5">
            <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
              Admin Access
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sign in with GitHub to manage articles and projects.
            </p>
          </div>

          <GitHubSignInButton />

          <div className="w-full pt-2 border-t border-surface-container-high">
            <p className="font-mono-code text-label-sm text-on-surface-variant flex items-start gap-2 text-left">
              <Icon name="info" size={16} className="mt-0.5 shrink-0" />
              <span>
                Requires <code className="font-bold">AUTH_GITHUB_ID</code>,{" "}
                <code className="font-bold">AUTH_GITHUB_SECRET</code> and{" "}
                <code className="font-bold">AUTH_SECRET</code> in{" "}
                <code className="font-bold">.env.local</code>.
              </span>
            </p>
          </div>
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
