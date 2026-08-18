import Image from "next/image";
import Link from "next/link";
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
      avatar_url,
      bio,
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
    <main className="page-container team-page">
      <div className="team-heading">
        <span className="purple-badge">
          TRAIL TEAM
        </span>

        <h1>Notre équipe</h1>

        <p className="text-muted">
          Découvrez les membres, leurs profils et leurs UTMB Index.
        </p>
      </div>

      {profiles.length === 0 ? (
        <div className="card">
          <p>Aucun membre pour le moment.</p>
        </div>
      ) : (
        <div className="team-grid">
          {profiles.map((profile) => {
            const utmb = Array.isArray(profile.utmb_profiles)
              ? profile.utmb_profiles[0]
              : profile.utmb_profiles;

            const fullName =
              `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
              "Membre";

            return (
              <Link
                key={profile.id}
                href={`/equipe/${profile.id}`}
                className="team-card-link"
              >
                <article className="card team-card">
                  <div className="team-card-line" />

                  <div className="team-card-top">
                    <div className="team-member-main">
                      <div className="team-avatar">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={fullName}
                          />
                        ) : (
                          <span>
                            {(profile.first_name?.[0] ??
                              profile.nickname?.[0] ??
                              "?").toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="team-member-identity">
                        <h2>
                          {profile.first_name ?? "Prénom"}{" "}
                          {profile.last_name ?? "Nom"}
                        </h2>

                        {profile.nickname && (
                          <p className="text-muted">
                            @{profile.nickname}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="team-utmb-general">
                      <div className="team-utmb-general-logo">
                        <Image
                          src={logoMap.general}
                          alt="UTMB Index"
                          width={110}
                          height={34}
                        />
                      </div>

                      <div className="team-utmb-general-score">
                        {utmb?.general_index ?? "-"}
                      </div>
                    </div>
                  </div>

                  <div className="team-bio">
                    {profile.bio?.trim()
                      ? profile.bio
                      : "Bio à venir."}
                  </div>

                  {utmb ? (
                    <div className="team-index-grid">
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
                    <div className="team-no-utmb">
                      <p className="text-muted">
                        Aucun score UTMB renseigné.
                      </p>
                    </div>
                  )}

                  <div className="team-card-footer">
                    Voir le profil →
                  </div>
                </article>
              </Link>
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
    <div className="team-index-box">
      <div className="team-index-logo">
        <Image
          src={logo}
          alt={alt}
          width={90}
          height={28}
        />
      </div>

      <div
        className={`team-index-value ${
          value ? "team-index-value-active" : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}