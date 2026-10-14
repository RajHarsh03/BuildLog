import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

/** Minimal centered shell for the auth route group (no site header/footer). */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center bg-background px-4 py-16">
      {children}
    </main>
  );
}
