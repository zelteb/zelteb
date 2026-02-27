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
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
            <Link href="#" className="hover:text-black">Blog</Link>
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
        <p className="text-gray-500 font-medium mb-16 uppercase tracking-widest text-sm">Last updated: February 7, 2026</p>
        
        <div className="space-y-20">
          {/* Section 1: Types of Data */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">1. Types of Data We Collect</h2>
            
            <div className="space-y-10">
              <div>
                <h3 className="text-xl font-bold mb-3">Information You Provide to Us</h3>
                <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
                  <li>Contact information (name, user ID, e-mail address, phone number).</li>
                  <li>Financial and transactional information for sellers to remit payments.</li>
                  <li>Marketing preferences and engagement details.</li>
                  <li>Correspondence, chats, and dispute resolution records.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Information We Collect About Buyers</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We collect information from or on behalf of our sellers, including transactional data, payment information (credit card numbers), and contact details necessary for delivery.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-3">Information Automatically Collected</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  We automatically collect device identifiers, IP addresses, browser types, and usage data (pages viewed, time spent) using cookies and similar technologies.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Third Party Platforms */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">2. Social Media & Third Parties</h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We may offer single sign-on services and interact with third-party platforms like Facebook, Twitter, and Instagram. Your interactions on these platforms are governed by their respective privacy policies.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700">
              Note: If you disclose sensitive personal information, you consent to our processing of that data in accordance with this policy.
            </div>
          </section>

          {/* Section 3: Cookies */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">3. Cookies & Technologies</h2>
            <div className="grid gap-8">
              <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
                <h3 className="text-xl font-bold mb-4">What are cookies?</h3>
                <p className="text-gray-600 text-lg">Small data files stored on your device. We use both session cookies and persistent cookies to personalize your experience.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Essential Cookies</h4>
                  <p className="text-gray-500 text-sm">Necessary for the site to function and provide services you request.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Functionality Cookies</h4>
                  <p className="text-gray-500 text-sm">Remember your choices and preferences for a personal experience.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Analytics Cookies</h4>
                  <p className="text-gray-500 text-sm">Track traffic and usage via Google Analytics, Optimizely, and New Relic.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl">
                  <h4 className="font-bold mb-2">Targeted Advertising</h4>
                  <p className="text-gray-500 text-sm">Group users by interests to deliver relevant advertisements.</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* FOOTER - EXACT SCREENSHOT STYLE */}
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
              <Link href="#" className="hover:text-gray-400">Discover</Link>
              <Link href="#" className="hover:text-gray-400">Blog</Link>
              <Link href="/pricing" className="hover:text-black">Pricing</Link>
              <Link href="#" className="hover:text-gray-400">Features</Link>
              <Link href="#" className="hover:text-gray-400">About</Link>
              <Link href="#" className="hover:text-gray-400">Small Bets</Link>
            </div>
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="#" className="hover:text-gray-400">Help</Link>
              <Link href="#" className="hover:text-gray-400">Board meetings</Link>
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-400 font-bold border-b-2 border-[#f398e4] w-fit">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}