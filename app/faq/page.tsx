import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ – Zelteb | Buy & Sell Videos and Digital Products",
  description:
    "Find answers to common questions about buying videos, selling digital products, payouts, withdrawals, and your Zelteb account.",
  keywords: [
    "Zelteb FAQ",
    "buy videos online",
    "sell digital products",
    "creator payouts",
    "digital marketplace help",
  ],
  openGraph: {
    title: "FAQ – Zelteb",
    description:
      "Everything you need to know about buying and selling on Zelteb.",
    type: "website",
  },
};

const faqs: {
  category: string;
  items: { q: string; a: string }[];
}[] = [
  {
    category: "Buying Videos",
    items: [
      {
        q: "How do I buy a video on Zelteb?",
        a: "Browse the Discover page, click on any video you like, and hit the Buy button. You'll be guided through a quick and secure checkout. Once payment is confirmed, the video is instantly available in your library.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept all major credit and debit cards. Additional payment options may be available depending on your region.",
      },
      {
        q: "Can I watch my purchased videos on any device?",
        a: "Yes! Once purchased, you can stream your videos from any device — desktop, tablet, or mobile — as long as you're logged into your Zelteb account.",
      },
      {
        q: "Do you offer refunds?",
        a: "All sales on Zelteb are final. Because digital content is delivered instantly upon purchase, we do not offer refunds. Please review the video preview and description carefully before buying.",
      },
      {
        q: "What happens if a video won't play?",
        a: "Try refreshing the page or clearing your browser cache. If the issue persists, visit our Help center and we'll sort it out for you.",
      },
    ],
  },
  {
    category: "Selling & Uploading",
    items: [
      {
        q: "Who can sell on Zelteb?",
        a: "Anyone! Whether you're an educator, filmmaker, coach, or content creator — if you have valuable digital content to share, you can open a creator account and start selling right away.",
      },
      {
        q: "What types of content can I sell?",
        a: "You can sell videos and other digital products. This includes tutorials, courses, vlogs, short films, guides, and more. Content must comply with our Terms of Service.",
      },
      {
        q: "How do I upload and list my video for sale?",
        a: "Head to your Creator Dashboard, click Upload, fill in your product details (title, description, price, thumbnail), and publish. Your listing will be live on the Discover page immediately.",
      },
      {
        q: "Is there a fee to list products?",
        a: "Listing your products is free. Zelteb takes a small platform commission on each sale — check our Pricing page for the current rate.",
      },
      {
        q: "Can I set my own price?",
        a: "Absolutely. You have full control over your pricing. You can update the price of any product at any time from your dashboard.",
      },
    ],
  },
  {
    category: "Payouts & Withdrawals",
    items: [
      {
        q: "How do I get paid for my sales?",
        a: "Your earnings accumulate in your Zelteb balance automatically after each sale. You can request a withdrawal from the Payouts section of your Creator Dashboard.",
      },
      {
        q: "What is the minimum withdrawal amount?",
        a: "You can withdraw once your balance reaches the minimum threshold shown in your Payouts dashboard. This helps us keep transaction fees low for everyone.",
      },
      {
        q: "How long do withdrawals take?",
        a: "Withdrawals are typically processed within 3–5 business days, depending on your payment method and location.",
      },
      {
        q: "Which withdrawal methods are available?",
        a: "We support bank transfers and other regional options. Available methods will be shown when you set up your payout details in your Creator Dashboard.",
      },
      {
        q: "Where can I see my earnings history?",
        a: "Your full earnings and payout history is available in the Analytics and Payouts sections of your Creator Dashboard.",
      },
    ],
  },
  {
    category: "Account & Pricing",
    items: [
      {
        q: "Is Zelteb free to join?",
        a: "Yes, creating an account on Zelteb is completely free — for both buyers and sellers.",
      },
      {
        q: "How do I create an account?",
        a: "Click the Login button at the top of the page and sign up with your email. It only takes a minute.",
      },
      {
        q: "Can I be both a buyer and a seller?",
        a: "Yes! One account lets you buy content from other creators and sell your own — all from the same place.",
      },
      {
        q: "How do I upgrade to a creator account?",
        a: "After logging in, navigate to the Creator section and follow the steps to set up your profile and start selling.",
      },
      {
        q: "How do I contact support?",
        a: "Visit our Help page or reach out to us directly at helpzelteb@gmail.com. We're here to help.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* JSON-LD FAQ Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.flatMap((section) =>
              section.items.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.a,
                },
              }))
            ),
          }),
        }}
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
          <Link href="/" className="text-3xl font-black tracking-tighter">
            Zelteb
          </Link>
          <nav className="hidden md:flex gap-10 text-[15px] font-medium text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="/purchased" className="hover:text-black">Purchased</Link>
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
          </nav>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold transition-all hover:bg-gray-800"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-4xl mx-auto px-8 py-24">
        <h1 className="text-[56px] md:text-[80px] font-bold tracking-tighter leading-none mb-4">
          FAQ
        </h1>
        <p className="text-gray-500 font-medium mb-16 uppercase tracking-widest text-sm">
          Everything you need to know
        </p>

        <div className="space-y-20">
          {faqs.map((section, si) => (
            <section key={si} className="border-t border-gray-100 pt-12">
              <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.items.map((item, ii) => (
                  <details
                    key={ii}
                    className="group border border-gray-100 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-semibold text-[17px] tracking-tight hover:bg-gray-50 transition-colors">
                      <span>{item.q}</span>
                      <span className="ml-4 flex-shrink-0 w-7 h-7 rounded-full bg-[#f398e4] flex items-center justify-center text-black font-bold text-lg leading-none transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-6 pt-3 text-gray-600 text-lg leading-relaxed border-t border-gray-100">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

          {/* No refund notice */}
          <section className="border-t border-gray-100 pt-12">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              All sales on Zelteb are final. We do not offer refunds on digital products.
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">
              Still have questions?
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We're happy to help. Reach out to our support team at{" "}
              <a
                href="mailto:helpzelteb@gmail.com"
                className="underline decoration-[#f398e4] decoration-2 underline-offset-4"
              >
                helpzelteb@gmail.com
              </a>{" "}
              or visit our{" "}
              <Link
                href="/help"
                className="underline decoration-[#f398e4] decoration-2 underline-offset-4"
              >
                Help Center
              </Link>
              .
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
              <Link href="/help" className="hover:text-gray-400">Help</Link>
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="/priv" className="hover:text-gray-400">Privacy Policy</Link>
              <Link href="/faq" className="font-bold border-b-2 border-[#f398e4] w-fit">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}