import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { CheckoutProvider } from "@/context/CheckoutContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ecoyaan – Checkout",
  description: "Sustainable products checkout flow",
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <CheckoutProvider>
          <Navbar />
          <main className="min-h-[calc(100vh-96px)]">
            {children}
          </main>
        </CheckoutProvider>
      </body>
    </html>
  );
}
