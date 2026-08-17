"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilPage() {
  const supabase = createClient();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");

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

      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, nickname")
        .eq("id", user.id)
        .single();

      if (error) {
        setMessage(`Erreur : ${error.message}`);
        return;
      }

      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setNickname(data.nickname ?? "");
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

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        nickname: nickname,
      })
      .eq("id", user.id);

    if (error) {
      setMessage(`Erreur : ${error.message}`);
      return;
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
    <main
      style={{
        padding: "40px",
        maxWidth: "500px",
      }}
    >
      <h1>Mon profil</h1>

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "16px" }}>
          <label>Prénom</label>

          <br />

          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Nom</label>

          <br />

          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Pseudo</label>

          <br />

          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
            }}
          />
        </div>

        <button type="submit">
          Enregistrer
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}

      <hr
        style={{
          marginTop: "30px",
          marginBottom: "30px",
        }}
      />

      <h2>UTMB</h2>

      <p>
        Mets à jour automatiquement tes scores depuis ton profil UTMB.
      </p>

      <button
        type="button"
        onClick={handleSyncUtmb}
      >
        Synchroniser UTMB
      </button>

      {syncMessage && (
        <p style={{ marginTop: "10px" }}>
          {syncMessage}
        </p>
      )}
    </main>
  );
}