"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Rarity =
  | "common"
  | "rare"
  | "premium"
  | "epic"
  | "legendary";

type UtmbProfile = {
  general_index: number | null;
  index_20k: number | null;
  index_50k: number | null;
  index_100k: number | null;
  index_100m: number | null;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;

  utmb_profiles:
    | UtmbProfile
    | UtmbProfile[]
    | null;
};

type CollectionItem = {
  id: string;
  user_id: string;
  member_id: string;
  rarity: Rarity;
  copies: number;
  first_obtained_at: string;
  last_obtained_at: string;
};

type Draw = {
  id: string;
  user_id: string;
  member_id: string;
  rarity: Rarity;
  drawn_on: string;
  created_at: string;
};

type DrawResult = {
  draw_id: string;
  member_id: string;
  rarity: Rarity;
  drawn_on: string;
  is_new: boolean;
  copies: number;
};

const rarityInfo: Record<
  Rarity,
  {
    label: string;
    probability: string;
  }
> = {
  common: {
    label: "COMMUN",
    probability: "55 %",
  },

  rare: {
    label: "RARE",
    probability: "25 %",
  },

  premium: {
    label: "PREMIUM",
    probability: "12 %",
  },

  epic: {
    label: "ÉPIQUE",
    probability: "6 %",
  },

  legendary: {
    label: "LÉGENDAIRE",
    probability: "2 %",
  },
};

export default function CardsPage() {
  const supabase = createClient();

  const [userId, setUserId] =
    useState<string | null>(null);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [collection, setCollection] =
    useState<CollectionItem[]>([]);

  const [todayDraw, setTodayDraw] =
    useState<Draw | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [drawing, setDrawing] =
    useState(false);

  const [drawResult, setDrawResult] =
    useState<DrawResult | null>(null);

  const [revealCard, setRevealCard] =
    useState(false);

  const [filter, setFilter] =
    useState<"all" | Rarity>("all");

  useEffect(() => {
    loadGame();
  }, []);

  /* ======================================================
     DATE PARIS
  ====================================================== */

  function getTodayParis() {
    return new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Europe/Paris",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    ).format(new Date());
  }

  /* ======================================================
     CHARGEMENT
  ====================================================== */

  async function loadGame() {
    setLoading(true);

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const [
      profilesResult,
      collectionResult,
      drawResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select(`
          id,
          first_name,
          last_name,
          nickname,
          avatar_url,
          bio,
          utmb_profiles (
            general_index,
            index_20k,
            index_50k,
            index_100k,
            index_100m
          )
        `),

      supabase
        .from("member_card_collection")
        .select("*")
        .order("last_obtained_at", {
          ascending: false,
        }),

      supabase
        .from("member_card_draws")
        .select("*")
        .eq(
          "drawn_on",
          getTodayParis()
        )
        .maybeSingle(),
    ]);

    if (profilesResult.error) {
      console.error(
        "Erreur profils MTT Cards :",
        profilesResult.error
      );
    }

    if (collectionResult.error) {
      console.error(
        "Erreur collection MTT Cards :",
        collectionResult.error
      );
    }

    if (drawResult.error) {
      console.error(
        "Erreur tirage du jour MTT Cards :",
        drawResult.error
      );
    }

    setProfiles(
      (profilesResult.data ?? []) as Profile[]
    );

    setCollection(
      (collectionResult.data ??
        []) as CollectionItem[]
    );

    setTodayDraw(
      (drawResult.data ??
        null) as Draw | null
    );

    setLoading(false);
  }

  /* ======================================================
     TIRAGE
  ====================================================== */

  async function drawCard() {
    if (!userId || drawing) {
      return;
    }

    setDrawing(true);
    setRevealCard(false);
    setDrawResult(null);

    const { data, error } =
      await supabase.rpc(
        "draw_daily_member_card"
      );

    /* ====================================================
       ERREUR SUPABASE DETAILLEE
    ==================================================== */

    if (error) {
      console.error(
        "ERREUR TIRAGE MTT CARDS :",
        error
      );

      alert(
        `ERREUR SUPABASE

Message : ${error.message}

Code : ${error.code ?? "inconnu"}

Détail : ${error.details ?? "aucun"}

Hint : ${error.hint ?? "aucun"}`
      );

      setDrawing(false);

      return;
    }

    console.log(
      "Résultat tirage MTT Cards :",
      data
    );

    const result =
      Array.isArray(data)
        ? data[0]
        : data;

    if (!result) {
      alert(
        "Le serveur n'a retourné aucune carte."
      );

      setDrawing(false);

      return;
    }

    const typedResult =
      result as DrawResult;

    setDrawResult(
      typedResult
    );

    /*
     * On laisse l'animation
     * d'ouverture pendant 1,2 seconde.
     */

    setTimeout(() => {
      setRevealCard(true);
      setDrawing(false);
    }, 1200);

    /*
     * On recharge la collection
     * sans bloquer l'animation.
     */

    await refreshCollection();
  }

  /* ======================================================
     RECHARGE COLLECTION APRES TIRAGE
  ====================================================== */

  async function refreshCollection() {
    const {
      data: collectionData,
      error: collectionError,
    } = await supabase
      .from("member_card_collection")
      .select("*")
      .order("last_obtained_at", {
        ascending: false,
      });

    if (collectionError) {
      console.error(
        "Erreur actualisation collection :",
        collectionError
      );
    } else {
      setCollection(
        (collectionData ??
          []) as CollectionItem[]
      );
    }

    const {
      data: todayDrawData,
      error: todayDrawError,
    } = await supabase
      .from("member_card_draws")
      .select("*")
      .eq(
        "drawn_on",
        getTodayParis()
      )
      .maybeSingle();

    if (todayDrawError) {
      console.error(
        "Erreur actualisation tirage :",
        todayDrawError
      );
    } else {
      setTodayDraw(
        (todayDrawData ??
          null) as Draw | null
      );
    }
  }

  /* ======================================================
     PROFIL
  ====================================================== */

  function getProfile(
    profileId: string
  ) {
    return profiles.find(
      (profile) =>
        profile.id === profileId
    );
  }

  /* ======================================================
     COLLECTION FILTREE
  ====================================================== */

  const filteredCollection =
    useMemo(() => {
      if (filter === "all") {
        return collection;
      }

      return collection.filter(
        (item) =>
          item.rarity === filter
      );
    }, [
      collection,
      filter,
    ]);

  /* ======================================================
     STATISTIQUES
  ====================================================== */

  const totalPossibleCards =
    profiles.length * 5;

  const collectionProgress =
    totalPossibleCards > 0
      ? Math.round(
          (collection.length /
            totalPossibleCards) *
            100
        )
      : 0;

  const totalCopies =
    collection.reduce(
      (total, item) =>
        total + item.copies,
      0
    );

  const legendaryCount =
    collection.filter(
      (item) =>
        item.rarity ===
        "legendary"
    ).length;

  /* ======================================================
     CARTE DU JOUR
  ====================================================== */

  const drawnMemberId =
    drawResult?.member_id ??
    todayDraw?.member_id ??
    null;

  const drawnRarity =
    drawResult?.rarity ??
    todayDraw?.rarity ??
    null;

  const drawnProfile =
    drawnMemberId
      ? getProfile(
          drawnMemberId
        )
      : null;

  /* ======================================================
     CHARGEMENT
  ====================================================== */

  if (loading) {
    return (
      <main className="page-container cards-page">
        Chargement des MTT Cards...
      </main>
    );
  }

  /* ======================================================
     NON CONNECTE
  ====================================================== */

  if (!userId) {
    return (
      <main className="page-container cards-page">
        <div className="cards-game-header">
          <span>
            MAURIENNE TRAIL TEAM
          </span>

          <h1>
            MTT{" "}
            <strong>
              CARDS
            </strong>
          </h1>

          <p>
            Collectionne les membres du
            team et tente de décrocher
            leurs versions légendaires.
          </p>
        </div>

        <div className="cards-login-box">
          <h2>
            Connecte-toi pour jouer
          </h2>

          <p>
            Un tirage est disponible
            chaque jour.
          </p>

          <Link href="/login">
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container cards-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="cards-game-header">
        <span>
          MAURIENNE TRAIL TEAM
        </span>

        <h1>
          MTT{" "}
          <strong>
            CARDS
          </strong>
        </h1>

        <p>
          Un tirage par jour.
          Collectionne tous les membres
          du team et tente de trouver
          leurs versions les plus rares.
        </p>
      </header>

      {/* ==================================================
          STATS
      ================================================== */}

      <section className="cards-stats">

        <div>
          <strong>
            {
              collection.length
            }
          </strong>

          <span>
            CARTES UNIQUES
          </span>
        </div>

        <div>
          <strong>
            {
              totalCopies
            }
          </strong>

          <span>
            CARTES TIRÉES
          </span>
        </div>

        <div>
          <strong>
            {
              collectionProgress
            }
            %
          </strong>

          <span>
            COLLECTION
          </span>
        </div>

        <div>
          <strong>
            {
              legendaryCount
            }
          </strong>

          <span>
            LÉGENDAIRES
          </span>
        </div>

      </section>

      {/* ==================================================
          TIRAGE DU JOUR
      ================================================== */}

      <section className="cards-draw-section">

        <div className="cards-section-heading">

          <span>
            TIRAGE QUOTIDIEN
          </span>

          <h2>
            La carte du jour
          </h2>

        </div>

        <div className="cards-draw-zone">

          {/* =================================================
              BOOSTER FERME
          ================================================= */}

          {!todayDraw &&
            !drawResult &&
            !drawing && (

              <div className="cards-pack">

                <div className="cards-pack-logo">
                  MTT
                </div>

                <span>
                  DAILY CARD
                </span>

                <strong>
                  ?
                </strong>

                <p>
                  Quelle carte se cache
                  aujourd&apos;hui ?
                </p>

              </div>
            )}

          {/* =================================================
              OUVERTURE
          ================================================= */}

          {drawing && (

            <div className="cards-opening">

              <div className="cards-opening-glow" />

              <strong>
                OUVERTURE...
              </strong>

            </div>
          )}

          {/* =================================================
              CARTE REVELEE
          ================================================= */}

          {!drawing &&
            drawnProfile &&
            drawnRarity &&
            (
              todayDraw ||
              revealCard
            ) && (

              <MemberCard
                profile={
                  drawnProfile
                }
                rarity={
                  drawnRarity
                }
                copies={
                  drawResult?.copies ??
                  getCollectionCopies(
                    collection,
                    drawnProfile.id,
                    drawnRarity
                  )
                }
                featured
              />
            )}

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="cards-draw-actions">

            {!todayDraw &&
              !drawResult ? (

                <button
                  type="button"
                  className="cards-draw-button"
                  onClick={
                    drawCard
                  }
                  disabled={
                    drawing
                  }
                >
                  {drawing
                    ? "OUVERTURE..."
                    : "🎴 TIRER MA CARTE"}
                </button>

              ) : (

                <div className="cards-already-drawn">
                  ✓ Tirage du jour effectué
                </div>

              )}

            <p>
              Nouveau tirage disponible
              demain.
            </p>

          </div>

        </div>

        {/* ==================================================
            NOUVELLE CARTE
        ================================================== */}

        {drawResult?.is_new &&
          revealCard && (

            <div className="cards-new-card-message">
              ✨ NOUVELLE CARTE POUR TA
              COLLECTION !
            </div>

          )}

        {/* ==================================================
            DOUBLON
        ================================================== */}

        {drawResult &&
          !drawResult.is_new &&
          revealCard && (

            <div className="cards-duplicate-message">
              Doublon ! Tu possèdes
              maintenant cette carte en
              ×{drawResult.copies}.
            </div>

          )}

      </section>

      {/* ==================================================
          RARETES
      ================================================== */}

      <section className="cards-rarity-guide">

        {(
          Object.keys(
            rarityInfo
          ) as Rarity[]
        ).map(
          (rarity) => (

            <div
              key={
                rarity
              }
              className={`cards-rarity-guide-item rarity-${rarity}`}
            >

              <strong>
                {
                  rarityInfo[
                    rarity
                  ].label
                }
              </strong>

              <span>
                {
                  rarityInfo[
                    rarity
                  ].probability
                }
              </span>

            </div>

          )
        )}

      </section>

      {/* ==================================================
          COLLECTION
      ================================================== */}

      <section className="cards-collection-section">

        <div className="cards-section-heading cards-collection-heading">

          <div>

            <span>
              TON ALBUM
            </span>

            <h2>
              Ma collection
            </h2>

          </div>

          <strong>
            {
              collection.length
            }
            {" / "}
            {
              totalPossibleCards
            }
          </strong>

        </div>

        {/* ==================================================
            FILTRES
        ================================================== */}

        <div className="cards-filters">

          <button
            type="button"
            className={
              filter === "all"
                ? "cards-filter-active"
                : ""
            }
            onClick={() =>
              setFilter(
                "all"
              )
            }
          >
            Toutes
          </button>

          {(
            Object.keys(
              rarityInfo
            ) as Rarity[]
          ).map(
            (rarity) => (

              <button
                type="button"
                key={
                  rarity
                }
                className={
                  filter === rarity
                    ? "cards-filter-active"
                    : ""
                }
                onClick={() =>
                  setFilter(
                    rarity
                  )
                }
              >
                {
                  rarityInfo[
                    rarity
                  ].label
                }
              </button>

            )
          )}

        </div>

        {/* ==================================================
            COLLECTION VIDE
        ================================================== */}

        {filteredCollection.length ===
        0 ? (

          <div className="cards-empty">
            Aucune carte dans cette
            catégorie.
          </div>

        ) : (

          <div className="cards-collection-grid">

            {filteredCollection.map(
              (item) => {

                const profile =
                  getProfile(
                    item.member_id
                  );

                if (!profile) {
                  return null;
                }

                return (
                  <MemberCard
                    key={
                      item.id
                    }
                    profile={
                      profile
                    }
                    rarity={
                      item.rarity
                    }
                    copies={
                      item.copies
                    }
                  />
                );
              }
            )}

          </div>

        )}

      </section>

    </main>
  );
}

/* ==========================================================
   NOMBRE D'EXEMPLAIRES
========================================================== */

function getCollectionCopies(
  collection: CollectionItem[],
  memberId: string,
  rarity: Rarity
) {
  return (
    collection.find(
      (item) =>
        item.member_id ===
          memberId &&
        item.rarity ===
          rarity
    )?.copies ?? 1
  );
}

/* ==========================================================
   CARTE MTT
========================================================== */

function MemberCard({
  profile,
  rarity,
  copies,
  featured = false,
}: {
  profile: Profile;
  rarity: Rarity;
  copies: number;
  featured?: boolean;
}) {
  const utmb =
    Array.isArray(
      profile.utmb_profiles
    )
      ? profile.utmb_profiles[0]
      : profile.utmb_profiles;

  const fullName =
    `${profile.first_name ?? ""} ${
      profile.last_name ?? ""
    }`.trim() ||
    profile.nickname ||
    "Membre";

  const indexes = [
    {
      label: "20K",
      value:
        utmb?.index_20k,
    },

    {
      label: "50K",
      value:
        utmb?.index_50k,
    },

    {
      label: "100K",
      value:
        utmb?.index_100k,
    },

    {
      label: "100M",
      value:
        utmb?.index_100m,
    },
  ];

  const bestIndex =
    [...indexes]
      .filter(
        (item) =>
          item.value !== null &&
          item.value !== undefined
      )
      .sort(
        (a, b) =>
          (b.value ?? 0) -
          (a.value ?? 0)
      )[0];

  return (
    <article
      className={`mtt-card rarity-${rarity} ${
        featured
          ? "mtt-card-featured"
          : ""
      }`}
    >

      <div className="mtt-card-inner">

        {/* ==================================================
            TOP
        ================================================== */}

        <div className="mtt-card-top">

          <span>
            MTT CARD
          </span>

          <strong>
            {
              rarityInfo[
                rarity
              ].label
            }
          </strong>

        </div>

        {/* ==================================================
            PHOTO
        ================================================== */}

        <div className="mtt-card-photo">

          {profile.avatar_url ? (

            <img
              src={
                profile.avatar_url
              }
              alt={
                fullName
              }
            />

          ) : (

            <div className="mtt-card-placeholder">
              {(
                profile.first_name?.[0] ??
                profile.nickname?.[0] ??
                "?"
              ).toUpperCase()}
            </div>

          )}

          {/* UTMB GENERAL */}

          <div className="mtt-card-index">

            <small>
              UTMB
            </small>

            <strong>
              {
                utmb?.general_index ??
                "-"
              }
            </strong>

          </div>

        </div>

        {/* ==================================================
            IDENTITE
        ================================================== */}

        <div className="mtt-card-identity">

          <h3>
            {
              fullName
            }
          </h3>

          {profile.nickname && (

            <span>
              @
              {
                profile.nickname
              }
            </span>

          )}

        </div>

        {/* ==================================================
            SPECIALITE
        ================================================== */}

        <div className="mtt-card-speciality">

          <span>
            SPÉCIALITÉ
          </span>

          <strong>
            {bestIndex
              ? `${bestIndex.label} · ${bestIndex.value}`
              : "TRAIL"}
          </strong>

        </div>

        {/* ==================================================
            INDEX UTMB
        ================================================== */}

        <div className="mtt-card-indexes">

          {indexes.map(
            (index) => (

              <div
                key={
                  index.label
                }
              >

                <span>
                  {
                    index.label
                  }
                </span>

                <strong>
                  {
                    index.value ??
                    "-"
                  }
                </strong>

              </div>

            )
          )}

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mtt-card-footer">

          <span>
            MAURIENNE TRAIL TEAM
          </span>

          {copies > 1 && (

            <strong>
              ×
              {
                copies
              }
            </strong>

          )}

        </div>

      </div>

    </article>
  );
}