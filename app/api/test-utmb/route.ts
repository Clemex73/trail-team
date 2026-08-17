import { NextResponse } from "next/server";

export async function GET() {
  const url =
    "https://utmb.world/fr/runner/7161804.clement.excoffier";

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const html = await response.text();

    const generalMatch = html.match(
      /a un UTMB(?:®|&reg;)? Index de (\d+)/
    );

    const cardRegex =
      /alt="(20K|50K|100K|100M)"[\s\S]{0,1500}?index-card_value[^>]*>(\d+)<\/span>/g;

    const categories: Record<string, number> = {};

    for (const match of html.matchAll(cardRegex)) {
      categories[match[1]] = Number(match[2]);
    }

    return NextResponse.json({
      success: true,
      general_index: generalMatch ? Number(generalMatch[1]) : null,
      index_20k: categories["20K"] ?? null,
      index_50k: categories["50K"] ?? null,
      index_100k: categories["100K"] ?? null,
      index_100m: categories["100M"] ?? null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}