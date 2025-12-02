import { NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ------ تست OpenAI Key ------
if (!OPENAI_KEY) {
  console.error(
    "⚠️ OPENAI API key تنظیم نشده! مطمئن شو که در .env.local تعریف شده و سرور ریستارت شده."
  );
} else {
  console.log("✅ OPENAI_KEY موجود است:", OPENAI_KEY.slice(0, 5) + "..."); // فقط نمایش ابتدای key برای تست
}

type ReqBody = { ingredients?: string[] };

export async function POST(req: Request) {
  try {
    const body: ReqBody = await req.json().catch(() => ({}));
    const ingredients = (body.ingredients || [])
      .map((i) => i.trim())
      .filter(Boolean);

    if (ingredients.length < 3) {
      return NextResponse.json(
        { error: "حداقل ۳ ماده غذایی لازم است." },
        { status: 400 }
      );
    }

    if (!OPENAI_KEY) {
      return NextResponse.json(
        { error: "⚠️ OPENAI API key تنظیم نشده یا خوانده نمی‌شود." },
        { status: 500 }
      );
    }

    // ------ Recipe generation همان نسخه قبل ------
    const recipePrompt = `
You are a creative chef AI. ONLY return valid JSON with keys: title, history, steps.
Do NOT add any text before or after JSON.
If you cannot create a valid recipe, return JSON with empty strings or empty array for steps.
Return JSON like this:
{
  "title": "short title",
  "history": "one or two sentences about origin",
  "steps": ["step1","step2",...]
}
Ingredients: ${ingredients.join(", ")}
`;

    const recipeResp = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{ role: "user", content: recipePrompt }],
          temperature: 0,
          max_tokens: 700,
        }),
      }
    );

    const recipeJson = await recipeResp.json();
    const recipeText = String(
      recipeJson?.choices?.[0]?.message?.content ?? ""
    ).trim();

    let recipeObj: any = null;
    try {
      const match = recipeText.match(/\{[\s\S]*\}/);
      if (match) {
        recipeObj = JSON.parse(match[0]);
      }
    } catch {
      recipeObj = null;
    }

    if (!recipeObj || !recipeObj.title || !recipeObj.steps) {
      recipeObj = {
        title: "دستور پخت آماده",
        history: "توضیح کوتاه درباره این غذا.",
        steps: ["مواد را آماده کنید", "مواد را مخلوط کنید", "اجازه دهید بپزد"],
      };
    }

    // ------ Image generation ------
    const imgPrompt = `High-quality appetizing food photo of a dish made from: ${ingredients.join(
      ", "
    )}, close-up, clean background, professional food photography.`;

    const imageResp = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: imgPrompt,
          n: 3,
          size: "1024x1024",
        }),
      }
    );

    const imageJson = await imageResp.json();

    const images: string[] = [];
    if (Array.isArray(imageJson?.data)) {
      for (const item of imageJson.data) {
        if (typeof item.url === "string" && item.url.length > 0)
          images.push(item.url);
        else if (typeof item.b64_json === "string" && item.b64_json.length > 0)
          images.push(`data:image/png;base64,${item.b64_json}`);
      }
    }

    return NextResponse.json({
      title: recipeObj.title,
      history: recipeObj.history,
      steps: recipeObj.steps,
      images,
      ingredients,
      rawRecipeAI: recipeText,
    });
  } catch (err) {
    console.error("RecipeAPI error:", err);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}
