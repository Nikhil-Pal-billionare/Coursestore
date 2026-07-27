import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminUser } from "@/lib/admin";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminUser();

  // Deliberately use notFound() instead of redirect() for non-admins visiting
  // /admin directly - this makes the entire section behave as if it doesn't
  // exist, rather than revealing there's a login-gated admin area.
  if (!admin) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-bold tracking-tight">
            CourseMarket Admin
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-zinc-300">
            <Link href="/admin/creators" className="hover:text-white">
              Creators
            </Link>
            <Link href="/admin/sales" className="hover:text-white">
              Sales
            </Link>
            <Link href="/admin/ads" className="hover:text-white">
              Ad requests
            </Link>
            <Link href="/admin/refunds" className="hover:text-white">
              Refunds
            </Link>
            <Link href="/admin/payouts" className="hover:text-white">
              Payouts
            </Link>
            <Link href="/admin/banners" className="hover:text-white">
              Banners
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
