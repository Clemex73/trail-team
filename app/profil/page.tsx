"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const logoMap = {
  general: "/utmb/utmb-index.png",
  "20k": "/utmb/20k.png",
  "50k": "/utmb/50k.avif",
  "100k": "/utmb/100k.png",
  "100m": "/utmb/100m.png",
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  goals: string | null;
};

type UtmbProfile = {
  id: string;
  user_id: string;
  utmb_runner_id: string | null;
  utmb_profile_url: string | null;
  general_index: number | null;
  index_20k: number | null;
  index_50k: number | null;
  index_100k: number | null;
  index_100m: number | null;
  last_sync: string | null;
};

export default function ProfilPage() {
  const supabase = createClient();

  const [userId, setUserId] =
    useState<string | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [utmb, setUtmb] =
    useState<UtmbProfile | null>(null);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [nickname, setNickname] =
    useState("");

  const [bio, setBio] =
    useState("");

  const [goals, setGoals] =
    useState("");

  const [utmbUrl, setUtmbUrl] =
    useState("");

  const [avatarFile, setAvatarFile] =
    useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [savingProfile, setSavingProfile] =
    useState(false);

  const [savingUtmb, setSavingUtmb] =
    useState(false);

  const [syncingUtmb, setSyncingUtmb] =
    useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUserId(null);
      setLoading(false);
      return;
    }

    setUserId(user.id);

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        first_name,
        last_name,
        nickname,
        avatar_url,
        bio,
        goals
      `)
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error(
        "Erreur chargement profil :",
        profileError
      );
    }

    if (profileData) {
      const typedProfile =
        profileData as Profile;

      setProfile(typedProfile);

      setFirstName(
        typedProfile.first_name ?? ""
      );

      setLastName(
        typedProfile.last_name ?? ""
      );

      setNickname(
        typedProfile.nickname ?? ""
      );

      setBio(
        typedProfile.bio ?? ""
      );

      setGoals(
        typedProfile.goals ?? ""
      );

      setAvatarPreview(
        typedProfile.avatar_url ?? null
      );
    }

    const {
      data: utmbData,
      error: utmbError,
    } = await supabase
      .from("utmb_profiles")
      .select(`
        id,
        user_id,
        utmb_runner_id,
        utmb_profile_url,
        general_index,
        index_20k,
        index_50k,
        index_100k,
        index_100m,
        last_sync
      `)
      .eq("user_id", user.id)
      .maybeSingle();

    if (utmbError) {
      console.error(
        "Erreur chargement UTMB :",
        utmbError
      );
    }

    if (utmbData) {
      const typedUtmb =
        utmbData as UtmbProfile;

      setUtmb(typedUtmb);

      setUtmbUrl(
        typedUtmb.utmb_profile_url ?? ""
      );
    } else {
      setUtmb(null);
      setUtmbUrl("");
    }

    setLoading(false);
  }

  /* ======================================================
     PHOTO PROFIL
  ====================================================== */

  function chooseAvatar(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      alert(
        "Merci de sélectionner une image."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      alert(
        "La photo ne doit pas dépasser 5 Mo."
      );
      return;
    }

    if (
      avatarPreview &&
      avatarPreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(
        avatarPreview
      );
    }

    setAvatarFile(file);

    setAvatarPreview(
      URL.createObjectURL(file)
    );
  }

  async function uploadAvatar() {
    if (
      !avatarFile ||
      !userId
    ) {
      return profile?.avatar_url ?? null;
    }

    const extension =
      avatarFile.name
        .split(".")
        .pop() ?? "jpg";

    const filePath =
      `${userId}/avatar-${crypto.randomUUID()}.${extension}`;

    const { error } =
      await supabase.storage
        .from("avatars")
        .upload(
          filePath,
          avatarFile,
          {
            upsert: false,
            cacheControl: "3600",
          }
        );

    if (error) {
      throw error;
    }

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  /* ======================================================
     SAUVEGARDE PROFIL
  ====================================================== */

  async function saveProfile(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      alert(
        "Tu dois être connecté."
      );
      return;
    }

    setSavingProfile(true);

    try {
      const avatarUrl =
        await uploadAvatar();

      const { error } =
        await supabase
          .from("profiles")
          .update({
            first_name:
              firstName.trim() ||
              null,

            last_name:
              lastName.trim() ||
              null,

            nickname:
              nickname.trim() ||
              null,

            avatar_url:
              avatarUrl,

            bio:
              bio.trim() ||
              null,

            goals:
              goals.trim() ||
              null,
          })
          .eq("id", userId);

      if (error) {
        throw error;
      }

      setAvatarFile(null);

      alert(
        "Profil enregistré."
      );

      await loadProfile();
    } catch (error: any) {
      console.error(
        "Erreur sauvegarde profil :",
        error
      );

      alert(
        `Erreur : ${
          error?.message ??
          "Impossible d'enregistrer le profil."
        }`
      );
    } finally {
      setSavingProfile(false);
    }
  }

  /* ======================================================
     ENREGISTRER LIEN UTMB
  ====================================================== */

  async function saveUtmbUrl(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      return;
    }

    if (!utmbUrl.trim()) {
      alert(
        "Ajoute ton lien de profil UTMB."
      );
      return;
    }

    setSavingUtmb(true);

    const { error } =
      await supabase
        .from("utmb_profiles")
        .upsert(
          {
            user_id:
              userId,

            utmb_profile_url:
              utmbUrl.trim(),
          },
          {
            onConflict:
              "user_id",
          }
        );

    setSavingUtmb(false);

    if (error) {
      console.error(
        "Erreur sauvegarde UTMB :",
        error
      );

      alert(
        `Erreur : ${error.message}`
      );

      return;
    }

    alert(
      "Lien UTMB enregistré."
    );

    await loadProfile();
  }

  /* ======================================================
     SYNCHRONISATION UTMB
  ====================================================== */

  async function syncUtmb() {
    if (!userId) {
      return;
    }

    if (!utmbUrl.trim()) {
      alert(
        "Enregistre d'abord ton lien UTMB."
      );
      return;
    }

    setSyncingUtmb(true);

    try {
      const response =
        await fetch(
          "/api/sync-utmb",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              userId,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "La synchronisation UTMB a échoué."
        );
      }

      alert(
        "Scores UTMB synchronisés."
      );

      await loadProfile();
    } catch (error: any) {
      console.error(
        "Erreur sync UTMB :",
        error
      );

      alert(
        `Erreur : ${
          error?.message ??
          "Impossible de synchroniser UTMB."
        }`
      );
    } finally {
      setSyncingUtmb(false);
    }
  }

  if (loading) {
    return (
      <main className="page-container profile-page">
        <p>
          Chargement du profil...
        </p>
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="page-container profile-page">
        <div className="card">
          <h1>
            Connexion nécessaire
          </h1>

          <p>
            Tu dois être connecté pour
            modifier ton profil.
          </p>
        </div>
      </main>
    );
  }

  const fullName =
    `${firstName} ${lastName}`.trim() ||
    nickname ||
    "Membre";

  return (
    <main className="page-container profile-page">

      {/* ==================================================
          TITRE
      ================================================== */}

      <div className="profile-page-heading">
        <span className="purple-badge">
          MON PROFIL
        </span>

        <h1>
          Mon espace membre
        </h1>

        <p className="text-muted">
          Personnalise ton profil et
          garde tes données UTMB à jour.
        </p>
      </div>

      {/* ==================================================
          PROFIL PERSONNEL
      ================================================== */}

      <section className="profile-editor-grid">

        {/* PHOTO */}

        <aside className="card profile-photo-card">
          <div className="profile-avatar-large">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={fullName}
              />
            ) : (
              <span>
                {(firstName?.[0] ??
                  nickname?.[0] ??
                  "?").toUpperCase()}
              </span>
            )}
          </div>

          <h2>
            {fullName}
          </h2>

          {nickname && (
            <p className="text-muted">
              @{nickname}
            </p>
          )}

          <label className="profile-photo-button">
            Changer ma photo

            <input
              type="file"
              accept="image/*"
              onChange={chooseAvatar}
            />
          </label>

          <small>
            JPG, PNG ou WEBP · 5 Mo max
          </small>
        </aside>

        {/* INFORMATIONS */}

        <form
          className="card profile-info-card"
          onSubmit={saveProfile}
        >
          <div className="profile-section-label">
            INFORMATIONS
          </div>

          <h2>
            Présente-toi au team
          </h2>

          <div className="profile-name-grid">
            <div>
              <label>
                Prénom
              </label>

              <input
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value
                  )
                }
              />
            </div>

            <div>
              <label>
                Nom
              </label>

              <input
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <div>
            <label>
              Pseudo
            </label>

            <input
              value={nickname}
              onChange={(event) =>
                setNickname(
                  event.target.value
                )
              }
              placeholder="Clemex"
            />
          </div>

          <div>
            <label>
              Bio courte
            </label>

            <textarea
              rows={4}
              maxLength={300}
              value={bio}
              onChange={(event) =>
                setBio(
                  event.target.value
                )
              }
              placeholder="Trailer passionné de montagne, amateur de longues sorties et de terrains techniques..."
            />

            <small>
              {bio.length}/300
            </small>
          </div>

          <div>
            <label>
              Mes objectifs
            </label>

            <textarea
              rows={5}
              maxLength={700}
              value={goals}
              onChange={(event) =>
                setGoals(
                  event.target.value
                )
              }
              placeholder="Objectifs de la saison, courses rêvées, progression recherchée..."
            />

            <small>
              {goals.length}/700
            </small>
          </div>

          <button
            type="submit"
            disabled={
              savingProfile
            }
            className="profile-save-button"
          >
            {savingProfile
              ? "Enregistrement..."
              : "Enregistrer mon profil"}
          </button>
        </form>
      </section>

      {/* ==================================================
          UTMB
      ================================================== */}

      <section className="profile-utmb-section">
        <div className="profile-section-heading">
          <div>
            <span>
              PERFORMANCE
            </span>

            <h2>
              Mon profil UTMB
            </h2>
          </div>

          {utmb?.last_sync && (
            <p>
              Dernière synchro :{" "}
              {new Date(
                utmb.last_sync
              ).toLocaleString(
                "fr-FR"
              )}
            </p>
          )}
        </div>

        <div className="profile-utmb-layout">

          {/* URL */}

          <div className="card profile-utmb-settings">
            <h3>
              Profil UTMB World
            </h3>

            <p className="text-muted">
              Colle ici l&apos;adresse de
              ton profil UTMB. Elle sera
              utilisée pour récupérer tes
              index.
            </p>

            <form
              onSubmit={saveUtmbUrl}
            >
              <label>
                Lien du profil UTMB
              </label>

              <input
                type="url"
                value={utmbUrl}
                onChange={(event) =>
                  setUtmbUrl(
                    event.target.value
                  )
                }
                placeholder="https://utmb.world/runner/..."
              />

              <div className="profile-utmb-buttons">
                <button
                  type="submit"
                  disabled={
                    savingUtmb
                  }
                >
                  {savingUtmb
                    ? "Enregistrement..."
                    : "Enregistrer le lien"}
                </button>

                <button
                  type="button"
                  className="profile-sync-button"
                  disabled={
                    syncingUtmb
                  }
                  onClick={
                    syncUtmb
                  }
                >
                  {syncingUtmb
                    ? "Synchronisation..."
                    : "Synchroniser UTMB"}
                </button>
              </div>
            </form>

            {utmb?.utmb_runner_id && (
              <div className="profile-runner-id">
                RUNNER ID :{" "}
                {utmb.utmb_runner_id}
              </div>
            )}
          </div>

          {/* SCORES */}

          <div className="profile-utmb-scores">

            <div className="profile-utmb-general">
              <div className="profile-utmb-logo">
                <Image
                  src={logoMap.general}
                  alt="UTMB Index"
                  width={125}
                  height={38}
                />
              </div>

              <strong>
                {utmb?.general_index ??
                  "-"}
              </strong>

              <span>
                INDEX GÉNÉRAL
              </span>
            </div>

            <div className="profile-utmb-index-grid">
              <ProfileIndexBox
                logo={
                  logoMap["20k"]
                }
                alt="20K"
                value={
                  utmb?.index_20k ??
                  null
                }
              />

              <ProfileIndexBox
                logo={
                  logoMap["50k"]
                }
                alt="50K"
                value={
                  utmb?.index_50k ??
                  null
                }
              />

              <ProfileIndexBox
                logo={
                  logoMap["100k"]
                }
                alt="100K"
                value={
                  utmb?.index_100k ??
                  null
                }
              />

              <ProfileIndexBox
                logo={
                  logoMap["100m"]
                }
                alt="100M"
                value={
                  utmb?.index_100m ??
                  null
                }
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProfileIndexBox({
  logo,
  alt,
  value,
}: {
  logo: string;
  alt: string;
  value: number | null;
}) {
  return (
    <div className="profile-index-box">
      <div>
        <Image
          src={logo}
          alt={alt}
          width={95}
          height={30}
        />
      </div>

      <strong
        className={
          value
            ? "profile-index-active"
            : ""
        }
      >
        {value ?? "-"}
      </strong>
    </div>
  );
}