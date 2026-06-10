import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FAQ Chatbot",
  description: "Assistente de perguntas frequentes",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={syne.variable}>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
