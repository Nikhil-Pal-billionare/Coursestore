import Link from "next/link";
import TestimonialCarousel from "@/components/TestimonialCarousel";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ============ DARK HERO ============ */}
      <div className="bg-gradient-to-b from-zinc-950 via-brand-900 to-brand-700">
        <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
          <span className="text-xl font-bold tracking-tight text-white">
            CourseMarket
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-300 hover:text-white transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-white text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-100 transition"
            >
              Start selling
            </Link>
          </div>
        </nav>

        <section className="max-w-3xl mx-auto text-center px-6 pt-10 pb-16">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-4 py-1.5 text-sm text-white/90 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Built for creators who want to own their store
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Sell your courses.
            <br />
            Keep your own store.
          </h1>
          <p className="mt-5 text-lg text-white/70 max-w-xl mx-auto">
            Upload your course or digital product, get your own storefront,
            and sell directly to your audience. We handle payments and
            delivery - you keep the customer relationship.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-white text-zinc-900 px-6 py-3 rounded-full font-semibold hover:bg-zinc-100 transition"
            >
              Create your store - free
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/50">
            No listing fees. We only earn when you sell.
          </p>

          {/* Stats bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-white/80 text-sm">
            <StatItem value="0%" label="upfront listing fees" />
            <Divider />
            <StatItem value="25%" label="platform commission - transparent, always" />
            <Divider />
            <StatItem value="Instant" label="file delivery after payment" />
          </div>
        </section>
      </div>

      {/* ============ HOW IT WORKS ============ */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-center text-sm font-semibold text-brand-600 mb-2">
          HOW IT WORKS
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-zinc-900 mb-12">
          Three steps to your first sale
        </h2>
        <div className="grid sm:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Upload your product"
            description="Add your course files, set a price, write a description. Takes minutes."
          />
          <StepCard
            number="2"
            title="Share your store link"
            description="Get a page like coursemarket.com/yourname to share anywhere - socials, DMs, bio links."
          />
          <StepCard
            number="3"
            title="Get paid instantly"
            description="Buyers pay via UPI or card. Files deliver automatically the moment payment clears."
          />
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="inline-block text-sm font-semibold text-brand-600 bg-brand-50 rounded-full px-4 py-1.5 mb-4">
            Built for creators like you
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900">
            Why creators choose to own their store
          </h2>
          <p className="text-zinc-600 mt-3 max-w-lg mx-auto">
            You keep your buyer relationships and your brand - we just handle
            the payments and delivery in the background.
          </p>
        </div>

        <div className="max-w-2xl mx-auto px-6 mt-10">
          <TestimonialCarousel />
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="bg-gradient-to-b from-brand-700 to-zinc-950 py-20">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Your store takes 2 minutes to set up
          </h2>
          <p className="text-white/70 mt-3">
            Pick a username, upload your first product, and you&apos;re live.
          </p>
          <Link
            href="/signup"
            className="inline-block mt-6 bg-white text-zinc-900 px-6 py-3 rounded-full font-semibold hover:bg-zinc-100 transition"
          >
            Create your store - free
          </Link>
        </div>
      </section>

      <footer className="bg-zinc-950 py-8 text-center text-sm text-zinc-500">
        CourseMarket - built for creators
      </footer>
    </main>
  );
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <span className="font-bold text-white">{value}</span>{" "}
      <span className="text-white/60">{label}</span>
    </div>
  );
}

function Divider() {
  return <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30" />;
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-10 h-10 mx-auto rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center mb-3">
        {number}
      </div>
      <h3 className="font-semibold text-zinc-900">{title}</h3>
      <p className="text-sm text-zinc-600 mt-1">{description}</p>
    </div>
  );
}
