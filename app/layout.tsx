import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CourseMarket - Sell your digital products",
  description:
    "Create your own storefront and sell courses, ebooks, and digital products directly to your audience.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
