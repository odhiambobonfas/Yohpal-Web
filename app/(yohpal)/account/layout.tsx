import { AccountNavTabs } from "@/components/custom/account/AccountNavTabs"

export const metadata = {
  title: "Account Manager | Yohpal",
  description: "Manage your Yohpal business account, ads, deposits, and referral network",
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <AccountNavTabs />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
