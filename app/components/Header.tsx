"use client";

import DarkModeToggle from "./DarkModeToggle";

export default function Header() {
  return (
    <header
      className="
      w-full py-4 px-6 flex items-center justify-between
      bg-white dark:bg-gray-900 shadow-sm
    "
    >
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Recipe <span className="text-rose-500">AI</span>
      </h1>

      <DarkModeToggle />
    </header>
  );
}
