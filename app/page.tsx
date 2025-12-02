"use client";
import React, { useState } from "react";
import RecipeCard from "../app/components/RecipeCart";

const HomePage: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddIngredient = () => {
    if (input.trim() && ingredients.length < 10) {
      setIngredients([...ingredients, input.trim()]);
      setInput("");
    }
  };

  const handleGenerate = async () => {
    if (ingredients.length < 3) {
      setError("حداقل ۳ ماده غذایی لازم است.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setRecipe(data);
    } catch (e) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300 p-6">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Recipe AI
      </h1>

      <div className="max-w-md mx-auto mb-6">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="یک ماده غذایی وارد کنید..."
            className="flex-1 p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddIngredient()}
          />
          <button
            onClick={handleAddIngredient}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600 transition-colors"
          >
            اضافه
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          {ingredients.map((ing, idx) => (
            <span
              key={idx}
              className="bg-indigo-200 dark:bg-indigo-700 text-indigo-900 dark:text-indigo-100 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              {ing}{" "}
              <button
                onClick={() =>
                  setIngredients(ingredients.filter((_, i) => i !== idx))
                }
                className="text-red-500 dark:text-red-300 font-bold ml-1"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <button
          onClick={handleGenerate}
          className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          {loading ? "در حال تولید..." : "تولید دستور غذا"}
        </button>
      </div>

      {recipe && <RecipeCard {...recipe} />}
    </div>
  );
};

export default HomePage;
