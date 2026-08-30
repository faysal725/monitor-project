import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "API & Webhook Health Monitor",
  description: "Real-time endpoint monitoring with AI diagnostics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-200 min-h-screen`}>
        {children}
        <Toaster theme="dark" position="top-right" />
      </body>
    </html>
  );
}