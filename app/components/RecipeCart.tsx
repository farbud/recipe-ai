"use client";
import React from "react";

type RecipeCardProps = {
  title: string;
  history: string;
  steps: string[];
  images: string[];
  ingredients: string[];
};

const RecipeCard: React.FC<RecipeCardProps> = ({
  title,
  history,
  steps,
  images,
  ingredients,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6 max-w-md mx-auto my-4 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{history}</p>

      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${title} image ${idx + 1}`}
              className="w-full h-40 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">
          مواد غذایی:
        </h3>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
          {ingredients.map((ing, idx) => (
            <li key={idx}>{ing}</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">
          مراحل پخت:
        </h3>
        <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300">
          {steps.map((step, idx) => (
            <li key={idx} className="mb-1">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default RecipeCard;
