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
      {/* ==================================================
          PHOTO AIGUILLES
      ================================================== */}
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
        {/* ==================================================
            IDENTITE
        ================================================== */}
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

        {/* ==================================================
            NAVIGATION
        ================================================== */}
        <nav className="navbar-nav">
          <NavLink
            href="/"
            icon="/nav-home.png"
            label="Accueil"
          />

          <NavLink
            href="/equipe"
            icon="/nav-team.png"
            label="Équipe"
          />

          <NavLink
            href="/courses"
            icon="/nav-courses.png"
            label="Courses"
          />

          {/* ==================================================
              MTT CARDS
          ================================================== */}
          <NavLink
            href="/cartes"
            icon="/nav-cards.png"
            label="Cartes"
          />

          {isConnected ? (
            <>
              <NavLink
                href="/profil"
                icon="/nav-profile.png"
                label="Profil"
              />

              <Link
                href="/logout"
                className="navbar-action navbar-link-with-icon"
              >
                <Image
                  src="/nav-logout.png"
                  alt=""
                  width={22}
                  height={22}
                  className="navbar-menu-icon"
                />

                <span>
                  Déconnexion
                </span>
              </Link>
            </>
          ) : (
            <>
              <NavLink
                href="/login"
                icon="/nav-login.png"
                label="Connexion"
              />

              <Link
                href="/register"
                className="navbar-register navbar-link-with-icon"
              >
                <Image
                  src="/nav-register.png"
                  alt=""
                  width={22}
                  height={22}
                  className="navbar-menu-icon"
                />

                <span>
                  Inscription
                </span>
              </Link>
            </>
          )}
        </nav>
      </div>

      <div className="navbar-bottom-line" />
    </header>
  );
}

/* ==========================================================
   LIEN NAVIGATION
========================================================== */

function NavLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="navbar-link navbar-link-with-icon"
    >
      <Image
        src={icon}
        alt=""
        width={22}
        height={22}
        className="navbar-menu-icon"
      />

      <span>
        {label}
      </span>
    </Link>
  );
}