import { createClient } from "@/utils/supabase/server";

export default async function TestSupabasePage() {
  const supabase = await createClient();

  const { error } = await supabase.from("profiles").select("*").limit(1);

  return (
    <main style={{ padding: "40px" }}>
      <h1>Test Supabase</h1>

      {error ? (
        <p>Erreur : {error.message}</p>
      ) : (
        <p>Connexion à Supabase réussie ✅</p>
      )}
    </main>
  );
}