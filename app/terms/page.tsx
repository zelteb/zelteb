import Link from "next/link"

export default function Terms() {
  const sections = [
    {
      id: "1",
      title: "Who We Are",
      content: "We provide tools for creators to upload, sell, and distribute digital products such as videos, courses, and documents. We act as a marketplace and are not the seller of the creator’s content."
    },
    {
      id: "2",
      title: "Accounts",
      content: "You must provide accurate information when creating an account. You are responsible for all activity under your account and for keeping your login credentials secure. We may suspend or terminate accounts that violate these terms."
    },
    {
      id: "3",
      title: "Creator Responsibilities",
      content: "Creators agree that they own or have rights to the content they upload. Content must not infringe copyright, trademark, privacy, or any law. Creators are responsible for customer support, and product descriptions must be accurate."
    },
    {
      id: "4",
      title: "Platform Fee",
      content: "We take 30% of each successful sale. The remaining balance belongs to the creator and will be available for payout according to our payout rules. Fees may change in the future with notice."
    },
    {
      id: "5",
      title: "Payments & Payouts",
      content: "Creators receive earnings after successful payment confirmation, expiry of refund or dispute windows, and fraud checks. We may delay or cancel payouts in cases of suspected abuse."
    },
    {
      id: "6",
      title: "Refunds",
      content: "Refund policies may be defined by creators. However, we reserve the right to issue refunds to protect customers, prevent fraud, or comply with laws."
    },
    {
      id: "7",
      title: "Digital Delivery",
      content: "Products are delivered digitally. We are not responsible for external links provided by creators (e.g., cloud storage links)."
    },
    {
      id: "8",
      title: "Prohibited Content & Activities",
      content: "You may not use the platform for illegal material, copyright piracy, harmful content, scams, or attempting to bypass fees. Violation can lead to permanent bans."
    },
    {
      id: "9",
      title: "Intellectual Property",
      content: "Creators retain ownership of their content. By uploading, creators grant us permission to host, display, promote, and distribute the content on the platform."
    },
    {
      id: "10",
      title: "Account Termination",
      content: "We may suspend or close accounts at any time for violations, legal risks, or misuse."
    },
    {
      id: "11",
      title: "Limitation of Liability",
      content: "We provide the platform “as is.” We are not liable for lost profits, data loss, or damages arising from use of the service."
    },
    {
      id: "12",
      title: "Changes to Terms",
      content: "We may update these terms. Continued use of the platform means acceptance of the new terms."
    }
  ];

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
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold">
            Dashboard
          </Link>
        </div>
      </header>

      {/* TERMS CONTENT */}
      <main className="max-w-4xl mx-auto px-8 py-24">
        <h1 className="text-[56px] md:text-[80px] font-bold tracking-tighter leading-none mb-4">
          Terms of Service
        </h1>
        <p className="text-gray-500 font-medium mb-16">Last updated: February 7, 2026</p>
        
        <div className="space-y-12">
          <p className="text-xl leading-relaxed text-gray-800">
            Welcome to our platform. By accessing or using our website, you agree to these Terms of Service. 
            If you do not agree, you may not use the service.
          </p>

          <div className="grid gap-12">
            {sections.map((section) => (
              <section key={section.id} className="border-t border-gray-100 pt-8">
                <h2 className="text-2xl font-bold mb-4 tracking-tight">{section.id}. {section.title}</h2>
                <p className="text-gray-600 leading-relaxed text-lg">{section.content}</p>
              </section>
            ))}
            
            <section className="bg-gray-50 p-8 rounded-2xl border border-gray-100 mt-8">
              <h2 className="text-2xl font-bold mb-4 tracking-tight">13. Contact</h2>
              <p className="text-gray-600 text-lg">
                For legal or support questions, contact us at:<br />
                <span className="font-bold text-black">support@yourplatform.com</span>
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* FOOTER - MATCHING SCREENSHOT */}
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
              <Link href="/pricing" className="hover:text-gray-400">Pricing</Link>
              <Link href="#" className="hover:text-gray-400">Features</Link>
              <Link href="#" className="hover:text-gray-400">About</Link>
              <Link href="#" className="hover:text-gray-400">Small Bets</Link>
            </div>
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="#" className="hover:text-gray-400">Help</Link>
              <Link href="#" className="hover:text-gray-400">Board meetings</Link>
              <Link href="#" className="hover:text-gray-400 font-bold">Terms of Service</Link>
              <Link href="#" className="hover:text-gray-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}