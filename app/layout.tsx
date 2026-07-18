import type { Metadata } from "next";
import { Geist, Geist_Mono, Varela_Round } from "next/font/google";
import { ThemeProvider } from "next-themes"
import "./globals.css";

const varela = Varela_Round({
  variable: "--font-varela",
  weight: ["400"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GlassOS - My Own Operating System",
  description: "The tiny operating system that runs on your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${varela.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background min-h-dvh font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
