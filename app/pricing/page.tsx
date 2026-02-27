import Link from "next/link"

export default function Pricing() {
  return (
    <div className="min-h-screen bg-[#f6f5f2] font-sans text-black">
      {/* SHARED NAVBAR */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
          <Link href="/" className="text-3xl font-black tracking-tighter">
            Zelteb
          </Link>
          <nav className="hidden md:flex gap-10 text-[15px] font-medium text-gray-600">
            <Link href="/" className="hover:text-black">Home</Link>
            <Link href="#" className="hover:text-black">Discover</Link>
            <Link href="#" className="hover:text-black">Blog</Link>
            <Link href="#" className="hover:text-black">Features</Link>
          </nav>
          <Link
            href="/dashboard"
            className="px-6 py-2.5 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* PRICING CONTENT */}
      <div className="px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[64px] md:text-[80px] font-bold text-center mb-20 tracking-tighter leading-none">
            Pricing
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-[2.5rem] shadow-2xl">
            {/* LEFT: DIRECT SALES */}
            <div className="bg-[#9bb3f4] p-12 md:p-20 text-center flex flex-col justify-center border-b md:border-b-0 md:border-r border-black/5">
              <h2 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter">
                4%
              </h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-sm mx-auto text-black/80">
                Per transaction for all sales through your profile
                or direct links to your customers.
              </p>
            </div>

            {/* RIGHT: MARKETPLACE SALES */}
            <div className="bg-[#1f9f90] p-12 md:p-20 text-center flex flex-col justify-center">
              <h2 className="text-7xl md:text-8xl font-black mb-8 tracking-tighter">
                20%
              </h2>
              <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-sm mx-auto text-black/80">
                Per transaction when new customers find and buy
                from you through our discover marketplace.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center space-y-4">
            <p className="text-2xl font-bold tracking-tight">
              No monthly fees. Pay only when you earn.
            </p>
            <p className="text-gray-500 font-medium">
              Simple, transparent, and built for growth.
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER (Consistent with Homepage) */}
      <footer className="bg-black text-white py-24 mt-20">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold tracking-tight max-w-md">
              Subscribe to get tips and tactics to grow the way you want.
            </h2>
            <div className="mt-10 flex max-w-lg bg-white rounded-md overflow-hidden p-1">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 text-black outline-none"
              />
              <button className="px-6 py-3 bg-[#f398e4] text-black transition-colors rounded-sm">
                <span className="text-2xl">→</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-20 gap-y-6">
            <div className="flex flex-col space-y-4 text-lg">
              <Link href="#" className="hover:text-gray-400">Discover</Link>
              <Link href="#" className="hover:text-gray-400">Blog</Link>
              <Link href="#" className="hover:text-gray-400">Pricing</Link>
            </div>
            <div className="flex flex-col space-y-4 text-lg">
              <Link href="#" className="hover:text-gray-400">Help</Link>
              <Link href="#" className="hover:text-gray-400">Terms</Link>
              <Link href="#" className="hover:text-gray-400">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}