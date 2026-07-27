import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold tracking-tight">
            CourseMarket
          </Link>
          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/dashboard/products" className="text-zinc-700 hover:text-zinc-900">
              Products
            </Link>
            <Link href="/dashboard/earnings" className="text-zinc-700 hover:text-zinc-900">
              Earnings
            </Link>
            <Link href="/dashboard/payouts" className="text-zinc-700 hover:text-zinc-900">
              Payouts
            </Link>
            <Link href="/dashboard/ads" className="text-zinc-700 hover:text-zinc-900">
              Promote
            </Link>
            <Link href="/dashboard/settings" className="text-zinc-700 hover:text-zinc-900">
              Settings
            </Link>
            {profile?.username && (
              <Link
                href={`/${profile.username}`}
                target="_blank"
                className="text-zinc-700 hover:text-zinc-900"
              >
                View store
              </Link>
            )}
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
