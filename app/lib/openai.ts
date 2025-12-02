export const OPENAI_KEY = process.env.OPENAI_API_KEY || "";

if (!OPENAI_KEY) {
  console.error(
    "⚠️ OPENAI_KEY موجود نیست! مطمئن شو که فایل .env.local درست است و سرور ریستارت شده."
  );
} else {
  console.log("✅ OPENAI_KEY موجود است:", OPENAI_KEY.slice(0, 5) + "...");
}
