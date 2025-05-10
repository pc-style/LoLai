import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SettingsButton from "@/components/SettingsButton";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "League of Legends Match Analysis",
  description: "Analyze your League of Legends matches with AI insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <SettingsButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
