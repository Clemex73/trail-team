"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut();
      router.push("/login");
    }

    logout();
  }, []);

  return <p style={{ padding: "40px" }}>Déconnexion...</p>;
}