import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center text-[#171717] font-sans">
      <div className="glass-card w-full max-w-md p-10 animate-pop-in">
        <h1 className="display-title text-[5rem] leading-none text-[#00c767] mb-2">
          404
        </h1>
        <h2 className="display-title text-2xl mb-4">Page not found</h2>
        <p className="text-[#525252] mb-8 text-sm leading-relaxed">
          Oops! We couldn't find the page you're looking for. It might have been
          moved or deleted.
        </p>
        <Link to="/" className="btn-primary w-full justify-center">
          Go back home
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center text-[#171717] font-sans">
      <div className="glass-card w-full max-w-md p-10 animate-pop-in">
        <h1 className="display-title text-2xl mb-3">Something went wrong</h1>
        <p className="text-[#525252] mb-8 text-sm leading-relaxed">
          We're sorry, but something unexpected happened on our end. You can try
          refreshing or head back home.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary w-full justify-center"
          >
            Try again
          </button>
          <a href="/" className="btn-ghost w-full justify-center">
            Go home
          </a>
        </div>
      </div>
    </main>
  );
}

function PendingComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] font-sans">
      <div className="flex flex-col items-center gap-4 animate-pop-in">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-[3.5px] border-[#e5e5e5]"></div>
          <div className="absolute inset-0 rounded-full border-[3.5px] border-[#00c767] border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-[#a3a3a3] animate-pulse tracking-wide">
          Loading QuizSpark...
        </p>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1, maximum-scale=1",
        },
        { name: "theme-color", content: "#00c767" },
        { title: "QuizSpark - Live Classroom Quizzes" },
        {
          name: "description",
          content:
            "Run live, real-time quiz games for your training center. Students join with a PIN.",
        },
        { property: "og:type", content: "website" },
        { property: "og:image", content: "/og-image.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: "/og-image.jpg" },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600;700;800;900&display=swap",
        },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "apple-touch-icon", href: "/favicon.svg" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    pendingComponent: PendingComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
