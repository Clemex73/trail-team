import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-container">
      <section
        style={{
          minHeight: "72vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 0",
        }}
      >
        <div
          style={{
            maxWidth: "760px",
          }}
        >
          <Image
            src="/logo-maurienne.png"
            alt="Logo Maurienne Trail Team"
            width={420}
            height={420}
            priority
            style={{
              width: "100%",
              maxWidth: "380px",
              height: "auto",
              margin: "0 auto 28px",
            }}
          />

          <span className="purple-badge">
            MAURIENNE TRAIL TEAM
          </span>

          <h1
            style={{
              marginTop: "18px",
              marginBottom: "14px",
              fontSize: "clamp(2.2rem, 6vw, 4rem)",
              lineHeight: 1,
            }}
          >
            Courir plus haut.
            <br />
            Courir ensemble.
          </h1>

          <p
            className="text-muted"
            style={{
              maxWidth: "620px",
              margin: "0 auto 30px",
              fontSize: "1.1rem",
              lineHeight: 1.7,
            }}
          >
            Une équipe de trail au cœur de la Maurienne, réunie par la montagne,
            le dépassement de soi et le plaisir de partager les sentiers.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "14px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/equipe"
              style={{
                display: "inline-block",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "#6d28d9",
                color: "white",
                fontWeight: 700,
              }}
            >
              Découvrir l’équipe
            </Link>

            <Link
              href="/register"
              style={{
                display: "inline-block",
                padding: "12px 20px",
                borderRadius: "10px",
                background: "white",
                color: "#4c1d95",
                border: "1px solid #d8d1e5",
                fontWeight: 700,
              }}
            >
              Rejoindre l’équipe
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}