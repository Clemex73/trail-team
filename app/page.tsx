import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      {/* HERO */}
      <section className="home-hero">
        <div className="home-hero-image">
          <Image
            src="/aiguilles-arves2.png"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>

        <div className="home-hero-overlay" />
        <div className="home-hero-light" />

        <div className="home-hero-content">
          {/* Texte */}
          <div className="home-hero-left">
            <div className="home-hero-badges">
              <HeroBadge>TRAIL</HeroBadge>
              <HeroBadge>MAURIENNE</HeroBadge>
              <HeroBadge>MONTAGNE</HeroBadge>
            </div>

            <p className="home-eyebrow">
              Maurienne Trail Team
            </p>

            <h1 className="home-title">
              PLUS HAUT.
              <br />

              <span>ENSEMBLE.</span>
            </h1>

            <p className="home-hero-text">
              Une équipe réunie par les sentiers, les sommets et le goût de
              l&apos;effort. Du kilomètre vertical à l&apos;ultra-trail, nous
              partageons la même passion : avancer en montagne.
            </p>

            <div className="home-hero-buttons">
              <Link
                href="/equipe"
                className="home-button home-button-primary"
              >
                Découvrir l&apos;équipe →
              </Link>

              <Link
                href="/register"
                className="home-button home-button-secondary"
              >
                Rejoindre le team
              </Link>
            </div>
          </div>

          {/* Logo */}
          <div className="home-hero-logo-area">
            <div className="home-logo-glow" />

            <div className="home-hero-logo">
              <Image
                src="/logo-maurienne2.png"
                alt="Logo Maurienne Trail Team"
                fill
                priority
                sizes="400px"
              />
            </div>
          </div>
        </div>

        <div className="home-hero-bottom-fade" />
      </section>

      {/* INTRO */}
      <section className="page-container home-intro">
        <div className="home-intro-heading">
          <span className="purple-badge">
            L&apos;ESPRIT DU TEAM
          </span>

          <h2>
            La montagne comme terrain de jeu.
          </h2>

          <p className="text-muted">
            En Maurienne, chaque sortie commence au fond de la vallée et peut
            finir bien plus haut. Le team rassemble des coureurs qui veulent
            progresser, partager et vivre pleinement le trail.
          </p>
        </div>

        <div className="home-cards">
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
            text="Suivez les UTMB Index des coureurs du team, mis à jour automatiquement."
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

      {/* MONTAGNE */}
      <section className="mountain-section">
        <Image
          src="/aiguilles-arves2.png"
          alt="Aiguilles d'Arves"
          fill
          sizes="1200px"
          className="mountain-section-image"
        />

        <div className="mountain-section-overlay" />

        <div className="mountain-section-content">
          <p className="mountain-eyebrow">
            Notre territoire
          </p>

          <h2>
            Les Aiguilles d&apos;Arves.
            <br />
            Notre horizon.
          </h2>

          <p>
            Un décor exigeant et spectaculaire qui incarne parfaitement notre
            façon de courir : libre, engagée et profondément montagnarde.
          </p>
        </div>
      </section>
    </main>
  );
}

function HeroBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="hero-badge">{children}</span>;
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
    <article className="home-card">
      <div className="home-card-line" />

      <div className="home-card-number">
        {number}
      </div>

      <h3>{title}</h3>

      <p className="text-muted">
        {text}
      </p>

      <Link href={href}>
        {action} →
      </Link>
    </article>
  );
}