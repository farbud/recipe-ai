import "./globals.css";
import { ThemeProvider } from "../app/context/ThemeProvider";
import Header from "../app/components/Header";

export const metadata = {
  title: "Recipe AI",
  description: "AI Powered Recipe Generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider>
          <Header />
          <main className="px-6 py-6 max-w-3xl mx-auto">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
