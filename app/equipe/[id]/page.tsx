import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const logoMap = {
  general: "/utmb/utmb-index.png",
  "20k": "/utmb/20k.png",
  "50k": "/utmb/50k.avif",
  "100k": "/utmb/100k.png",
  "100m": "/utmb/100m.png",
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MemberProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  /* ======================================================
     PROFIL
  ====================================================== */

  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(`
      id,
      first_name,
      last_name,
      nickname,
      avatar_url,
      bio,
      goals
    `)
    .eq("id", id)
    .maybeSingle();

  if (
    profileError ||
    !profile
  ) {
    notFound();
  }

  /* ======================================================
     UTMB
  ====================================================== */

  const {
    data: utmb,
  } = await supabase
    .from("utmb_profiles")
    .select(`
      general_index,
      index_20k,
      index_50k,
      index_100k,
      index_100m
    `)
    .eq("user_id", id)
    .maybeSingle();

  /* ======================================================
     PARTICIPATIONS COURSES
  ====================================================== */

  const {
    data: raceAttendance,
  } = await supabase
    .from("race_attendance")
    .select(`
      id,
      race_id,
      race_option_id,
      status,
      races (
        id,
        name,
        location,
        race_date,
        image_url
      ),
      race_options (
        id,
        name,
        distance,
        elevation
      )
    `)
    .eq("user_id", id);

  /* ======================================================
     SORTIES CRÉÉES
  ====================================================== */

  const {
    data: organizedTrainings,
  } = await supabase
    .from("trainings")
    .select(`
      id,
      title,
      location,
      duration_minutes,
      training_date,
      expected_level
    `)
    .eq("created_by", id)
    .order("training_date", {
      ascending: true,
    });

  /* ======================================================
     PARTICIPATIONS SORTIES
  ====================================================== */

  const {
    data: trainingAttendance,
  } = await supabase
    .from("training_attendance")
    .select(`
      id,
      training_id,
      trainings (
        id,
        title,
        location,
        duration_minutes,
        training_date,
        expected_level
      )
    `)
    .eq("user_id", id);

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const upcomingRaceParticipations =
    (raceAttendance ?? [])
      .filter(
        (item: any) =>
          item.status === "participant" &&
          item.races?.race_date >= today
      );

  const upcomingRaceSupports =
    (raceAttendance ?? [])
      .filter(
        (item: any) =>
          item.status === "support" &&
          item.races?.race_date >= today
      );

  const upcomingOrganizedTrainings =
    (organizedTrainings ?? [])
      .filter(
        (training: any) =>
          training.training_date >= today
      );

  const upcomingJoinedTrainings =
    (trainingAttendance ?? [])
      .filter(
        (item: any) =>
          item.trainings?.training_date >= today
      );

  const fullName =
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
    profile.nickname ||
    "Membre";

  return (
    <main className="page-container member-profile-page">
      <Link
        href="/equipe"
        className="event-back"
      >
        ← Retour à l&apos;équipe
      </Link>

      {/* ==================================================
          EN-TÊTE PROFIL
      ================================================== */}

      <section className="member-profile-header card">
        <div className="member-profile-main">
          <div className="member-profile-avatar">
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

          <div className="member-profile-identity">
            <span>
              MEMBRE DU TEAM
            </span>

            <h1>
              {fullName}
            </h1>

            {profile.nickname && (
              <p>
                @{profile.nickname}
              </p>
            )}

            <div className="member-profile-bio">
              <h3>
                BIO
              </h3>

              <p>
                {profile.bio?.trim()
                  ? profile.bio
                  : "Aucune bio renseignée pour le moment."}
              </p>
            </div>

            <div className="member-profile-goals">
              <h3>
                OBJECTIFS
              </h3>

              <p>
                {profile.goals?.trim()
                  ? profile.goals
                  : "Aucun objectif renseigné pour le moment."}
              </p>
            </div>
          </div>
        </div>

        {/* UTMB */}

        <div className="member-profile-utmb">
          <div className="member-utmb-general">
            <div>
              <Image
                src={logoMap.general}
                alt="UTMB Index"
                width={120}
                height={38}
              />
            </div>

            <strong>
              {utmb?.general_index ?? "-"}
            </strong>
          </div>

          <div className="member-utmb-grid">
            <MemberIndexBox
              logo={logoMap["20k"]}
              alt="20K"
              value={utmb?.index_20k ?? null}
            />

            <MemberIndexBox
              logo={logoMap["50k"]}
              alt="50K"
              value={utmb?.index_50k ?? null}
            />

            <MemberIndexBox
              logo={logoMap["100k"]}
              alt="100K"
              value={utmb?.index_100k ?? null}
            />

            <MemberIndexBox
              logo={logoMap["100m"]}
              alt="100M"
              value={utmb?.index_100m ?? null}
            />
          </div>
        </div>
      </section>

      {/* ==================================================
          STATS
      ================================================== */}

      <section className="member-profile-stats">
        <div>
          <strong>
            {upcomingRaceParticipations.length}
          </strong>

          <span>
            COURSES
          </span>
        </div>

        <div>
          <strong>
            {upcomingRaceSupports.length}
          </strong>

          <span>
            SUPPORTS
          </span>
        </div>

        <div>
          <strong>
            {upcomingOrganizedTrainings.length}
          </strong>

          <span>
            SORTIES ORGANISÉES
          </span>
        </div>

        <div>
          <strong>
            {upcomingJoinedTrainings.length}
          </strong>

          <span>
            SORTIES REJOINTES
          </span>
        </div>
      </section>

      {/* ==================================================
          COURSES
      ================================================== */}

      <section className="member-profile-section">
        <div className="courses-section-title">
          <div>
            <span>
              PROCHAINS DÉFIS
            </span>

            <h2>
              Ses courses
            </h2>
          </div>
        </div>

        <div className="member-event-grid">
          {upcomingRaceParticipations.length === 0 ? (
            <EmptyBlock text="Aucune course prévue pour le moment." />
          ) : (
            upcomingRaceParticipations.map(
              (item: any) => {
                const race =
                  item.races;

                const option =
                  item.race_options;

                return (
                  <Link
                    key={item.id}
                    href={`/courses/course/${race.id}`}
                    className="member-event-card member-race-event"
                  >
                    {race.image_url && (
                      <div className="member-event-logo">
                        <img
                          src={race.image_url}
                          alt=""
                        />
                      </div>
                    )}

                    <div>
                      <span>
                        🏃 PARTICIPE
                      </span>

                      <h3>
                        {race.name}
                      </h3>

                      {race.location && (
                        <p>
                          📍 {race.location}
                        </p>
                      )}

                      {option && (
                        <div className="member-race-option">
                          {option.name && (
                            <strong>
                              {option.name}
                            </strong>
                          )}

                          <small>
                            {option.distance} km ·{" "}
                            {option.elevation} m+
                          </small>
                        </div>
                      )}

                      <time>
                        {formatDate(
                          race.race_date
                        )}
                      </time>
                    </div>
                  </Link>
                );
              }
            )
          )}
        </div>
      </section>

      {/* ==================================================
          SUPPORTS
      ================================================== */}

      <section className="member-profile-section">
        <div className="courses-section-title">
          <div>
            <span>
              SUPPORT
            </span>

            <h2>
              Les courses qu&apos;il soutient
            </h2>
          </div>
        </div>

        <div className="member-event-grid">
          {upcomingRaceSupports.length === 0 ? (
            <EmptyBlock text="Aucune course supportée pour le moment." />
          ) : (
            upcomingRaceSupports.map(
              (item: any) => (
                <Link
                  key={item.id}
                  href={`/courses/course/${item.races.id}`}
                  className="member-event-card"
                >
                  <span>
                    📣 SUPPORTER
                  </span>

                  <h3>
                    {item.races.name}
                  </h3>

                  {item.races.location && (
                    <p>
                      📍{" "}
                      {item.races.location}
                    </p>
                  )}

                  <time>
                    {formatDate(
                      item.races.race_date
                    )}
                  </time>
                </Link>
              )
            )
          )}
        </div>
      </section>

      {/* ==================================================
          ENTRAINEMENTS
      ================================================== */}

      <section className="member-profile-section">
        <div className="courses-section-title">
          <div>
            <span>
              ENTRAÎNEMENTS
            </span>

            <h2>
              Ses prochaines sorties
            </h2>
          </div>
        </div>

        <div className="member-training-columns">
          <div>
            <h3 className="member-column-title">
              Organisées par {profile.nickname || profile.first_name}
            </h3>

            <div className="member-event-grid">
              {upcomingOrganizedTrainings.length === 0 ? (
                <EmptyBlock text="Aucune sortie organisée." />
              ) : (
                upcomingOrganizedTrainings.map(
                  (training: any) => (
                    <Link
                      key={training.id}
                      href={`/courses/training/${training.id}`}
                      className="member-event-card member-training-event"
                    >
                      <span>
                        ORGANISATEUR
                      </span>

                      <h3>
                        {training.title}
                      </h3>

                      <p>
                        📍 {training.location}
                      </p>

                      <div className="member-training-meta">
                        <small>
                          ⏱{" "}
                          {training.duration_minutes} min
                        </small>

                        <small>
                          NIV.{" "}
                          {training.expected_level ?? "—"}
                        </small>
                      </div>

                      <time>
                        {formatDate(
                          training.training_date
                        )}
                      </time>
                    </Link>
                  )
                )
              )}
            </div>
          </div>

          <div>
            <h3 className="member-column-title">
              Sorties rejointes
            </h3>

            <div className="member-event-grid">
              {upcomingJoinedTrainings.length === 0 ? (
                <EmptyBlock text="Aucune sortie rejointe." />
              ) : (
                upcomingJoinedTrainings.map(
                  (item: any) => {
                    const training =
                      item.trainings;

                    return (
                      <Link
                        key={item.id}
                        href={`/courses/training/${training.id}`}
                        className="member-event-card member-training-event"
                      >
                        <span>
                          🏃 PARTICIPE
                        </span>

                        <h3>
                          {training.title}
                        </h3>

                        <p>
                          📍 {training.location}
                        </p>

                        <div className="member-training-meta">
                          <small>
                            ⏱{" "}
                            {training.duration_minutes} min
                          </small>

                          <small>
                            NIV.{" "}
                            {training.expected_level ?? "—"}
                          </small>
                        </div>

                        <time>
                          {formatDate(
                            training.training_date
                          )}
                        </time>
                      </Link>
                    );
                  }
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MemberIndexBox({
  logo,
  alt,
  value,
}: {
  logo: string;
  alt: string;
  value: number | null;
}) {
  return (
    <div className="member-index-box">
      <Image
        src={logo}
        alt={alt}
        width={90}
        height={28}
      />

      <strong>
        {value ?? "-"}
      </strong>
    </div>
  );
}

function EmptyBlock({
  text,
}: {
  text: string;
}) {
  return (
    <div className="member-empty-block">
      {text}
    </div>
  );
}

function formatDate(
  value: string
) {
  return new Date(
    `${value}T12:00:00`
  ).toLocaleDateString(
    "fr-FR",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}