import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="text-xl font-bold tracking-tight">CourseMarket</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-zinc-900 text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition"
          >
            Start selling
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto text-center px-6 pt-16 pb-20">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900">
          Sell your courses.
          <br />
          Keep your own store.
        </h1>
        <p className="mt-5 text-lg text-zinc-600 max-w-xl mx-auto">
          Upload your course or digital product, get your own storefront, and
          sell directly to your audience. We handle payments and delivery -
          you keep the customer relationship.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-zinc-900 text-white px-6 py-3 rounded-full font-semibold hover:bg-zinc-800 transition"
          >
            Create your store - free
          </Link>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          No listing fees. We only earn when you sell.
        </p>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="grid sm:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="font-semibold text-zinc-900">Upload your product</h3>
            <p className="text-sm text-zinc-600 mt-1">
              Add your course files, set a price, write a description.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="font-semibold text-zinc-900">
              Share your store link
            </h3>
            <p className="text-sm text-zinc-600 mt-1">
              Get a page like coursemarket.com/yourname to share anywhere.
            </p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="font-semibold text-zinc-900">Get paid instantly</h3>
            <p className="text-sm text-zinc-600 mt-1">
              Buyers pay via UPI or card. Files deliver automatically.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-8 text-center text-sm text-zinc-500">
        CourseMarket - built for creators
      </footer>
    </main>
  );
}
