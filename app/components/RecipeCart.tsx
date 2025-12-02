"use client";
import React from "react";

export default function RecipeCard({
  title,
  image,
  ingredients,
}: {
  title: string;
  image: string;
  ingredients: string[];
}) {
  return (
    <div className="bg-surface shadow-card rounded-xl overflow-hidden transition hover:scale-[1.02] hover:shadow-lg duration-200">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2 text-primary-600 dark:text-primary-300">
          {title}
        </h2>
        <p className="text-sm text-text-secondary mb-3">مواد لازم:</p>
        <ul className="text-sm text-neutral-600 dark:text-neutral-300 space-y-1">
          {ingredients.map((ing, i) => (
            <li
              key={i}
              className="before:content-['•'] before:mr-2 before:text-primary-500"
            >
              {ing}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
