import { ReactNode, useEffect } from "react";
import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { mode } = useTheme();

  // Apply dark mode class to document
  useEffect(() => {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-page flex flex-col transition-colors">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-primary-800 dark:bg-primary-900 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Project Time Tracker</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
