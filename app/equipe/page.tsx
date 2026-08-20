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

type Race = {
  id: string;
  name: string;
  race_date: string;
  location: string | null;
  image_url: string | null;
};

type RaceOption = {
  id: string;
  race_id: string;
  name: string | null;
  distance: number;
  elevation: number;
};

type Attendance = {
  id: string;
  race_id: string;
  race_option_id: string | null;
  user_id: string;
  status: "participant" | "support";
};

type NextRace = {
  race: Race;
  option: RaceOption | null;
  daysUntil: number;
};

export default async function EquipePage() {
  const supabase = await createClient();

  /* ======================================================
     DATE DU JOUR - HEURE FRANÇAISE
  ====================================================== */

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  /* ======================================================
     PROFILS
  ====================================================== */

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

  /* ======================================================
     COURSES FUTURES
  ====================================================== */

  const { data: futureRacesData } = await supabase
    .from("races")
    .select(`
      id,
      name,
      race_date,
      location,
      image_url
    `)
    .gte("race_date", today)
    .order("race_date", { ascending: true });

  const futureRaces =
    (futureRacesData ?? []) as Race[];

  /* ======================================================
     FORMATS
  ====================================================== */

  const futureRaceIds =
    futureRaces.map((race) => race.id);

  let raceOptions: RaceOption[] = [];

  if (futureRaceIds.length > 0) {
    const { data: raceOptionsData } = await supabase
      .from("race_options")
      .select(`
        id,
        race_id,
        name,
        distance,
        elevation
      `)
      .in("race_id", futureRaceIds);

    raceOptions =
      (raceOptionsData ?? []) as RaceOption[];
  }

  /* ======================================================
     PARTICIPATIONS
  ====================================================== */

  let attendance: Attendance[] = [];

  if (futureRaceIds.length > 0) {
    const { data: attendanceData } = await supabase
      .from("race_attendance")
      .select(`
        id,
        race_id,
        race_option_id,
        user_id,
        status
      `)
      .eq("status", "participant")
      .in("race_id", futureRaceIds);

    attendance =
      (attendanceData ?? []) as Attendance[];
  }

  /* ======================================================
     CALCUL J-X
  ====================================================== */

  function getDaysUntil(raceDate: string) {
    const [raceYear, raceMonth, raceDay] =
      raceDate.split("-").map(Number);

    const [todayYear, todayMonth, todayDay] =
      today.split("-").map(Number);

    const raceTime = Date.UTC(
      raceYear,
      raceMonth - 1,
      raceDay
    );

    const todayTime = Date.UTC(
      todayYear,
      todayMonth - 1,
      todayDay
    );

    return Math.max(
      0,
      Math.round(
        (raceTime - todayTime) /
          (1000 * 60 * 60 * 24)
      )
    );
  }

  /* ======================================================
     PROCHAINE COURSE D'UN MEMBRE
  ====================================================== */

  function getNextRaceForMember(
    userId: string
  ): NextRace | null {
    const memberAttendance =
      attendance.filter(
        (item) =>
          item.user_id === userId &&
          item.status === "participant"
      );

    for (const race of futureRaces) {
      const participation =
        memberAttendance.find(
          (item) =>
            item.race_id === race.id
        );

      if (!participation) {
        continue;
      }

      const option =
        participation.race_option_id
          ? raceOptions.find(
              (raceOption) =>
                raceOption.id ===
                participation.race_option_id
            ) ?? null
          : null;

      return {
        race,
        option,
        daysUntil:
          getDaysUntil(race.race_date),
      };
    }

    return null;
  }

  /* ======================================================
     AFFICHAGE
  ====================================================== */

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
            const utmb = Array.isArray(
              profile.utmb_profiles
            )
              ? profile.utmb_profiles[0]
              : profile.utmb_profiles;

            const fullName =
              `${profile.first_name ?? ""} ${
                profile.last_name ?? ""
              }`.trim() || "Membre";

            const nextRace =
              getNextRaceForMember(profile.id);

            return (
              <Link
                key={profile.id}
                href={`/equipe/${profile.id}`}
                className="team-card-link"
              >
                <article className="card team-card">
                  <div className="team-card-line" />

                  {/* ==============================
                      MEMBRE + UTMB GENERAL
                  ============================== */}

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
                            {(
                              profile.first_name?.[0] ??
                              profile.nickname?.[0] ??
                              "?"
                            ).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="team-member-identity">
                        <h2>
                          {profile.first_name ??
                            "Prénom"}{" "}
                          {profile.last_name ??
                            "Nom"}
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
                        {utmb?.general_index ??
                          "-"}
                      </div>
                    </div>
                  </div>

                  {/* ==============================
                      BIO
                  ============================== */}

                  <div className="team-bio">
                    {profile.bio?.trim()
                      ? profile.bio
                      : "Bio à venir."}
                  </div>

                  {/* ==============================
                      INDEX UTMB
                  ============================== */}

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

                  {/* ==============================
                      PROCHAINE COURSE
                  ============================== */}

                  {nextRace && (
                    <div className="team-next-race">
                      <div className="team-next-race-logo">
                        {nextRace.race.image_url ? (
                          <img
                            src={
                              nextRace.race
                                .image_url
                            }
                            alt=""
                          />
                        ) : (
                          <span>🏔️</span>
                        )}
                      </div>

                      <div className="team-next-race-content">
                        <span className="team-next-race-label">
                          PROCHAINE COURSE
                        </span>

                        <strong className="team-next-race-name">
                          {
                            nextRace.race
                              .name
                          }
                        </strong>

                        <div className="team-next-race-details">
                          {nextRace.race
                            .location && (
                            <span>
                              📍{" "}
                              {
                                nextRace.race
                                  .location
                              }
                            </span>
                          )}

                          {nextRace.option && (
                            <>
                              <span>
                                {
                                  nextRace
                                    .option
                                    .distance
                                }{" "}
                                km
                              </span>

                              <span>
                                {
                                  nextRace
                                    .option
                                    .elevation
                                }{" "}
                                m+
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="team-next-race-countdown">
                        <small>
                          DÉPART
                        </small>

                        <strong>
                          J-
                          {
                            nextRace.daysUntil
                          }
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* ==============================
                      FOOTER
                  ============================== */}

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

/* ======================================================
   INDEX BOX
====================================================== */

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
          value
            ? "team-index-value-active"
            : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}