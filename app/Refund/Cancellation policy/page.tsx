import Link from "next/link"

export default function RefundPage() {
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
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-gray-500 font-medium mb-16 uppercase tracking-widest text-sm">
          Last updated: March 2026 &nbsp;·&nbsp; Effective immediately
        </p>

        <div className="space-y-20">

          {/* INTRO */}
          <section className="border-t border-gray-100 pt-12">
            <p className="text-gray-600 text-lg leading-relaxed">
              At Zelteb, we want every buyer to feel confident purchasing digital products on our platform. This policy explains when refunds are available, how to request one, and what to expect. If you have any questions, reach us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">
                helpzelteb@gmail.com
              </a>.
            </p>
          </section>

          {/* 1 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">
              1. Digital Products Are Generally Non-Refundable
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Because all products on Zelteb are digital — videos, files, PDFs, and other downloadable content — they cannot be "returned" once accessed or downloaded. For this reason, all sales are considered final upon delivery.
            </p>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              This is standard practice for digital marketplaces and is consistent with consumer protection guidelines for digital goods.
            </div>
          </section>

          {/* 2 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              2. When You Are Eligible for a Refund
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We do make exceptions. You may be eligible for a full refund if all of the following conditions are met:
            </p>
            <div className="space-y-6">
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Within 7 days of purchase</h4>
                <p className="text-gray-500">Your refund request must be submitted within 7 days of your original purchase date. Requests made after this window will not be accepted.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Product was not delivered</h4>
                <p className="text-gray-500">If you paid but did not receive access to the product due to a technical issue on our end, you are entitled to a full refund.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Product is inaccessible or broken</h4>
                <p className="text-gray-500">If the product file is corrupted, missing, or cannot be opened and the seller is unable to provide a working replacement within a reasonable time.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Product significantly misrepresented</h4>
                <p className="text-gray-500">If the product you received is materially different from what was described or shown on the product page.</p>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              3. When Refunds Are Not Available
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              Refunds will not be granted in the following situations:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg mb-6">
              <li>Change of mind after purchase</li>
              <li>The product has already been fully downloaded and accessed</li>
              <li>The refund request is made more than 7 days after purchase</li>
              <li>You purchased the wrong product by mistake and it has been downloaded</li>
              <li>You no longer need the product after buying it</li>
              <li>Technical issues on your own device or internet connection</li>
            </ul>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 italic text-gray-700 text-lg">
              We encourage buyers to read product descriptions carefully and contact the seller with questions before purchasing.
            </div>
          </section>

          {/* 4 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              4. How to Request a Refund
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              To submit a refund request, email us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">
                helpzelteb@gmail.com
              </a>{" "}
              within 7 days of your purchase. Please include the following in your email:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg mb-6">
              <li>Your registered email address</li>
              <li>The name of the product you purchased</li>
              <li>Your order ID or payment reference number</li>
              <li>A clear reason for your refund request</li>
              <li>Any screenshots or evidence if the product was broken or misrepresented</li>
            </ul>
            <p className="text-gray-600 text-lg leading-relaxed">
              We aim to respond to all refund requests within <strong>2–3 business days</strong>. If approved, your refund will be credited back to your original payment method within 5–7 business days depending on your bank.
            </p>
          </section>

          {/* 5 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              5. Cancellations
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Since Zelteb does not offer subscriptions or recurring billing, there is nothing to "cancel" in the traditional sense. Each purchase is a one-time transaction.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              If you wish to close your Zelteb account, you may do so at any time from your account settings. Closing your account does not automatically trigger a refund for any previous purchases.
            </p>
          </section>

          {/* 6 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              6. Seller Responsibilities
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Sellers on Zelteb are responsible for ensuring their products are accurately described, fully functional, and delivered as promised. If a buyer raises a valid complaint against a seller's product, Zelteb may:
            </p>
            <ul className="list-disc ml-6 space-y-2 text-gray-600 text-lg">
              <li>Investigate the complaint and contact the seller for a response</li>
              <li>Issue a refund to the buyer and recover the amount from the seller's balance</li>
              <li>Remove the product listing if it is found to be misleading or broken</li>
            </ul>
          </section>

          {/* 7 */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-6 tracking-tight">
              7. Changes to This Policy
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              We may update this Refund & Cancellation Policy from time to time. Changes will be reflected by updating the date at the top of this page. Your continued use of Zelteb after any update means you accept the revised policy.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              For any questions about this policy, contact us at{" "}
              <a href="mailto:support@zelteb.com" className="underline decoration-[#f398e4] decoration-2 underline-offset-4">
                helpzelteb@gmail.com
              </a>.
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