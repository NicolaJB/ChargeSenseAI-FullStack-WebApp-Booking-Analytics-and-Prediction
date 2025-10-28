// app/layout.tsx
import { ReactNode } from "react";
import "../styles/globals.css"; // Tailwind + global styles

export const metadata = {
  title: "ChargeSenseAI",
  description: "Upload and analyze school booking data",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {children}
      </body>
    </html>
  );
}
