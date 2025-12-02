/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";

export default function RecipeForm({
  onGenerate,
}: {
  onGenerate: (d: any) => void;
}) {
  const [inputs, setInputs] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [serverLog, setServerLog] = useState<any>(null);

  const update = (i: number, v: string) => {
    const c = [...inputs];
    c[i] = v;
    setInputs(c);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setServerLog(null);

    const filled = inputs.map((s) => s.trim()).filter(Boolean);
    if (filled.length < 3) {
      setErr("حداقل ۳ ماده لازم است.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: filled }),
      });

      const data = await res.json();

      // لاگ دقیق برای Debug
      console.log("Response status:", res.status);
      console.log("Response JSON:", data);
      setServerLog({ status: res.status, data });

      if (!res.ok) {
        setErr(data.error || "خطا از سرور");
      } else {
        onGenerate(data);
      }
    } catch (e) {
      console.error("Fetch failed:", e);
      setErr("عدم ارتباط با سرور");
      setServerLog({ status: "fetch failed", error: e });
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-2xl mx-auto p-5 rounded-2xl bg-white dark:bg-gray-800 shadow"
    >
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
        ورودی مواد (۳ تا یا بیشتر)
      </h2>
      <div className="flex flex-col gap-2">
        {inputs.map((v, i) => (
          <input
            key={i}
            value={v}
            onChange={(e) => update(i, e.target.value)}
            placeholder={`ماده ${i + 1}`}
            className="p-3 rounded bg-gray-100 dark:bg-gray-700"
          />
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          type="submit"
          className="px-4 py-2 bg-rose-500 text-white rounded"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : "ساخت"}
        </button>
      </div>

      {err && <p className="text-red-500 mt-3">{err}</p>}

      {/* لاگ سرور برای debug */}
      {serverLog && (
        <div className="mt-3 p-2 bg-gray-200 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-100 overflow-auto">
          <pre>{JSON.stringify(serverLog, null, 2)}</pre>
        </div>
      )}
    </form>
  );
}
