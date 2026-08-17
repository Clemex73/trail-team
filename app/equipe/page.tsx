import Image from "next/image";
import { createClient } from "@/utils/supabase/server";

const logoMap = {
  general: "/utmb/utmb-index.png",
  "20k": "/utmb/20k.png",
  "50k": "/utmb/50k.avif",
  "100k": "/utmb/100k.png",
  "100m": "/utmb/100m.png",
};

export default async function EquipePage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      nickname,
      utmb_profiles (
        general_index,
        index_20k,
        index_50k,
        index_100k,
        index_100m
      )
    `)
    .order("first_name", { ascending: true });

  if (error) {
    return (
      <main className="page-container">
        <div className="card">
          <h1>Équipe</h1>
          <p>Erreur : {error.message}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page-container">
      <div style={{ marginBottom: "32px" }}>
        <span className="purple-badge">TRAIL TEAM</span>

        <h1
          style={{
            marginTop: "12px",
            marginBottom: "8px",
          }}
        >
          Notre équipe
        </h1>

        <p
          className="text-muted"
          style={{ margin: 0 }}
        >
          Découvrez les membres et leurs UTMB Index.
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="card">
          <p>Aucun membre pour le moment.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {profiles.map((profile) => {
            const utmb = Array.isArray(profile.utmb_profiles)
              ? profile.utmb_profiles[0]
              : profile.utmb_profiles;

            return (
              <article
                key={profile.id}
                className="card"
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "5px",
                    background: "linear-gradient(90deg, #4c1d95, #8b5cf6)",
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "20px",
                    marginBottom: "24px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <h2 style={{ marginBottom: "5px" }}>
                      {profile.first_name ?? "Prénom"}{" "}
                      {profile.last_name ?? "Nom"}
                    </h2>

                    {profile.nickname && (
                      <p
                        className="text-muted"
                        style={{ margin: 0 }}
                      >
                        @{profile.nickname}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      minWidth: "130px",
                      textAlign: "center",
                      background: "linear-gradient(135deg, #4c1d95, #6d28d9)",
                      color: "white",
                      borderRadius: "14px",
                      padding: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <Image
                        src={logoMap.general}
                        alt="UTMB Index"
                        width={110}
                        height={34}
                        style={{
                          height: "auto",
                          objectFit: "contain",
                          borderRadius: "6px",
                          background: "white",
                          padding: "2px",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        fontSize: "1.8rem",
                        lineHeight: 1,
                        fontWeight: 800,
                      }}
                    >
                      {utmb?.general_index ?? "-"}
                    </div>
                  </div>
                </div>

                {utmb ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "10px",
                    }}
                  >
                    <IndexBox
                      logo={logoMap["20k"]}
                      alt="20K"
                      value={utmb.index_20k}
                    />
                    <IndexBox
                      logo={logoMap["50k"]}
                      alt="50K"
                      value={utmb.index_50k}
                    />
                    <IndexBox
                      logo={logoMap["100k"]}
                      alt="100K"
                      value={utmb.index_100k}
                    />
                    <IndexBox
                      logo={logoMap["100m"]}
                      alt="100M"
                      value={utmb.index_100m}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#f8f7fc",
                      borderRadius: "10px",
                      padding: "14px",
                    }}
                  >
                    <p
                      className="text-muted"
                      style={{ margin: 0 }}
                    >
                      Aucun score UTMB renseigné.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

function IndexBox({
  logo,
  alt,
  value,
}: {
  logo: string;
  alt: string;
  value: number | null;
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "14px 8px",
        background: "#f8f7fc",
        border: "1px solid #e7e3ee",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "10px",
        }}
      >
        <Image
          src={logo}
          alt={alt}
          width={90}
          height={28}
          style={{
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      <div
        style={{
          color: value ? "#4c1d95" : "#9b96a3",
          fontSize: "1.15rem",
          fontWeight: 800,
        }}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}