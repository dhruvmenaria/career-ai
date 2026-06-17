import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: { default: "CareerAI", template: "%s | CareerAI" },
  description:
    "AI-powered resume tailoring and interview preparation for modern job seekers. Boost your ATS score and ace every interview.",
  keywords: ["resume", "AI", "career", "interview prep", "ATS", "job search"],
  openGraph: {
    title: "CareerAI",
    description: "AI-powered resume tailoring and interview preparation.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="min-h-screen antialiased">
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
