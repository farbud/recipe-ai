"use client";

import { useTheme } from "../context/ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="
        p-2 rounded-xl transition-all duration-300
        bg-gray-200 dark:bg-gray-700 
        text-gray-800 dark:text-gray-100
        hover:scale-105 shadow-sm
      "
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
