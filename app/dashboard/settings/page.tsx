import { createClient } from "@/lib/supabase/server";
import BankDetailsForm from "@/components/BankDetailsForm";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("bank_account_name, bank_account_number, bank_ifsc, phone")
    .eq("id", user!.id)
    .single();

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Settings</h1>
      <p className="text-zinc-600 mb-6">
        Add your bank details so we can pay out your earnings. Payouts run
        weekly, every Monday.
      </p>
      <BankDetailsForm profile={profile} />
    </div>
  );
}
