import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  /*
   * ==========================================================
   * AUTORISATION
   * ==========================================================
   *
   * Deux possibilités :
   *
   * 1. Vercel Cron
   *    -> Authorization: Bearer CRON_SECRET
   *
   * 2. Synchronisation manuelle
   *    -> utilisateur connecté = ADMIN_USER_ID
   *
   */

  const authHeader =
    request.headers.get("authorization");

  const cronAuthorized =
    Boolean(process.env.CRON_SECRET) &&
    authHeader ===
      `Bearer ${process.env.CRON_SECRET}`;

  let adminAuthorized = false;

  if (!cronAuthorized) {
    const supabaseUser =
      await createClient();

    const {
      data: { user },
    } =
      await supabaseUser.auth.getUser();

    adminAuthorized =
      Boolean(user) &&
      Boolean(process.env.ADMIN_USER_ID) &&
      user?.id ===
        process.env.ADMIN_USER_ID;
  }

  if (
    !cronAuthorized &&
    !adminAuthorized
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Non autorisé",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const supabase =
      createAdminClient();

    /*
     * ==========================================================
     * RECUPERER LES PROFILS UTMB
     * ==========================================================
     */

    const {
      data: profiles,
      error,
    } = await supabase
      .from("utmb_profiles")
      .select(
        "id, user_id, utmb_profile_url"
      )
      .not(
        "utmb_profile_url",
        "is",
        null
      );

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !profiles ||
      profiles.length === 0
    ) {
      return NextResponse.json({
        success: true,
        total: 0,
        updated: 0,
        failed: 0,
        results: [],
      });
    }

    let updated = 0;
    let failed = 0;

    const results = [];

    /*
     * ==========================================================
     * SYNCHRONISATION DE CHAQUE MEMBRE
     * ==========================================================
     */

    for (const profile of profiles) {
      try {
        if (
          !profile.utmb_profile_url
        ) {
          failed++;

          results.push({
            user_id:
              profile.user_id,

            success: false,

            error:
              "URL UTMB absente",
          });

          continue;
        }

        /*
         * ======================================================
         * TELECHARGEMENT PAGE UTMB
         * ======================================================
         */

        const response =
          await fetch(
            profile.utmb_profile_url,
            {
              cache: "no-store",

              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
              },
            }
          );

        if (!response.ok) {
          failed++;

          results.push({
            user_id:
              profile.user_id,

            success: false,

            error:
              `UTMB HTTP ${response.status}`,
          });

          continue;
        }

        const html =
          await response.text();

        /*
         * ======================================================
         * INDEX GENERAL
         * ======================================================
         */

        const generalMatch =
          html.match(
            /a un UTMB(?:®|&reg;)? Index de (\d+)/
          );

        /*
         * ======================================================
         * INDEX PAR CATEGORIE
         * ======================================================
         */

        const cardRegex =
          /alt="(20K|50K|100K|100M)"[\s\S]{0,1500}?index-card_value[^>]*>(\d+)<\/span>/g;

        const categories:
          Record<string, number> =
          {};

        for (
          const match of html.matchAll(
            cardRegex
          )
        ) {
          categories[
            match[1]
          ] = Number(
            match[2]
          );
        }

        /*
         * ======================================================
         * SCORES
         * ======================================================
         */

        const scores = {
          general_index:
            generalMatch
              ? Number(
                  generalMatch[1]
                )
              : null,

          index_20k:
            categories["20K"] ??
            null,

          index_50k:
            categories["50K"] ??
            null,

          index_100k:
            categories["100K"] ??
            null,

          index_100m:
            categories["100M"] ??
            null,

          last_sync:
            new Date().toISOString(),
        };

        /*
         * ======================================================
         * MISE A JOUR SUPABASE
         * ======================================================
         */

        const {
          error: updateError,
        } = await supabase
          .from("utmb_profiles")
          .update(scores)
          .eq(
            "id",
            profile.id
          );

        if (updateError) {
          failed++;

          results.push({
            user_id:
              profile.user_id,

            success: false,

            error:
              updateError.message,
          });

          continue;
        }

        updated++;

        results.push({
          user_id:
            profile.user_id,

          success: true,

          scores,
        });
      } catch (err) {
        failed++;

        results.push({
          user_id:
            profile.user_id,

          success: false,

          error:
            err instanceof Error
              ? err.message
              : "Erreur inconnue",
        });
      }
    }

    /*
     * ==========================================================
     * RESULTAT
     * ==========================================================
     */

    return NextResponse.json({
      success: true,
      total:
        profiles.length,
      updated,
      failed,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,

        error:
          err instanceof Error
            ? err.message
            : "Erreur inconnue",
      },
      {
        status: 500,
      }
    );
  }
}