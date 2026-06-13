import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Shipping App",
  description: "Manage shipments and orders",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-black/80">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-8 py-4">
            <Link href="/" className="text-lg font-semibold text-black dark:text-zinc-50">
              Shipping
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/orders"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Order Shipping
              </Link>
              <Link
                href="/hentested"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Pickup Point
              </Link>
              <Link
                href="/creators"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/5 hover:text-black dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Creators
              </Link>
              <Link
                href="/ship"
                className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
              >
                New Shipment
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
