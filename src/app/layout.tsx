import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cruxly",
  description: "Responsive Climbing Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
        appearance={{
            variables: { colorPrimary: '#172554', borderRadius: '1rem' },
            layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
            },
            elements: {
                card: "bg-white shadow-2xl shadow-slate-200/50 border-none rounded-[2rem] p-8 md:p-10",
                headerTitle: "text-3xl font-bold text-blue-950 tracking-tight",
                headerSubtitle: "text-slate-500 font-medium text-base",
                socialButtonsBlockButton: "border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-600 font-semibold rounded-2xl h-12 transition-all hover:shadow-md hover:-translate-y-0.5",
                socialButtonsBlockButtonText: "font-semibold",
                formButtonPrimary: "bg-blue-950 hover:bg-blue-900 shadow-xl shadow-blue-950/20 rounded-2xl h-12 font-bold text-sm tracking-wide transition-all hover:-translate-y-0.5",
                formFieldInput: "rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all h-12",
                formFieldLabel: "text-slate-600 font-semibold text-sm ml-1 mb-1.5",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-bold decoration-2 underline-offset-4 hover:underline",
                dividerLine: "bg-slate-100",
                dividerText: "text-slate-400 font-medium text-xs uppercase tracking-widest",
            }
        }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AppShell>
            {children}
          </AppShell>
        </body>
      </html>
    </ClerkProvider>
  );
}
