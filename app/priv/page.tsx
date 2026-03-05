import Link from "next/link"

export default function PrivacyPolicy() {
  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
          <Link href="/" className="text-3xl font-black tracking-tighter">
            Zelteb
          </Link>
          <nav className="hidden md:flex gap-10 text-[15px] font-medium text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/about" className="hover:text-black">About</Link>
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
          </nav>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold transition-all hover:bg-gray-800">
            Dashboard
          </Link>
        </div>
      </header>

      {/* PRIVACY CONTENT */}
      <main className="max-w-4xl mx-auto px-8 py-24">
        <h1 className="text-[56px] md:text-[80px] font-bold tracking-tighter leading-none mb-4">
          Privacy Policy
        </h1>
        <p className="text-gray-500 font-medium mb-16 uppercase tracking-widest text-sm">
          Last updated: March 2025
        </p>

        <div className="space-y-20">

          {/* INTRO */}
          <section className="border-t border-gray-100 pt-12">
            <p className="text-gray-600 text-lg leading-relaxed">
              At Zelteb, your privacy matters. This Privacy Policy explains what information we collect when you use our platform, how we use it, and the choices you have. By using Zelteb, you agree to the practices described here. If you have any questions, please contact us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">support@zelteb.com</a>.
            </p>
          </section>

          {/* Section 1 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">
              1. Information We Collect
            </h2>
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold mb-3">Information You Provide to Us</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
                  <li>Name, email address, and password when you register</li>
                  <li>Profile information such as username, bio, and avatar</li>
                  <li>Payment and financial details processed through our payment partners</li>
                  <li>Product content you upload — videos, files, thumbnails, descriptions</li>
                  <li>Communications you send us via email or support channels</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Information Collected About Buyers</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We collect transactional data and contact details on behalf of sellers, including payment information necessary to process purchases and deliver digital products.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">Information Automatically Collected</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We automatically collect device identifiers, IP addresses, browser types, and usage data such as pages viewed and time spent, using cookies and similar technologies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We use the information we collect to operate, maintain, and improve Zelteb. This includes:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
              <li>Creating and managing your account</li>
              <li>Processing purchases and payouts to creators</li>
              <li>Sending transactional emails such as receipts and download links</li>
              <li>Providing customer support and responding to your requests</li>
              <li>Detecting and preventing fraud or abuse on the platform</li>
              <li>Analysing usage trends to improve our services</li>
              <li>Sending product updates or announcements (you can opt out anytime)</li>
            </ul>
            <div className="mt-8 bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              We do not sell your personal information to third parties — ever.
            </div>
          </section>

          {/* Section 3 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              3. Sharing of Information
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We do not sell, rent, or trade your personal information. We may share it only in these limited circumstances:
            </p>
            <div className="space-y-6">
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">With Service Providers</h4>
                <p className="text-gray-500">Trusted third-party services like Supabase and payment processors that help us operate the platform. They only access your data to perform services on our behalf.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Between Buyers and Creators</h4>
                <p className="text-gray-500">When you purchase a product, we share your name with the creator so they can fulfil the order.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">For Legal Reasons</h4>
                <p className="text-gray-500">We may disclose information if required by law or to protect the rights and safety of Zelteb, our users, or others.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              4. Cookies & Technologies
            </h2>
            <div className="grid gap-8">
              <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-4">What are cookies?</h3>
                <p className="text-gray-600 text-lg">Small data files stored on your device. We use both session cookies and persistent cookies to keep you logged in and personalise your experience.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Essential Cookies</h4>
                  <p className="text-gray-500 text-sm">Necessary for the site to function and provide services you request.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Functionality Cookies</h4>
                  <p className="text-gray-500 text-sm">Remember your choices and preferences for a personalised experience.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Analytics Cookies</h4>
                  <p className="text-gray-500 text-sm">Track traffic and usage to help us understand how the platform is used.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">No Ad Tracking</h4>
                  <p className="text-gray-500 text-sm">We do not use advertising or third-party tracking cookies on Zelteb.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              5. Data Storage & Security
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Your data is stored securely using Supabase, with access controls and encryption in place. Uploaded files are stored in private cloud storage and only accessible via time-limited signed URLs.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              While we take reasonable measures to protect your information, no system is 100% secure. We encourage you to use a strong, unique password for your Zelteb account.
            </p>
          </section>

          {/* Section 6 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              6. Your Rights
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">You have control over your personal information. You can:</p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
              <li>Access and update your account information at any time from your profile settings</li>
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of marketing emails by clicking "Unsubscribe" in any email we send</li>
            </ul>
            <p className="text-gray-600 text-lg leading-relaxed mt-6">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">
                support@zelteb.com
              </a>.
            </p>
          </section>

          {/* Section 7 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              7. Children's Privacy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Zelteb is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with their information, please contact us and we will promptly delete it.
            </p>
          </section>

          {/* Section 8 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              8. Changes to This Policy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. For significant changes, we may also notify you by email or a notice on the platform.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your continued use of Zelteb after any changes means you accept the updated policy.
            </p>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight max-w-md">
              Subscribe to get tips and tactics to grow the way you want.
            </h2>
            <div className="mt-10 flex max-w-lg bg-white rounded-md overflow-hidden p-1">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 text-black outline-none text-lg"
              />
              <button className="px-6 py-3 bg-[#f398e4] hover:bg-[#ef7cdb] text-black transition-colors flex items-center justify-center rounded-sm">
                <span className="text-2xl">→</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-20 gap-y-6 pt-2">
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="/" className="hover:text-gray-400">Home</Link>
              <Link href="/about" className="hover:text-gray-400">About</Link>
              <Link href="/pricing" className="hover:text-gray-400">Pricing</Link>
              <Link href="#" className="hover:text-gray-400">Features</Link>
              <Link href="#" className="hover:text-gray-400">Blog</Link>
            </div>
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="#" className="hover:text-gray-400">Help</Link>
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="/privacy" className="font-bold border-b-2 border-[#f398e4] w-fit">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}