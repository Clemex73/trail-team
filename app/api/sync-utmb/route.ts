import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  // 1. Vérifier l'utilisateur connecté
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      {
        success: false,
        error: "Utilisateur non connecté",
      },
      { status: 401 }
    );
  }

  // 2. Récupérer son profil UTMB
  const { data: utmbProfile, error: profileError } = await supabase
    .from("utmb_profiles")
    .select("utmb_profile_url")
    .eq("user_id", user.id)
    .single();

  if (profileError || !utmbProfile?.utmb_profile_url) {
    return NextResponse.json(
      {
        success: false,
        error: "Aucun profil UTMB configuré",
      },
      { status: 404 }
    );
  }

  try {
    // 3. Télécharger la page UTMB
    const response = await fetch(utmbProfile.utmb_profile_url, {
      cache: "no-store",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `UTMB a répondu avec le statut ${response.status}`,
        },
        { status: 502 }
      );
    }

    const html = await response.text();

    // 4. Index général
    const generalMatch = html.match(
      /a un UTMB(?:®|&reg;)? Index de (\d+)/
    );

    // 5. Index par catégorie
    const cardRegex =
      /alt="(20K|50K|100K|100M)"[\s\S]{0,1500}?index-card_value[^>]*>(\d+)<\/span>/g;

    const categories: Record<string, number> = {};

    for (const match of html.matchAll(cardRegex)) {
      categories[match[1]] = Number(match[2]);
    }

    const scores = {
      general_index: generalMatch ? Number(generalMatch[1]) : null,
      index_20k: categories["20K"] ?? null,
      index_50k: categories["50K"] ?? null,
      index_100k: categories["100K"] ?? null,
      index_100m: categories["100M"] ?? null,
      last_sync: new Date().toISOString(),
    };

    // 6. Mettre à jour Supabase
    const { error: updateError } = await supabase
      .from("utmb_profiles")
      .update(scores)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Scores UTMB synchronisés",
      scores,
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