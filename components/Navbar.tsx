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
    <header className="site-navbar">
      {/* Photo Aiguilles */}
      <div className="navbar-mountain-image">
        <Image
          src="/aiguilles-arves2.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
      </div>

      {/* Voile violet */}
      <div className="navbar-overlay" />

      {/* Lumière */}
      <div className="navbar-light" />

      <div className="navbar-inner">
        {/* Identité */}
        <Link href="/" className="navbar-brand">
          <div className="navbar-logo">
            <Image
              src="/logo-maurienne2.png"
              alt="Maurienne Trail Team"
              width={62}
              height={62}
              priority
            />
          </div>

          <div className="navbar-brand-text">
            <div className="navbar-title">
              MAURIENNE TRAIL TEAM
            </div>

            <div className="navbar-subtitle">
              Esprit trail · Force montagne
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="navbar-nav">
          <NavLink href="/">Accueil</NavLink>
          <NavLink href="/equipe">Équipe</NavLink>

          {isConnected ? (
            <>
              <NavLink href="/profil">Profil</NavLink>

              <Link href="/logout" className="navbar-action">
                Déconnexion
              </Link>
            </>
          ) : (
            <>
              <NavLink href="/login">Connexion</NavLink>

              <Link href="/register" className="navbar-register">
                Inscription
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="navbar-bottom-line" />
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
    <Link href={href} className="navbar-link">
      {children}
    </Link>
  );
}