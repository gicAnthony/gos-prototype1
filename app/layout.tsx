import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOS — Enterprise Operating Environment",
  description: "One platform. Every possibility.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
