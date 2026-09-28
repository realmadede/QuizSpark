import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPolicy,
  head: () => ({
    meta: [{ title: "Privacy Policy - QuizSpark" }],
  }),
});

function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#fafafa] px-6 py-16 text-[#171717] font-sans">
      <div className="mx-auto max-w-3xl glass-card p-8 md:p-12">
        <div className="mb-8">
          <Link to="/" className="text-[#00c767] hover:underline text-sm font-semibold">
            &larr; Back to Home
          </Link>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6">
          Privacy & Cookie Policy
        </h1>
        <p className="text-[#525252] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="space-y-8 text-[#404040] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">1. Zero Student Data Guarantee</h2>
            <p>
              QuizSpark is built for education, which means student privacy is our absolute priority. 
              <strong> We do not collect, store, or sell any personal information from students.</strong> Students join games using a temporary Game PIN and a self-selected nickname. We do not track student IP addresses, we do not ask for emails, and no student accounts are created.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">2. Teacher Accounts</h2>
            <p>
              If you are a teacher hosting a game, we collect the minimum amount of information required to provide the service: your email address and an encrypted password. We use this strictly to secure your account and save your quizzes. We never sell your data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">3. How We Use Cookies (No Banner Required)</h2>
            <p>
              Under global privacy laws (like GDPR), websites must ask for permission to use tracking or advertising cookies. 
              <strong> QuizSpark does not use any tracking, analytics, or advertising cookies.</strong>
            </p>
            <p className="mt-3">
              We only use "Strictly Necessary" cookies. These are tiny pieces of data used exclusively to keep teachers logged in and to keep students connected to the correct live game session. Because these cookies are essential for the app to function and do not track you across the internet, you will not see an annoying cookie consent banner on our site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">4. Data Security</h2>
            <p>
              All data is transmitted securely via HTTPS and WebSocket encryption. Passwords are securely hashed before being stored in our database.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#171717] mb-3">5. Contact</h2>
            <p>
              If you have any questions about how your data is handled, please reach out to the developer via our <a href="https://github.com/realmadede/QuizSpark" target="_blank" rel="noopener noreferrer" className="text-[#00c767] hover:underline font-semibold">GitHub Repository</a> or{" "}
              <button 
                type="button"
                onClick={() => { window.location.href = `mailto:${atob("YmFnb213YXJhcGhhZWxAZ21haWwuY29t")}`; }} 
                className="text-[#00c767] hover:underline font-semibold cursor-pointer"
              >
                Send an Email
              </button>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
