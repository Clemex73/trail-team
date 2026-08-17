import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-page">
      {/* HERO */}
      <section className="editorial-hero">
        <div className="editorial-hero-inner">
          {/* Logo */}
          <div className="editorial-logo-column">
            <Image
              src="/logo-maurienne.png"
              alt="Maurienne Trail Team"
              width={260}
              height={260}
              priority
              className="editorial-logo"
            />
          </div>

          <div className="editorial-divider" />

          {/* Contenu principal */}
          <div className="editorial-main">
            <p className="editorial-kicker">
              MAURIENNE TRAIL TEAM
            </p>

            <h1 className="editorial-title">
              MAURIENNE
              <span>TRAIL TEAM</span>
            </h1>

            <div className="editorial-line">
              <span />
              <div className="editorial-mini-mountain">
                ▲▲▲
              </div>
              <span />
            </div>

            <p className="editorial-subtitle">
              COURIR PLUS HAUT · COURIR ENSEMBLE
            </p>

            <div className="editorial-features">
              <Feature
                icon="△"
                title="MONTAGNE"
                text="Notre terrain de jeu"
              />

              <Feature
                icon="↗"
                title="PERFORMANCE"
                text="Progresser ensemble"
              />

              <Feature
                icon="◌"
                title="ENDURANCE"
                text="Du trail à l'ultra"
              />

              <Feature
                icon="✦"
                title="ESPRIT TEAM"
                text="Partager l'aventure"
              />
            </div>

            <div className="editorial-buttons">
              <Link
                href="/equipe"
                className="editorial-button-primary"
              >
                Découvrir l&apos;équipe
              </Link>

              <Link
                href="/register"
                className="editorial-button-secondary"
              >
                Rejoindre le team
              </Link>
            </div>
          </div>

          {/* Montagne */}
          <div className="editorial-mountain-column">
            <Image
              src="/aiguilles-arves2.png"
              alt="Aiguilles d'Arves"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="editorial-mountain-image"
            />

            <div className="editorial-mountain-fade" />

            <div className="editorial-mountain-text">
              <span>BORN IN THE MOUNTAINS</span>
              <strong>BUILT FOR THE TRAIL</strong>
            </div>
          </div>
        </div>
      </section>

      {/* IDENTITÉ */}
      <section className="page-container editorial-section">
        <div className="editorial-section-heading">
          <p>NOTRE IDENTITÉ</p>

          <h2>
            Une équipe née
            <br />
            au cœur de la Maurienne.
          </h2>

          <div className="editorial-heading-line" />
        </div>

        <div className="editorial-cards">
          <EditorialCard
            number="01"
            title="LE TEAM"
            text="Découvrez les coureurs du Maurienne Trail Team, leurs profils et leurs objectifs."
            href="/equipe"
          />

          <EditorialCard
            number="02"
            title="UTMB INDEX"
            text="Suivez les performances et les différents UTMB Index des membres de l'équipe."
            href="/equipe"
          />

          <EditorialCard
            number="03"
            title="NOS DÉFIS"
            text="Courses, kilomètres, dénivelé et aventures : les prochains objectifs du team."
            href="/equipe"
          />
        </div>
      </section>

      {/* TERRITOIRE */}
      <section className="editorial-territory">
        <div className="editorial-territory-image">
          <Image
            src="/aiguilles-arves2.png"
            alt="Aiguilles d'Arves"
            fill
            sizes="100vw"
          />
        </div>

        <div className="editorial-territory-overlay" />

        <div className="editorial-territory-content">
          <p>NOTRE TERRITOIRE</p>

          <h2>
            LES AIGUILLES D&apos;ARVES
          </h2>

          <span>
            Un terrain exigeant, vertical et spectaculaire.
          </span>
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="editorial-feature">
      <div className="editorial-feature-icon">
        {icon}
      </div>

      <div>
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </div>
  );
}

function EditorialCard({
  number,
  title,
  text,
  href,
}: {
  number: string;
  title: string;
  text: string;
  href: string;
}) {
  return (
    <article className="editorial-card">
      <div className="editorial-card-top">
        <span>{number}</span>
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <Link href={href}>
        Découvrir →
      </Link>
    </article>
  );
}