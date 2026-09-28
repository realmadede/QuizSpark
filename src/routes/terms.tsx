import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsOfService,
  head: () => ({
    meta: [{ title: "Terms of Service - QuizSpark" }],
  }),
});

function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-16 text-[#171717] font-sans">
      <div className="mx-auto max-w-3xl glass-card p-8 md:p-12">
        <div className="mb-8">
          <Link
            to="/"
            className="text-[#00c767] hover:underline text-sm font-semibold"
          >
            &larr; Back to Home
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6">
          Terms of Service
        </h1>
        <p className="text-[#525252] mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-[#404040] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using QuizSpark, you agree to be bound by these
              Terms of Service. If you do not agree to these terms, please do
              not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              2. Description of Service
            </h2>
            <p>
              QuizSpark is a free, web-based platform that allows educators to
              create and host interactive quizzes, and allows students to
              participate in these quizzes in real-time. The service is provided
              entirely free of charge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              3. Acceptable Use
            </h2>
            <p>
              You agree to use QuizSpark only for lawful, educational, or
              entertainment purposes. You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the service to distribute malicious software or spam.</li>
              <li>Attempt to hack, disrupt, or overwhelm the servers.</li>
              <li>
                Create quizzes containing illegal, highly offensive, or explicit
                content.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              4. "As Is" Warranty
            </h2>
            <p>
              QuizSpark is built and maintained by a solo developer as a free
              tool for the education community. It is provided on an "AS IS" and
              "AS AVAILABLE" basis. While we strive for 100% uptime, we make no
              guarantees that the service will be uninterrupted, error-free, or
              completely secure. We are not liable for any data loss (e.g., lost
              quizzes).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">
              5. Account Termination
            </h2>
            <p>
              We reserve the right to terminate or suspend access to our service
              immediately, without prior notice or liability, for any reason
              whatsoever, including without limitation if you breach these
              Terms.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
