import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        width: "100%",
        overflow: "hidden",
      }}
    >
      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        style={{
          position: "relative",
          minHeight: "760px",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          background:
            "linear-gradient(90deg, #1d0b42 0%, #4c1d95 28%, #7c3aed 52%, #4c1d95 75%, #1d0b42 100%)",
        }}
      >
        {/* Montagnes */}
        <div
          style={{
            position: "absolute",
            inset: 0,
          }}
        >
          <Image
            src="/aiguilles-arves2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: "center center",
              opacity: 0.27,
              filter:
                "grayscale(100%) contrast(120%) brightness(90%) sepia(15%) hue-rotate(225deg) saturate(180%)",
            }}
          />
        </div>

        {/* Voile sombre */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(20,6,50,0.94) 0%, rgba(54,20,110,0.72) 35%, rgba(91,33,182,0.55) 52%, rgba(54,20,110,0.72) 72%, rgba(20,6,50,0.94) 100%)",
          }}
        />

        {/* Lumière centrale */}
        <div
          style={{
            position: "absolute",
            width: "850px",
            height: "850px",
            top: "-300px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background: "rgba(167,139,250,0.14)",
            filter: "blur(100px)",
          }}
        />

        {/* Lignes décoratives */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.11,
            backgroundImage:
              "repeating-radial-gradient(circle at 10% 50%, transparent 0, transparent 22px, rgba(255,255,255,0.3) 23px, transparent 24px)",
          }}
        />

        {/* Contenu */}
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "90px 32px",
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            alignItems: "center",
            gap: "60px",
          }}
        >
          {/* Texte gauche */}
          <div>
            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginBottom: "24px",
              }}
            >
              <HeroBadge>TRAIL</HeroBadge>
              <HeroBadge>MAURIENNE</HeroBadge>
              <HeroBadge>MONTAGNE</HeroBadge>
            </div>

            <p
              style={{
                color: "#c4b5fd",
                fontSize: "0.8rem",
                fontWeight: 800,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                marginBottom: "18px",
              }}
            >
              Maurienne Trail Team
            </p>

            <h1
              style={{
                color: "white",
                fontSize: "clamp(3.4rem, 7vw, 6.8rem)",
                lineHeight: 0.9,
                letterSpacing: "-0.055em",
                fontWeight: 950,
                margin: 0,
                maxWidth: "850px",
                textShadow: "0 10px 40px rgba(0,0,0,0.28)",
              }}
            >
              PLUS HAUT.
              <br />

              <span
                style={{
                  color: "#c4b5fd",
                }}
              >
                ENSEMBLE.
              </span>
            </h1>

            <p
              style={{
                marginTop: "30px",
                maxWidth: "650px",
                color: "rgba(255,255,255,0.76)",
                fontSize: "1.15rem",
                lineHeight: 1.75,
              }}
            >
              Une équipe réunie par les sentiers, les sommets et le goût de
              l&apos;effort. Du kilomètre vertical à l&apos;ultra-trail, nous
              partageons la même passion : avancer en montagne.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "36px",
              }}
            >
              <Link
                href="/equipe"
                style={{
                  padding: "15px 24px",
                  background: "white",
                  color: "#4c1d95",
                  borderRadius: "13px",
                  fontWeight: 850,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                }}
              >
                Découvrir l&apos;équipe →
              </Link>

              <Link
                href="/register"
                style={{
                  padding: "15px 24px",
                  color: "white",
                  borderRadius: "13px",
                  fontWeight: 750,
                  border: "1px solid rgba(255,255,255,0.32)",
                  background: "rgba(255,255,255,0.08)",
                  backdropFilter: "blur(12px)",
                }}
              >
                Rejoindre le team
              </Link>
            </div>
          </div>

          {/* Logo droit */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "430px",
                height: "430px",
                borderRadius: "50%",
                background: "rgba(139,92,246,0.15)",
                filter: "blur(50px)",
              }}
            />

            <div
              style={{
                position: "relative",
                width: "390px",
                maxWidth: "80vw",
                aspectRatio: "1",
                borderRadius: "50%",
                padding: "18px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow:
                  "0 30px 80px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Image
                src="/logo-maurienne2.png"
                alt="Logo Maurienne Trail Team"
                fill
                priority
                style={{
                  objectFit: "contain",
                  padding: "20px",
                }}
              />
            </div>
          </div>
        </div>

        {/* Dégradé bas */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "130px",
            background:
              "linear-gradient(to bottom, transparent, rgba(248,247,252,1))",
          }}
        />
      </section>

      {/* ======================================================
          INTRO
      ====================================================== */}

      <section
        className="page-container"
        style={{
          paddingTop: "70px",
          paddingBottom: "70px",
        }}
      >
        <div
          style={{
            maxWidth: "850px",
            marginBottom: "44px",
          }}
        >
          <span className="purple-badge">L&apos;ESPRIT DU TEAM</span>

          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              lineHeight: 1.05,
              marginTop: "18px",
              marginBottom: "18px",
              color: "#24104f",
            }}
          >
            La montagne comme terrain de jeu.
          </h2>

          <p
            className="text-muted"
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.75,
              maxWidth: "720px",
            }}
          >
            En Maurienne, chaque sortie commence au fond de la vallée et peut
            finir bien plus haut. Le team rassemble des coureurs qui veulent
            progresser, partager et vivre pleinement le trail.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          <HomeCard
            number="01"
            title="Le Team"
            text="Découvrez les membres de Maurienne Trail Team et leurs profils."
            href="/equipe"
            action="Voir l'équipe"
          />

          <HomeCard
            number="02"
            title="UTMB Index"
            text="Suivez les différents UTMB Index des coureurs du team, mis à jour automatiquement."
            href="/equipe"
            action="Voir les index"
          />

          <HomeCard
            number="03"
            title="Les défis"
            text="Courses, objectifs, kilomètres et dénivelé : les prochains défis du team arrivent bientôt."
            href="/equipe"
            action="Découvrir"
          />
        </div>
      </section>

      {/* ======================================================
          BANDE MONTAGNE
      ====================================================== */}

      <section
        style={{
          position: "relative",
          maxWidth: "1200px",
          minHeight: "320px",
          margin: "20px auto 90px",
          borderRadius: "26px",
          overflow: "hidden",
          boxShadow: "0 20px 55px rgba(45,20,85,0.14)",
        }}
      >
        <Image
          src="/aiguilles-arves2.png"
          alt="Aiguilles d'Arves"
          fill
          sizes="1200px"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            filter: "grayscale(100%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(30,10,67,0.96), rgba(76,29,149,0.72), rgba(76,29,149,0.28))",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            minHeight: "320px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "50px",
            maxWidth: "650px",
          }}
        >
          <p
            style={{
              color: "#c4b5fd",
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            Notre territoire
          </p>

          <h2
            style={{
              color: "white",
              fontSize: "clamp(2rem, 4vw, 3.4rem)",
              lineHeight: 1,
              margin: "12px 0 18px",
            }}
          >
            Les Aiguilles d&apos;Arves.
            <br />
            Notre horizon.
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.76)",
              lineHeight: 1.7,
              fontSize: "1.05rem",
            }}
          >
            Un décor exigeant et spectaculaire qui incarne parfaitement notre
            façon de courir : libre, engagée et profondément montagnarde.
          </p>
        </div>
      </section>
    </main>
  );
}

function HeroBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "7px 11px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.07)",
        color: "rgba(255,255,255,0.8)",
        borderRadius: "999px",
        fontSize: "0.68rem",
        fontWeight: 800,
        letterSpacing: "0.12em",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </span>
  );
}

function HomeCard({
  number,
  title,
  text,
  href,
  action,
}: {
  number: string;
  title: string;
  text: string;
  href: string;
  action: string;
}) {
  return (
    <article
      style={{
        position: "relative",
        minHeight: "280px",
        padding: "28px",
        borderRadius: "20px",
        background: "white",
        border: "1px solid #e7e3ee",
        boxShadow: "0 12px 35px rgba(40,20,75,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "4px",
          background:
            "linear-gradient(90deg, #24104f, #6d28d9, #a78bfa)",
        }}
      />

      <div
        style={{
          color: "#ddd6fe",
          fontSize: "3.4rem",
          lineHeight: 1,
          fontWeight: 950,
          marginBottom: "28px",
        }}
      >
        {number}
      </div>

      <h3
        style={{
          fontSize: "1.45rem",
          marginBottom: "10px",
          color: "#24104f",
        }}
      >
        {title}
      </h3>

      <p
        className="text-muted"
        style={{
          lineHeight: 1.65,
          marginBottom: "25px",
        }}
      >
        {text}
      </p>

      <Link
        href={href}
        style={{
          color: "#6d28d9",
          fontWeight: 800,
        }}
      >
        {action} →
      </Link>
    </article>
  );
}