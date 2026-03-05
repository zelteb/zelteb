import Link from "next/link"

export default function AboutPage() {
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
            <Link href="/about" className="font-semibold text-black">About</Link>
            <Link href="/pricing" className="hover:text-black">Pricing</Link>
          </nav>
          <Link href="/dashboard" className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold transition-all hover:bg-gray-800">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-24">

        {/* HERO */}
        <h1 className="text-[56px] md:text-[80px] font-bold tracking-tighter leading-none mb-6">
          Built for creators<br />
          <span className="underline decoration-[#f398e4] decoration-8 underline-offset-8">who mean business.</span>
        </h1>
        <p className="text-gray-500 text-xl leading-relaxed max-w-2xl mb-20">
          Zelteb is a platform that lets anyone sell digital products directly to their audience — videos, files, courses, and more. No middlemen. No complexity. Just you and your buyers.
        </p>

        <div className="space-y-20">

          {/* MISSION */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight underline decoration-[#f398e4] decoration-4 underline-offset-8">
              Our Mission
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We believe anyone with knowledge, a skill, or a passion should be able to monetize it. Zelteb was built to remove every barrier — no tech skills needed, no high fees, no complicated setup.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Whether you're a teacher, designer, filmmaker, or fitness coach — if you create value, Zelteb helps you get paid for it. We built Zelteb with the Indian creator economy in mind, with INR pricing and a dead-simple experience from day one.
            </p>
          </section>

          {/* STATS */}
          <section className="border-t border-gray-100 pt-12">
            <div className="grid md:grid-cols-3 gap-0 border border-gray-100 rounded-2xl overflow-hidden">
              <div className="p-10 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="text-5xl font-bold tracking-tighter mb-2">100<span className="text-[#f398e4]">%</span></div>
                <div className="text-gray-500 text-lg">Free to start</div>
                <div className="text-gray-400 text-sm mt-1">No setup fees, ever</div>
              </div>
              <div className="p-10 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="text-5xl font-bold tracking-tighter mb-2">24<span className="text-[#f398e4]">/7</span></div>
                <div className="text-gray-500 text-lg">Always open</div>
                <div className="text-gray-400 text-sm mt-1">Your store never sleeps</div>
              </div>
              <div className="p-10">
                <div className="text-5xl font-bold tracking-tighter mb-2"><span className="text-[#f398e4]">₹</span>INR</div>
                <div className="text-gray-500 text-lg">Made for India</div>
                <div className="text-gray-400 text-sm mt-1">Native INR pricing</div>
              </div>
            </div>
          </section>

          {/* WHY WE BUILT IT */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              Why we built Zelteb
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              We saw talented creators struggling to sell their work online. Existing platforms were either too expensive, too complex, or simply not built for the Indian market.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              So we built Zelteb — a dead-simple way to sell digital products, collect payments in INR, and grow an audience. No monthly fees to get started. No unnecessary hoops to jump through.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              Today, Zelteb is home to creators across India selling videos, templates, courses, and more — earning on their own terms.
            </p>
          </section>

          {/* VALUES */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-8 tracking-tight">
              What we stand for
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Simple by design</h4>
                <p className="text-gray-500">No bloated dashboards. Upload your product, set a price, share your link — done.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Made for India</h4>
                <p className="text-gray-500">Built with INR pricing and the Indian creator economy in mind from day one.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Fair pricing</h4>
                <p className="text-gray-500">We keep our fees low so creators keep more of what they earn. Your success is our success.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Secure & reliable</h4>
                <p className="text-gray-500">Your products and your buyers' payments are protected with industry-standard security.</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Creator-first</h4>
                <p className="text-gray-500">Every feature we build starts with one question: does this help creators earn more?</p>
              </div>
              <div className="p-6 border border-gray-100 rounded-xl">
                <h4 className="font-bold mb-2 text-lg">Always improving</h4>
                <p className="text-gray-500">We ship fast, listen to feedback, and continuously improve so you have the best tools.</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="border-t border-gray-100 pt-12">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Ready to start selling?</h2>
            <p className="text-gray-500 text-lg mb-8">Join creators already earning on Zelteb. It's free to get started.</p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full bg-black text-white text-base font-bold hover:bg-gray-800 transition-all"
              >
                Start selling for free
              </Link>
              <Link
                href="/"
                className="px-8 py-3.5 rounded-full border border-gray-200 text-base font-bold hover:border-gray-400 transition-all"
              >
                Browse products
              </Link>
            </div>
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
              <Link href="/about" className="font-bold border-b-2 border-[#f398e4] w-fit">About</Link>
              <Link href="/pricing" className="hover:text-gray-400">Pricing</Link>
              <Link href="#" className="hover:text-gray-400">Features</Link>
              <Link href="#" className="hover:text-gray-400">Blog</Link>
            </div>
            <div className="flex flex-col space-y-5 text-lg font-medium">
              <Link href="#" className="hover:text-gray-400">Help</Link>
              <Link href="/terms" className="hover:text-gray-400">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-gray-400">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}