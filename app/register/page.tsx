"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function RegisterPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`Erreur : ${error.message}`);
      return;
    }

    setMessage("Compte créé ✅ Vérifie ton email si Supabase te le demande.");
  }

  return (
    <main style={{ padding: "40px", maxWidth: "500px" }}>
      <h1>Créer un compte</h1>

      <form onSubmit={handleRegister}>
        <div style={{ marginBottom: "16px" }}>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>Mot de passe</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <button type="submit">Créer mon compte</button>
      </form>

      {message && <p style={{ marginTop: "20px" }}>{message}</p>}
    </main>
  );
}