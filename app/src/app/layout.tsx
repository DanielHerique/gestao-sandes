import type { Metadata } from "next";
import { Asap } from "next/font/google";
import "./globals.css";
import { FeedbackProvider } from "@/components/ui/feedback";

const asap = Asap({
  variable: "--font-asap",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sandes CRM",
  description: "Gestão de mentoria e candidatos. Sandes Consultoria & RH",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${asap.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><FeedbackProvider>{children}</FeedbackProvider></body>
    </html>
  );
}
