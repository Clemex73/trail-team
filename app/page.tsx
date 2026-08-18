"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
};

type Race = {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  race_date: string;
};

type Training = {
  id: string;
  title: string;
  location: string;
  duration_minutes: number;
  training_date: string;
  expected_level: string | null;
};

type RaceAttendance = {
  id: string;
  race_id: string;
  user_id: string;
  status: "participant" | "support";
};

type TrainingAttendance = {
  id: string;
  training_id: string;
  user_id: string;
};

type EventComment = {
  id: string;
  user_id: string;
  race_id: string | null;
  training_id: string | null;
  message: string;
  created_at: string;
};

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_urls: string[];
  author_id: string;
  created_at: string;
};

export default function HomePage() {
  const supabase = createClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);

  const [raceAttendance, setRaceAttendance] =
    useState<RaceAttendance[]>([]);

  const [trainingAttendance, setTrainingAttendance] =
    useState<TrainingAttendance[]>([]);

  const [comments, setComments] =
    useState<EventComment[]>([]);

  const [articles, setArticles] =
    useState<Article[]>([]);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadHome();
  }, []);

  async function loadHome() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data: profilesData } =
      await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, nickname"
        );

    const { data: racesData } =
      await supabase
        .from("races")
        .select("*")
        .order("race_date", {
          ascending: true,
        });

    const { data: trainingsData } =
      await supabase
        .from("trainings")
        .select("*")
        .order("training_date", {
          ascending: true,
        });

    const { data: raceAttendanceData } =
      await supabase
        .from("race_attendance")
        .select("*");

    const {
      data: trainingAttendanceData,
    } = await supabase
      .from("training_attendance")
      .select("*");

    const { data: commentsData } =
      await supabase
        .from("event_comments")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

    const { data: articlesData } =
      await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("created_at", {
          ascending: false,
        });

    setProfiles(
      (profilesData ?? []) as Profile[]
    );

    setRaces(
      (racesData ?? []) as Race[]
    );

    setTrainings(
      (trainingsData ?? []) as Training[]
    );

    setRaceAttendance(
      (raceAttendanceData ??
        []) as RaceAttendance[]
    );

    setTrainingAttendance(
      (trainingAttendanceData ??
        []) as TrainingAttendance[]
    );

    setComments(
      (commentsData ?? []) as EventComment[]
    );

    setArticles(
      (articlesData ?? []) as Article[]
    );

    setLoading(false);
  }

  function getProfileName(
    profileId: string
  ) {
    const profile = profiles.find(
      (item) =>
        item.id === profileId
    );

    if (!profile) {
      return "Membre";
    }

    if (profile.nickname) {
      return profile.nickname;
    }

    return (
      [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "Membre"
    );
  }

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  const upcomingRaces =
    useMemo(
      () =>
        races.filter(
          (race) =>
            race.race_date >= today
        ),
      [races, today]
    );

  const upcomingTrainings =
    useMemo(
      () =>
        trainings.filter(
          (training) =>
            training.training_date >=
            today
        ),
      [trainings, today]
    );

  const nextRace =
    upcomingRaces[0] ?? null;

  const nextTraining =
    upcomingTrainings[0] ?? null;

  function raceParticipants(
    raceId: string
  ) {
    return raceAttendance.filter(
      (item) =>
        item.race_id === raceId &&
        item.status === "participant"
    );
  }

  function raceSupporters(
    raceId: string
  ) {
    return raceAttendance.filter(
      (item) =>
        item.race_id === raceId &&
        item.status === "support"
    );
  }

  function trainingParticipants(
    trainingId: string
  ) {
    return trainingAttendance.filter(
      (item) =>
        item.training_id ===
        trainingId
    );
  }

  function raceCommentCount(
    raceId: string
  ) {
    return comments.filter(
      (comment) =>
        comment.race_id === raceId
    ).length;
  }

  function trainingCommentCount(
    trainingId: string
  ) {
    return comments.filter(
      (comment) =>
        comment.training_id ===
        trainingId
    ).length;
  }

  function getCommentTarget(
    comment: EventComment
  ) {
    if (comment.race_id) {
      const race = races.find(
        (item) =>
          item.id === comment.race_id
      );

      return {
        name:
          race?.name ?? "Course",
        href: `/courses/course/${comment.race_id}`,
      };
    }

    if (comment.training_id) {
      const training =
        trainings.find(
          (item) =>
            item.id ===
            comment.training_id
        );

      return {
        name:
          training?.title ??
          "Entraînement",
        href: `/courses/training/${comment.training_id}`,
      };
    }

    return {
      name: "Événement",
      href: "/courses",
    };
  }

  if (loading) {
    return (
      <main className="home-dashboard">
        <div className="page-container">
          Chargement du team...
        </div>
      </main>
    );
  }

  return (
    <main className="home-dashboard">
      {/* ==================================================
          HERO
      ================================================== */}

      <section className="home-hero">
        <div className="page-container home-hero-inner">
          <div className="home-hero-copy">
            <span className="home-eyebrow">
              MAURIENNE TRAIL TEAM
            </span>

            <h1>
              PLUS HAUT.
              <br />
              <span>ENSEMBLE.</span>
            </h1>

            <p>
              Une équipe. Des montagnes.
              Des kilomètres, des défis et
              surtout une même envie :
              partager l&apos;aventure.
            </p>

            <div className="home-hero-actions">
              <Link
                href="/courses"
                className="home-primary-button"
              >
                Voir les prochains défis
              </Link>

              <Link
                href="/equipe"
                className="home-secondary-button"
              >
                Découvrir le team
              </Link>
            </div>
          </div>

          <div className="home-hero-visual">
            <img
              src="/aiguilles-arves2.png"
              alt=""
            />

            <div className="home-hero-stamp">
              <strong>
                BORN IN THE MOUNTAINS
              </strong>

              <span>
                BUILT FOR THE TRAIL
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          STATS
      ================================================== */}

      <section className="page-container">
        <div className="home-stats">
          <div>
            <strong>
              {profiles.length}
            </strong>

            <span>MEMBRES</span>
          </div>

          <div>
            <strong>
              {upcomingRaces.length}
            </strong>

            <span>
              COURSES À VENIR
            </span>
          </div>

          <div>
            <strong>
              {upcomingTrainings.length}
            </strong>

            <span>
              SORTIES PRÉVUES
            </span>
          </div>

          <div>
            <strong>
              {comments.length}
            </strong>

            <span>MESSAGES</span>
          </div>
        </div>
      </section>

      {/* ==================================================
          PROCHAINS EVENEMENTS
      ================================================== */}

      <section className="page-container home-next-section">
        <div className="home-section-heading">
          <span>
            PROCHAINS RENDEZ-VOUS
          </span>

          <h2>
            Le team se prépare.
          </h2>
        </div>

        <div className="home-next-grid">
          {nextRace ? (
            <Link
              href={`/courses/course/${nextRace.id}`}
              className="home-event-card home-race-card"
            >
              <div className="home-event-top">
                <span>
                  PROCHAINE COURSE
                </span>

                <strong>
                  {new Date(
                    `${nextRace.race_date}T12:00:00`
                  ).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  )}
                </strong>
              </div>

              <h3>
                {nextRace.name}
              </h3>

              <div className="home-event-details">
                <span>
                  {nextRace.distance} KM
                </span>

                <span>
                  {nextRace.elevation} M+
                </span>
              </div>

              <div className="home-event-footer">
                <span>
                  🏃{" "}
                  {
                    raceParticipants(
                      nextRace.id
                    ).length
                  }
                </span>

                <span>
                  📣{" "}
                  {
                    raceSupporters(
                      nextRace.id
                    ).length
                  }
                </span>

                <span>
                  💬{" "}
                  {raceCommentCount(
                    nextRace.id
                  )}
                </span>
              </div>
            </Link>
          ) : (
            <div className="home-event-card home-empty-card">
              <span>
                PROCHAINE COURSE
              </span>

              <h3>
                Aucun défi programmé.
              </h3>

              <Link href="/courses">
                Ajouter une course →
              </Link>
            </div>
          )}

          {nextTraining ? (
            <Link
              href={`/courses/training/${nextTraining.id}`}
              className="home-event-card home-training-card"
            >
              <div className="home-event-top">
                <span>
                  PROCHAINE SORTIE
                </span>

                <strong>
                  {new Date(
                    `${nextTraining.training_date}T12:00:00`
                  ).toLocaleDateString(
                    "fr-FR",
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  )}
                </strong>
              </div>

              <h3>
                {nextTraining.title}
              </h3>

              <div className="home-event-details">
                <span>
                  📍{" "}
                  {nextTraining.location}
                </span>

                <span>
                  ⏱{" "}
                  {
                    nextTraining.duration_minutes
                  }{" "}
                  MIN
                </span>

                <span>
                  NIV.{" "}
                  {nextTraining.expected_level ??
                    "—"}
                </span>
              </div>

              <div className="home-event-footer">
                <span>
                  🏃{" "}
                  {
                    trainingParticipants(
                      nextTraining.id
                    ).length
                  }
                </span>

                <span>
                  💬{" "}
                  {trainingCommentCount(
                    nextTraining.id
                  )}
                </span>
              </div>
            </Link>
          ) : (
            <div className="home-event-card home-empty-card">
              <span>
                PROCHAINE SORTIE
              </span>

              <h3>
                Aucun entraînement prévu.
              </h3>

              <Link href="/courses">
                Proposer une sortie →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ==================================================
          ACTIVITE RECENTE
      ================================================== */}

      <section className="home-activity-zone">
        <div className="page-container">
          <div className="home-section-heading">
            <span>
              VIE DU TEAM
            </span>

            <h2>
              Ça bouge en Maurienne.
            </h2>
          </div>

          <div className="home-activity-grid">
            <div className="home-activity-list">
              {comments.length === 0 && (
                <div className="home-no-activity">
                  Pas encore de discussion.
                </div>
              )}

              {comments
                .slice(0, 5)
                .map((comment) => {
                  const target =
                    getCommentTarget(
                      comment
                    );

                  return (
                    <Link
                      href={target.href}
                      key={comment.id}
                      className="home-activity-item"
                    >
                      <div className="home-activity-avatar">
                        {getProfileName(
                          comment.user_id
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <div className="home-activity-meta">
                          <strong>
                            {getProfileName(
                              comment.user_id
                            )}
                          </strong>

                          <span>
                            sur{" "}
                            {target.name}
                          </span>
                        </div>

                        <p>
                          {comment.message}
                        </p>

                        <small>
                          {new Date(
                            comment.created_at
                          ).toLocaleString(
                            "fr-FR",
                            {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </small>
                      </div>
                    </Link>
                  );
                })}
            </div>

            <div className="home-team-quote">
              <span>
                ESPRIT TEAM
              </span>

              <blockquote>
                Les kilomètres passent.
                Les souvenirs restent.
              </blockquote>

              <p>
                Courir ensemble,
                progresser ensemble,
                célébrer ensemble.
              </p>

              <Link href="/equipe">
                Voir l&apos;équipe →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          ARTICLES
      ================================================== */}

      <section className="page-container home-articles-section">
        <div className="home-section-heading home-articles-heading">
          <div>
            <span>
              JOURNAL DU TEAM
            </span>

            <h2>
              Histoires de sentiers.
            </h2>
          </div>

          {userId && (
            <Link
              href="/articles/nouveau"
              className="home-primary-button"
            >
              + Écrire un article
            </Link>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="home-no-articles">
            <strong>
              Le journal est encore vide.
            </strong>

            <p>
              Récit de course,
              entraînement, aventure ou
              moment du team : à vous
              d&apos;écrire la suite.
            </p>

            {userId && (
              <Link href="/articles/nouveau">
                Publier le premier article →
              </Link>
            )}
          </div>
        ) : (
          <div className="home-articles-grid">
            {articles
              .slice(0, 6)
              .map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.id}`}
                  className="home-article-card"
                >
                  <div className="home-article-image">
                    {article.image_urls?.[0] ? (
                      <img
                        src={
                          article
                            .image_urls[0]
                        }
                        alt={article.title}
                      />
                    ) : (
                      <div className="home-article-placeholder">
                        MTT
                      </div>
                    )}
                  </div>

                  <div className="home-article-content">
                    <span>
                      {new Date(
                        article.created_at
                      ).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>

                    <h3>
                      {article.title}
                    </h3>

                    <p>
                      {article.excerpt ||
                        article.content.slice(
                          0,
                          150
                        )}
                    </p>

                    <div className="home-article-author">
                      PAR{" "}
                      {getProfileName(
                        article.author_id
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>

      {/* ==================================================
          CTA
      ================================================== */}

      <section className="home-final-cta">
        <div className="page-container home-final-cta-inner">
          <span>
            MAURIENNE TRAIL TEAM
          </span>

          <h2>
            LE PROCHAIN SOMMET
            <br />
            NOUS ATTEND.
          </h2>

          <Link
            href="/courses"
            className="home-final-button"
          >
            Voir le calendrier →
          </Link>
        </div>
      </section>
    </main>
  );
}