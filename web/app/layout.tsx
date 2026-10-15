import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { StockProvider } from "@/components/StockContext";
import "./globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prove Me Wrong · test your stock thesis",
  description: "Write your view on a Nifty 50 stock in three sentences. See which parts the data supports, and how often our models are wrong.",
};

// Set the theme before paint so dark mode never flashes light.
const THEME = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME }} />
      </head>
      <body className="min-h-dvh">
        <StockProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </StockProvider>
      </body>
    </html>
  );
}
