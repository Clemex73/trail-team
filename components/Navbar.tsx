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
        position: "relative",
        overflow: "hidden",
        minHeight: "112px",
        background:
        "linear-gradient(90deg, rgba(28, 10, 65, 0.88) 0%, rgba(76, 29, 149, 0.68) 45%, rgba(109, 40, 217, 0.68) 70%, rgba(124, 58, 237, 0.86) 100%)",
        boxShadow: "0 8px 30px rgba(53, 24, 110, 0.22)",
      }}
    >
      {/* Photo réelle des Aiguilles d'Arves */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
      <Image
        src="/aiguilles-arves2.png"
        alt=""
        fill
        priority
        sizes="100vw"
        style={{
            objectFit: "contain",
            objectPosition: "center bottom",
            transform: "scale(1.5)",
            opacity: 0.18,
            filter:
            "grayscale(100%) contrast(115%) brightness(105%) sepia(20%) hue-rotate(225deg) saturate(180%)",
        }}
        />
      </div>

      {/* Voile violet pour bien intégrer la photo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
          "linear-gradient(90deg, rgba(28, 10, 65, 0.90) 0%, rgba(76, 29, 149, 0.72) 28%, rgba(124, 58, 237, 0.46) 50%, rgba(76, 29, 149, 0.72) 72%, rgba(28, 10, 65, 0.90) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Légère lumière centrale */}
      <div
        style={{
          position: "absolute",
          top: "-90px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "220px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          filter: "blur(55px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1380px",
          minHeight: "112px",
          margin: "0 auto",
          padding: "15px 30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "36px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Identité */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            color: "white",
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              flexShrink: 0,
              borderRadius: "50%",
              padding: "5px",
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(255,255,255,0.65)",
              boxShadow:
                "0 7px 24px rgba(10,0,30,0.3), 0 0 0 4px rgba(255,255,255,0.06)",
            }}
          >
            <Image
              src="/logo-maurienne2.png"
              alt="Maurienne Trail Team"
              width={62}
              height={62}
              priority
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </div>

          <div
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.24)",
              paddingLeft: "18px",
            }}
          >
            <div
              style={{
                fontSize: "1.48rem",
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: "0.015em",
                textShadow: "0 2px 8px rgba(0,0,0,0.18)",
              }}
            >
              MAURIENNE TRAIL TEAM
            </div>

            <div
              style={{
                marginTop: "10px",
                fontSize: "0.7rem",
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: "0.26em",
                color: "rgba(255,255,255,0.74)",
                textTransform: "uppercase",
              }}
            >
              Esprit montagne
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flexWrap: "wrap",
          }}
        >
          <NavLink href="/">Accueil</NavLink>
          <NavLink href="/equipe">Équipe</NavLink>

          {isConnected ? (
            <>
              <NavLink href="/profil">Profil</NavLink>

              <Link
                href="/logout"
                style={{
                  marginLeft: "8px",
                  color: "white",
                  fontWeight: 750,
                  padding: "12px 18px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.38)",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.055))",
                  backdropFilter: "blur(10px)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.1), 0 5px 16px rgba(18,5,45,0.16)",
                }}
              >
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <NavLink href="/login">Connexion</NavLink>

              <Link
                href="/register"
                style={{
                  marginLeft: "8px",
                  color: "#4c1d95",
                  fontWeight: 800,
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.96)",
                  boxShadow: "0 6px 20px rgba(15,0,40,0.18)",
                }}
              >
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>

      {/* Ligne inférieure */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          height: "2px",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(196,181,253,0.5) 25%, rgba(255,255,255,0.8) 50%, rgba(196,181,253,0.5) 75%, transparent 100%)",
        }}
      />
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        color: "rgba(255,255,255,0.94)",
        fontWeight: 700,
        padding: "11px 14px",
        borderRadius: "10px",
      }}
    >
      {children}
    </Link>
  );
}