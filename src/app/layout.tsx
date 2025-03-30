import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/navigation/navbar";
import { FiGithub, FiTwitter, FiMail } from "react-icons/fi";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Horizon",
  description: "Where ideas connect and communities thrive together.",
  icons: {
    icon: '/horizon-logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-background text-foreground`}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 dark:border-gray-800 py-8 mt-12">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-xl font-bold text-gradient">Horizon</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Where ideas connect and communities thrive together.
                    </p>
                  </div>
                  <div className="flex space-x-4">
                    <a 
                      href="https://github.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="GitHub"
                    >
                      <FiGithub className="h-5 w-5" />
                    </a>
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Twitter"
                    >
                      <FiTwitter className="h-5 w-5" />
                    </a>
                    <a 
                      href="mailto:info@modernforum.com" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label="Email"
                    >
                      <FiMail className="h-5 w-5" />
                    </a>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 mt-6 pt-6 text-center text-sm text-muted-foreground">
                  <p>© {new Date().getFullYear()} Horizon. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
