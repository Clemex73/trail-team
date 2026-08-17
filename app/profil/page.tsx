"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilPage() {
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [utmbUrl, setUtmbUrl] = useState("");

  const [message, setMessage] = useState("");
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Tu dois être connecté.");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, nickname")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setMessage(`Erreur : ${profileError.message}`);
        return;
      }

      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setNickname(profile.nickname ?? "");

      const { data: utmbProfile } = await supabase
        .from("utmb_profiles")
        .select("utmb_profile_url")
        .eq("user_id", user.id)
        .maybeSingle();

      setUtmbUrl(utmbProfile?.utmb_profile_url ?? "");
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Tu dois être connecté.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        nickname,
      })
      .eq("id", user.id);

    if (profileError) {
      setMessage(`Erreur : ${profileError.message}`);
      return;
    }

    const cleanUtmbUrl = utmbUrl.trim();

    if (cleanUtmbUrl) {
      if (!cleanUtmbUrl.startsWith("https://utmb.world/")) {
        setMessage("Le lien UTMB doit commencer par https://utmb.world/");
        return;
      }

      const runnerIdMatch = cleanUtmbUrl.match(/\/runner\/(\d+)/);
      const runnerId = runnerIdMatch?.[1] ?? null;

      const { error: utmbError } = await supabase
        .from("utmb_profiles")
        .upsert(
          {
            user_id: user.id,
            utmb_profile_url: cleanUtmbUrl,
            utmb_runner_id: runnerId,
          },
          {
            onConflict: "user_id",
          }
        );

      if (utmbError) {
        setMessage(`Erreur UTMB : ${utmbError.message}`);
        return;
      }
    }

    setMessage("Profil enregistré ✅");
  }

  async function handleSyncUtmb() {
    setSyncMessage("Synchronisation en cours...");

    try {
      const response = await fetch("/api/sync-utmb");
      const data = await response.json();

      if (!response.ok || !data.success) {
        setSyncMessage(
          `Erreur : ${data.error ?? "Impossible de synchroniser"}`
        );
        return;
      }

      setSyncMessage("Scores UTMB synchronisés ✅");
    } catch {
      setSyncMessage("Erreur lors de la synchronisation UTMB.");
    }
  }

  return (
    <main className="page-container">
      <div
        className="card"
        style={{
          maxWidth: "600px",
        }}
      >
        <h1>Mon profil</h1>

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: "16px" }}>
            <label>Prénom</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Nom</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label>Pseudo</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Lien de mon profil UTMB</label>

            <input
              type="url"
              placeholder="https://utmb.world/fr/runner/1234567.prenom.nom"
              value={utmbUrl}
              onChange={(e) => setUtmbUrl(e.target.value)}
            />

            <p
              className="text-muted"
              style={{
                fontSize: "0.85rem",
                marginTop: "7px",
              }}
            >
              Copie ici l’adresse de ta page coureur sur utmb.world.
            </p>
          </div>

          <button type="submit">
            Enregistrer mon profil
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "20px" }}>
            {message}
          </p>
        )}

        <hr
          style={{
            margin: "30px 0",
            border: 0,
            borderTop: "1px solid #e7e3ee",
          }}
        />

        <h2>UTMB</h2>

        <p className="text-muted">
          Une fois ton lien UTMB enregistré, tu peux récupérer automatiquement
          tes scores.
        </p>

        <button
          type="button"
          onClick={handleSyncUtmb}
          disabled={!utmbUrl.trim()}
        >
          Synchroniser UTMB
        </button>

        {syncMessage && (
          <p style={{ marginTop: "12px" }}>
            {syncMessage}
          </p>
        )}
      </div>
    </main>
  );
}