import Link from "next/link"

export default function TermsPage() {
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

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-8 py-24">
        <h1 className="text-[56px] md:text-[80px] font-bold tracking-tighter leading-none mb-4">
          Terms &amp; Conditions
        </h1>
        <p className="text-gray-500 font-medium mb-16 uppercase tracking-widest text-sm">
          Last updated: March 2025 &nbsp;·&nbsp; Effective immediately
        </p>

        <div className="space-y-20">

          {/* INTRO */}
          <section className="border-t border-gray-100 pt-12">
            <p className="text-gray-600 text-lg leading-relaxed">
              Welcome to Zelteb. By accessing or using our platform at{" "}
              <a href="https://zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">zelteb.com</a>,
              you agree to be bound by these Terms and Conditions. Please read them carefully. If you do not agree, you may not use our services.
              For questions, contact us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">support@zelteb.com</a>.
            </p>
          </section>

          {/* 1 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">
              1. About Zelteb
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Zelteb is an online marketplace that allows creators ("Sellers") to sell digital products to customers ("Buyers"). Digital products include videos, files, PDFs, and similar downloadable content.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Zelteb acts as a platform facilitating transactions between Sellers and Buyers. We are not a party to the agreement between a Seller and a Buyer, and we are not responsible for the quality, accuracy, or legality of any product listed on the platform.
            </p>
          </section>

          {/* 2 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              2. Eligibility & Accounts
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              To use Zelteb, you must be at least 18 years old or have the consent of a legal guardian. By creating an account, you confirm that the information you provide is accurate and up to date.
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You are responsible for all activity that occurs under your account</li>
              <li>You must notify us immediately of any unauthorised use of your account</li>
              <li>You may not create multiple accounts to circumvent any suspension or restriction</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              3. Selling on Zelteb
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Sellers may list digital products including videos, files, and PDFs. By listing a product, you confirm that:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg mb-6">
              <li>You own or have the rights to sell the content</li>
              <li>The product does not infringe any third-party intellectual property rights</li>
              <li>The product does not contain illegal, harmful, or misleading content</li>
              <li>The product description accurately represents what the buyer will receive</li>
            </ul>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              Zelteb reserves the right to remove any product that violates these terms without prior notice.
            </div>
          </section>

          {/* 4 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              4. Buying on Zelteb
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              When you purchase a digital product on Zelteb, you receive a personal, non-transferable licence to access and use that product for your own purposes. You may not:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
              <li>Resell, redistribute, or share the product with others</li>
              <li>Use the product for commercial purposes unless the Seller explicitly permits it</li>
              <li>Reverse engineer, copy, or reproduce the product in any form</li>
              <li>Remove any copyright or ownership notices from the product</li>
            </ul>
          </section>

          {/* 5 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              5. Payments & Fees
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              All transactions on Zelteb are processed in Indian Rupees (INR). Payments are handled securely through our payment partners.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">For Buyers</h4>
                <p className="text-gray-500">You will be charged the listed price at the time of purchase. All prices are inclusive of applicable taxes unless stated otherwise.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">For Sellers</h4>
                <p className="text-gray-500">Zelteb charges a platform fee on each sale. The fee percentage is displayed in your seller dashboard and may be updated with prior notice.</p>
              </div>
            </div>
          </section>


          {/* 7 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              7. Prohibited Content & Conduct
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              You may not use Zelteb to sell, distribute, or promote any of the following:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg mb-6">
              <li>Content that infringes copyrights, trademarks, or other intellectual property rights</li>
              <li>Illegal content of any kind</li>
              <li>Misleading, fraudulent, or deceptive products or descriptions</li>
              <li>Adult or explicit content</li>
              <li>Malware, viruses, or harmful software</li>
              <li>Content that promotes violence, hatred, or discrimination</li>
            </ul>
            <p className="text-gray-600 text-lg leading-relaxed">
              Zelteb reserves the right to remove any content that violates these rules. Repeated violations may result in permanent account termination.
            </p>
          </section>

          {/* 8 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              8. Intellectual Property
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              All content on the Zelteb platform — including our logo, design, code, and branding — is the property of Zelteb and may not be copied, reproduced, or used without written permission.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sellers retain full ownership of the products they upload. By listing a product on Zelteb, you grant us a limited, non-exclusive licence to display and deliver your product to buyers through our platform.
            </p>
          </section>

          {/* 9 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              9. Limitation of Liability
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Zelteb is provided on an "as is" and "as available" basis. We do not guarantee that the platform will be uninterrupted, error-free, or free of harmful components.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              To the maximum extent permitted by law, Zelteb shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform, including loss of revenue, data, or goodwill.
            </p>
          </section>

          {/* 10 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              10. Governing Law
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              These Terms and Conditions are governed by the laws of India. Any disputes arising from the use of Zelteb shall be subject to the exclusive jurisdiction of the courts of India.
            </p>
          </section>

          {/* 11 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              11. Changes to These Terms
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We may update these Terms and Conditions from time to time. When we do, we will update the date at the top of this page. For significant changes, we may notify you by email or via a notice on the platform.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your continued use of Zelteb after any changes constitutes your acceptance of the updated terms.
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
              <Link href="/terms" className="font-bold border-b-2 border-[#f398e4] w-fit">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}