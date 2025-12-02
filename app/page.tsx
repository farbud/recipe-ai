/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import RecipeForm from "../app/components/RecipeForm"; // فرض: قبلاً ساخته‌ای
// در صورت نداشتن، از نسخه ساده پایین استفاده کن

function RecipeCard({ data }: { data: any }) {
  return (
    <article className="max-w-3xl mx-auto mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {data.title}
      </h3>

      {Array.isArray(data.images) && data.images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {data.images.slice(0, 3).map((src: string, i: number) => (
            // اگر data url باشه مرورگر نمایش می‌ده؛ اگر url باشه هم اوکیه
            <img
              key={i}
              src={src}
              alt={`${data.title} ${i + 1}`}
              className="w-full h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <p className="text-gray-600 dark:text-gray-300 mb-4">{data.history}</p>

      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
        مراحل:
      </h4>

      <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-2">
        {Array.isArray(data.steps) &&
          data.steps.map((s: string, i: number) => <li key={i}>{s}</li>)}
      </ol>
    </article>
  );
}

export default function HomePage() {
  const [recipe, setRecipe] = useState<any | null>(null);

  return (
    <div className="py-8 px-4">
      <h1 className="text-center text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Recipe <span className="text-rose-500">AI</span>
      </h1>

      <RecipeForm
        onGenerate={(data: any) => {
          setRecipe(data);
        }}
      />

      {recipe && <RecipeCard data={recipe} />}
    </div>
  );
}
