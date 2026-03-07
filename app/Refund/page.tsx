import Link from "next/link"

export default function RefundPolicyPage() {
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
          Refund Policy
        </h1>
        <p className="text-gray-500 font-medium mb-16 uppercase tracking-widest text-sm">
          Last updated: March 2025 &nbsp;·&nbsp; Effective immediately
        </p>

        <div className="space-y-20">

          {/* INTRO */}
          <section className="border-t border-gray-100 pt-12">
            <p className="text-gray-600 text-lg leading-relaxed">
              At Zelteb, we want you to be completely informed before making a purchase. Please read this policy carefully before buying any digital product on our platform. By completing a purchase, you acknowledge that you have read and agreed to this Refund Policy. For questions, contact us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">support@zelteb.com</a>.
            </p>
          </section>

          {/* 1 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">
              1. No Refund Policy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              All sales on Zelteb are <strong>final and non-refundable</strong>. Because every product sold on our platform is a digital product — including videos, files, PDFs, and other downloadable content — it can be accessed and downloaded immediately upon purchase.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              Once a digital product has been purchased and made available for download, we are unable to offer a refund, exchange, or credit under any circumstances.
            </div>
          </section>

          {/* 2 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              2. Why We Don't Offer Refunds
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Unlike physical goods, digital products cannot be "returned" once delivered. The nature of digital content means that:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
              <li>The product is delivered instantly and can be downloaded or accessed immediately after purchase</li>
              <li>There is no way to verify whether the content has already been copied or consumed</li>
              <li>Issuing refunds on downloadable content would be unfair to the Sellers on our platform</li>
              <li>Access to the product cannot be revoked once it has been downloaded</li>
            </ul>
          </section>

          {/* 3 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              3. What Is Not Covered
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Refund requests will not be granted for any of the following reasons:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg mb-6">
              <li>Change of mind after purchase</li>
              <li>Accidental or unintended purchases</li>
              <li>Not reading the product description before purchasing</li>
              <li>Deciding the product does not meet your personal expectations</li>
              <li>Purchasing a product you already own</li>
              <li>Compatibility issues with your device or software</li>
              <li>Requesting a refund after the product has been downloaded or accessed</li>
            </ul>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              We strongly encourage you to read all product descriptions, previews, and details thoroughly before completing your purchase.
            </div>
          </section>

          {/* 4 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              4. Before You Buy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              To ensure you are confident in your purchase, we recommend the following:
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Read the Description</h4>
                <p className="text-gray-500">Review the product title, description, and any preview content provided by the Seller before purchasing.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Contact the Seller</h4>
                <p className="text-gray-500">If you have any questions about what is included, reach out to the Seller directly before completing your purchase.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Check Compatibility</h4>
                <p className="text-gray-500">Ensure the file format or content type is compatible with your device or the software you intend to use.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Contact Support</h4>
                <p className="text-gray-500">If you're unsure about anything, email us at <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-2">support@zelteb.com</a> before buying.</p>
              </div>
            </div>
          </section>

          {/* 5 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              5. Technical Issues
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              While refunds are not provided, we are committed to ensuring every buyer receives the product they paid for. If you experience a technical issue — such as a failed download or a corrupted file — please contact us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">support@zelteb.com</a>{" "}
              and we will work with the Seller to resolve the issue and ensure you gain access to your purchase.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              Our support team is here to help you access what you've paid for — but this does not constitute a basis for a refund.
            </div>
          </section>

          {/* 6 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              6. Disputes & Chargebacks
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We encourage all buyers to contact us before initiating a chargeback or payment dispute with their bank or card provider. Chargebacks initiated without first contacting Zelteb support may result in the suspension or permanent termination of your account.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              If you believe a transaction on Zelteb was unauthorised or fraudulent, please contact us immediately at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">support@zelteb.com</a>{" "}
              and we will investigate the matter promptly.
            </p>
          </section>

          {/* 7 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              7. Changes to This Policy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We may update this Refund Policy from time to time. When we do, we will update the date at the top of this page. For significant changes, we may notify you by email or via a notice on the platform.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Your continued use of Zelteb after any changes constitutes your acceptance of the updated policy.
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
              <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
              <Link href="/refund" className="font-bold border-b-2 border-[#f398e4] w-fit">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}