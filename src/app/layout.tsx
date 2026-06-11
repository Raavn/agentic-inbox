import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Agentic Inbox",
  description: "Capture ideas and notes into your inbox",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-gray-900 antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
