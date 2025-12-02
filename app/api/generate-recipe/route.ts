import { NextResponse } from "next/server";

const OPENAI_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_KEY) {
  console.warn("OPENAI_API_KEY is not set — /api/recipe will fail without it.");
}

type ReqBody = { ingredients?: string[] };

export async function POST(request: Request) {
  try {
    const body: ReqBody = await request.json().catch(() => ({}));
    const ingredients = (body.ingredients || [])
      .map((i) => String(i).trim())
      .filter(Boolean);

    if (ingredients.length < 3) {
      return NextResponse.json(
        { error: "حداقل ۳ ماده غذایی لازم است." },
        { status: 400 }
      );
    }

    if (!OPENAI_KEY) {
      return NextResponse.json(
        { error: "OPENAI API key تنظیم نشده." },
        { status: 500 }
      );
    }

    // ------ 1) Validate items (food or not) with AI ------
    const validatorPrompt = `You are a concise assistant that checks whether the following comma-separated items are edible food ingredients (not tools, not utensils, not spices only like 'soap', 'nail', 'plastic', etc).
Return a single-line JSON: {"valid": true} if ALL items are edible, or {"valid": false, "invalid": ["item1", "item2"]} if some are not.
Items: ${ingredients.join(", ")}`;

    const valResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: validatorPrompt }],
        temperature: 0,
        max_tokens: 200,
      }),
    });

    const valJson = await valResp.json();
    const valText = String(
      valJson?.choices?.[0]?.message?.content ?? ""
    ).trim();

    // try to parse JSON out of the model answer:
    let valid = false;
    let invalidItems: string[] = [];
    try {
      const jsonStart = valText.indexOf("{");
      const jsonStr = jsonStart >= 0 ? valText.slice(jsonStart) : valText;
      const parsed = JSON.parse(jsonStr);
      valid = Boolean(parsed.valid);
      if (Array.isArray(parsed.invalid)) invalidItems = parsed.invalid;
    } catch {
      // fallback simple check: if answer contains "false" or "no" assume invalid
      if (/false|no/i.test(valText)) {
        valid = false;
      } else {
        valid = true; // be optimistic if uncertain
      }
    }

    if (!valid) {
      return NextResponse.json(
        { error: "یکی یا چند مورد خوراکی نیستند.", invalid: invalidItems },
        { status: 400 }
      );
    }

    // ------ 2) Ask AI to create recipe JSON ------
    const recipePrompt = `You are a creative chef. Given these ingredients: ${ingredients.join(
      ", "
    )}, produce a JSON object ONLY with these fields:
{
  "title": "short title",
  "history": "one or two short sentences about origin or notes (in Persian or English)",
  "steps": ["step 1", "step 2", "..."] // between 3 and 8 items
}
Return valid JSON only.`;

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
          temperature: 0.8,
          max_tokens: 700,
        }),
      }
    );

    const recipeJson = await recipeResp.json();
    const recipeText = String(
      recipeJson?.choices?.[0]?.message?.content ?? ""
    ).trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let recipeObj: any = null;
    try {
      const jsonStart = recipeText.indexOf("{");
      const jsonStr = jsonStart >= 0 ? recipeText.slice(jsonStart) : recipeText;
      recipeObj = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse recipe JSON from model:", recipeText, e);
      return NextResponse.json(
        { error: "خطا در تولید دستور غذا (پاسخ نامعتبر از مدل)." },
        { status: 500 }
      );
    }

    // ------ 3) Generate images (supports either url or base64 responses) ------
    const imgPrompt = `High-quality appetizing food photo of a dish made from: ${ingredients.join(
      ", "
    )}. Close-up, clean background, professional food photography.`;

    // Use the images endpoint (generations)
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

    if (Array.isArray(imageJson?.data) && imageJson.data.length > 0) {
      for (const item of imageJson.data) {
        // prefer direct url if present
        if (typeof item.url === "string" && item.url.length > 0) {
          images.push(item.url);
        } else if (
          typeof item.b64_json === "string" &&
          item.b64_json.length > 0
        ) {
          images.push(`data:image/png;base64,${item.b64_json}`);
        } else {
          // try to stringify whole item as fallback
          images.push(JSON.stringify(item));
        }
      }
    } else if (typeof imageJson?.result === "string") {
      // some responses might include a single result string
      images.push(imageJson.result);
    } else {
      console.warn("No images returned from OpenAI image endpoint:", imageJson);
    }

    // final response
    return NextResponse.json({
      title: recipeObj.title ?? "دستور پخت",
      history: recipeObj.history ?? "",
      steps: recipeObj.steps ?? [],
      images,
      ingredients,
    });
  } catch (err) {
    console.error("generate-recipe error:", err);
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}
