"use client";
import React from "react";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-6">
      <div className="w-10 h-10 border-4 border-primary-400 dark:border-primary-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
