"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function Navbar() {
  const supabase = createClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setIsConnected(!!user);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsConnected(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #4c1d95, #6d28d9)",
        boxShadow: "0 4px 18px rgba(76, 29, 149, 0.18)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "12px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "24px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "white",
            fontSize: "1.15rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          <div
            style={{
              width: "62px",
              height: "62px",
              borderRadius: "50%",
              overflow: "hidden",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 3px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Image
              src="/logo-maurienne.png"
              alt="Logo Maurienne Trail Team"
              width={62}
              height={62}
              priority
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <span>MAURIENNE TRAIL TEAM</span>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            style={{
              color: "white",
              fontWeight: 600,
            }}
          >
            Accueil
          </Link>

          <Link
            href="/equipe"
            style={{
              color: "white",
              fontWeight: 600,
            }}
          >
            Équipe
          </Link>

          {isConnected ? (
            <>
              <Link
                href="/profil"
                style={{
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Profil
              </Link>

              <Link
                href="/logout"
                style={{
                  color: "white",
                  fontWeight: 600,
                  padding: "9px 14px",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "9px",
                }}
              >
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Connexion
              </Link>

              <Link
                href="/register"
                style={{
                  background: "white",
                  color: "#4c1d95",
                  fontWeight: 700,
                  padding: "9px 14px",
                  borderRadius: "9px",
                }}
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}