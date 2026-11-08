import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/dal/session";
import { Logo } from "@/components/Logo";
import { TabBar, type Tab } from "@/components/TabBar";
import { logout } from "./actions";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Livora",
  description: "Find the right dormmate and the right room, with explained compatibility and privacy built in.",
  appleWebApp: { capable: true, title: "Livora" },
  icons: { apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#161213" },
  ],
};

const TABS: Record<"student" | "owner" | "admin", Tab[]> = {
  student: [
    { href: "/discover", label: "Discover", icon: "discover" },
    { href: "/matches", label: "Matches", icon: "heart" },
    { href: "/chat", label: "Chat", icon: "chat" },
    { href: "/listings", label: "Rooms", icon: "home" },
    { href: "/settings", label: "Privacy", icon: "shield" },
  ],
  owner: [
    { href: "/owner", label: "Inquiries", icon: "inbox" },
    { href: "/owner/new", label: "New listing", icon: "plus" },
  ],
  admin: [{ href: "/admin", label: "Review", icon: "flag" }],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();
  const tabs = session ? TABS[session.role] : [];
  const who =
    session?.role === "student" ? session.student.firstName : session?.role === "owner" ? `${session.owner.firstName} · owner` : session ? "Admin" : null;

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-10 bg-bg/90 backdrop-blur" style={{ paddingTop: "env(safe-area-inset-top)" }}>
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
            <Link href="/" className="pressable rounded-full">
              <Logo />
            </Link>
            {who && (
              <form action={logout} className="flex min-w-0 items-center gap-1 text-sm text-muted">
                <span className="truncate">{who}</span>
                <button className="pressable rounded-full px-3 py-1.5 font-medium text-text">Log out</button>
              </form>
            )}
          </div>
        </header>
        <main className={`mx-auto w-full max-w-2xl flex-1 px-4 pt-2 ${tabs.length ? "pb-28" : "pb-10"}`}>{children}</main>
        {tabs.length > 0 && <TabBar tabs={tabs} />}
      </body>
    </html>
  );
}
