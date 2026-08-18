"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Race = {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  race_date: string;
  location: string | null;
  created_by: string | null;
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

type Comment = {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_admin: boolean;
};

type UtmbProfile = {
  user_id: string;
  general_index: number | null;
  index_20k: number | null;
  index_50k: number | null;
  index_100k: number | null;
  index_100m: number | null;
};

export default function RaceDetailPage() {
  const params =
    useParams<{ id: string }>();

  const raceId = params.id;
  const router = useRouter();

  const supabase = createClient();

  const [race, setRace] =
    useState<Race | null>(null);

  const [raceOptions, setRaceOptions] =
    useState<RaceOption[]>([]);

  const [attendance, setAttendance] =
    useState<Attendance[]>([]);

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [utmbProfiles, setUtmbProfiles] =
    useState<UtmbProfile[]>([]);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [newOptionName, setNewOptionName] =
    useState("");

  const [newOptionDistance, setNewOptionDistance] =
    useState("");

  const [newOptionElevation, setNewOptionElevation] =
    useState("");

  const [savingOption, setSavingOption] =
    useState(false);

  useEffect(() => {
    loadPage();
  }, [raceId]);

  async function loadPage() {
    setLoading(true);

    const {
      data: { user },
    } =
      await supabase.auth.getUser();

    setUserId(
      user?.id ?? null
    );

    const {
      data: raceData,
      error: raceError,
    } = await supabase
      .from("races")
      .select("*")
      .eq("id", raceId)
      .single();

    if (raceError) {
      console.error(
        "Erreur course :",
        raceError
      );

      setRace(null);
      setLoading(false);

      return;
    }

    const {
      data: optionData,
    } = await supabase
      .from("race_options")
      .select("*")
      .eq("race_id", raceId)
      .order("distance", {
        ascending: true,
      });

    const {
      data: attendanceData,
    } = await supabase
      .from("race_attendance")
      .select("*")
      .eq("race_id", raceId);

    const {
      data: commentsData,
    } = await supabase
      .from("event_comments")
      .select("*")
      .eq("race_id", raceId)
      .order("created_at", {
        ascending: true,
      });

    const {
      data: profilesData,
    } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, nickname, avatar_url, bio, is_admin"
      );

    const {
      data: utmbProfilesData,
    } = await supabase
      .from("utmb_profiles")
      .select(
        `
        user_id,
        general_index,
        index_20k,
        index_50k,
        index_100k,
        index_100m
        `
      );

    setRace(
      raceData as Race
    );

    setRaceOptions(
      (optionData ??
        []) as RaceOption[]
    );

    setAttendance(
      (attendanceData ??
        []) as Attendance[]
    );

    setComments(
      (commentsData ??
        []) as Comment[]
    );

    setProfiles(
      (profilesData ??
        []) as Profile[]
    );

    setUtmbProfiles(
      (utmbProfilesData ??
        []) as UtmbProfile[]
    );

    setLoading(false);
  }

  /* ==========================================================
     PROFILS
  ========================================================== */

  function getProfile(
    profileId: string
  ) {
    return profiles.find(
      (profile) =>
        profile.id === profileId
    );
  }

  function getProfileName(
    profileId: string
  ) {
    const profile =
      getProfile(profileId);

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
        .join(" ") ||
      "Membre"
    );
  }

  function getFullName(
    profileId: string
  ) {
    const profile =
      getProfile(profileId);

    if (!profile) {
      return "Membre";
    }

    return (
      [
        profile.first_name,
        profile.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      profile.nickname ||
      "Membre"
    );
  }

  function isCurrentUserAdmin() {
    if (!userId) {
      return false;
    }

    return (
      profiles.find(
        (profile) => profile.id === userId
      )?.is_admin === true
    );
  }

  function canManageCurrentRace() {
    if (!race || !userId) {
      return false;
    }

    return (
      race.created_by === userId ||
      isCurrentUserAdmin()
    );
  }

  /* ==========================================================
     UTMB INDEX
  ========================================================== */

  function getUtmbProfile(
    profileId: string
  ) {
    return utmbProfiles.find(
      (utmb) =>
        utmb.user_id ===
        profileId
    );
  }

  function getUtmbIndexForRace(
    profileId: string,
    distance: number
  ) {
    const utmb =
      getUtmbProfile(
        profileId
      );

    if (!utmb) {
      return null;
    }

    let categoryIndex:
      | number
      | null = null;

    /*
     * Choix automatique de
     * l'index selon la distance
     */

    if (distance <= 30) {
      categoryIndex =
        utmb.index_20k;
    } else if (
      distance <= 70
    ) {
      categoryIndex =
        utmb.index_50k;
    } else if (
      distance <= 120
    ) {
      categoryIndex =
        utmb.index_100k;
    } else {
      categoryIndex =
        utmb.index_100m;
    }

    /*
     * Si l'index de catégorie
     * n'existe pas, utilisation
     * de l'index général.
     */

    return (
      categoryIndex ??
      utmb.general_index ??
      null
    );
  }

  /* ==========================================================
     FORMULE MTT
  ========================================================== */

  function estimateTrailTime(
    distance: number,
    elevation: number,
    index: number
  ) {
    /*
     * ------------------------------------------------------
     * FORMULE DE BASE
     * ------------------------------------------------------
     *
     * T_base =
     *
     * exp(-2.292)
     *
     * ×
     *
     * (
     *   Distance
     *   +
     *   1.089 × D+/100
     * ) ^ 1.221
     *
     * ×
     *
     * exp(
     *   -0.001975 × UTMB Index
     * )
     */

    const effortDistance =
      distance +
      1.089 *
        (elevation / 100);

    const baseTime =
      Math.exp(-2.292) *
      Math.pow(
        effortDistance,
        1.221
      ) *
      Math.exp(
        -0.001975 *
          index
      );

    /*
     * ------------------------------------------------------
     * CORRECTIF COURTES DISTANCES
     * ------------------------------------------------------
     */

    const f =
      distance <= 20
        ? 1
        : Math.exp(
            -(distance - 20)
          );

    const g =
      Math.exp(
        -Math.pow(
          (distance - 5) / 2,
          2
        )
      );

    const shortCorrection =
      1 +
      f *
        (
          0.1586658593 +
          0.0012097293 *
            (index - 483)
        ) +
      g *
        (
          0.1011671557 +
          0.0009509742 *
            (index - 483)
        );

    /*
     * Temps final en heures
     */

    const finalTime =
      baseTime *
      shortCorrection;

    return finalTime;
  }

  /* ==========================================================
     FORMAT DU TEMPS
  ========================================================== */

  function formatEstimatedTime(
    hours: number
  ) {
    const totalMinutes =
      Math.round(
        hours * 60
      );

    const h =
      Math.floor(
        totalMinutes / 60
      );

    const minutes =
      totalMinutes % 60;

    if (h === 0) {
      return `${minutes} min`;
    }

    return `${h}h${String(
      minutes
    ).padStart(2, "0")}`;
  }

  /* ==========================================================
     PARTICIPANTS
  ========================================================== */

  function getOptionParticipants(
    optionId: string
  ) {
    return attendance.filter(
      (item) =>
        item.status ===
          "participant" &&
        item.race_option_id ===
          optionId
    );
  }

  function getSupporters() {
    return attendance.filter(
      (item) =>
        item.status ===
        "support"
    );
  }

  function getMyAttendance() {
    return attendance.find(
      (item) =>
        item.user_id ===
        userId
    );
  }

  /* ==========================================================
     JE PARTICIPE
  ========================================================== */

  async function participate(
    raceOptionId: string
  ) {
    if (!userId) {
      alert(
        "Tu dois être connecté."
      );

      return;
    }

    const { error } =
      await supabase
        .from(
          "race_attendance"
        )
        .upsert(
          {
            race_id:
              raceId,

            race_option_id:
              raceOptionId,

            user_id:
              userId,

            status:
              "participant",
          },

          {
            onConflict:
              "race_id,user_id",
          }
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await loadPage();
  }

  /* ==========================================================
     JE SUPPORTE
  ========================================================== */

  async function supportRace() {
    if (!userId) {
      alert(
        "Tu dois être connecté."
      );

      return;
    }

    const { error } =
      await supabase
        .from(
          "race_attendance"
        )
        .upsert(
          {
            race_id:
              raceId,

            race_option_id:
              null,

            user_id:
              userId,

            status:
              "support",
          },

          {
            onConflict:
              "race_id,user_id",
          }
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await loadPage();
  }

  /* ==========================================================
     ANNULER PARTICIPATION
  ========================================================== */

  async function removeAttendance() {
    if (!userId) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "race_attendance"
        )
        .delete()
        .eq(
          "race_id",
          raceId
        )
        .eq(
          "user_id",
          userId
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await loadPage();
  }

  /* ==========================================================
     AJOUTER UN FORMAT A LA COURSE
  ========================================================== */

  async function addRaceOption(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      alert(
        "Tu dois être connecté pour ajouter un format."
      );
      return;
    }

    if (
      !newOptionDistance ||
      newOptionElevation === ""
    ) {
      alert(
        "Merci de renseigner la distance et le D+."
      );
      return;
    }

    const distance =
      Number(newOptionDistance);

    const elevation =
      Number(newOptionElevation);

    if (
      !Number.isFinite(distance) ||
      distance <= 0 ||
      !Number.isFinite(elevation) ||
      elevation < 0
    ) {
      alert(
        "La distance et le D+ ne sont pas valides."
      );
      return;
    }

    setSavingOption(true);

    const { error } =
      await supabase
        .from("race_options")
        .insert({
          race_id: raceId,
          name:
            newOptionName.trim() ||
            null,
          distance,
          elevation,
        });

    setSavingOption(false);

    if (error) {
      alert(error.message);
      return;
    }

    setNewOptionName("");
    setNewOptionDistance("");
    setNewOptionElevation("");

    await loadPage();
  }

  /* ==========================================================
     SUPPRIMER LA COURSE - CREATEUR OU ADMIN
  ========================================================== */

  async function deleteCurrentRace() {
    if (
      !userId ||
      !race ||
      !canManageCurrentRace()
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Supprimer complètement cet événement ?"
      );

    if (!confirmed) {
      return;
    }

    let deleteQuery =
      supabase
        .from("races")
        .delete()
        .eq("id", race.id);

    if (!isCurrentUserAdmin()) {
      deleteQuery =
        deleteQuery.eq(
          "created_by",
          userId
        );
    }

    const { error } =
      await deleteQuery;

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/courses");
    router.refresh();
  }

  /* ==========================================================
     COMMENTAIRES
  ========================================================== */

  async function sendComment(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      alert(
        "Tu dois être connecté pour écrire un message."
      );

      return;
    }

    if (!message.trim()) {
      return;
    }

    setSending(true);

    const { error } =
      await supabase
        .from(
          "event_comments"
        )
        .insert({
          user_id:
            userId,

          race_id:
            raceId,

          training_id:
            null,

          message:
            message.trim(),
        });

    setSending(false);

    if (error) {
      alert(
        error.message
      );

      return;
    }

    setMessage("");

    await loadPage();
  }

  async function deleteComment(
    commentId: string
  ) {
    if (!userId) {
      return;
    }

    if (
      !window.confirm(
        "Supprimer ce message ?"
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "event_comments"
        )
        .delete()
        .eq(
          "id",
          commentId
        )
        .eq(
          "user_id",
          userId
        );

    if (error) {
      alert(
        error.message
      );

      return;
    }

    await loadPage();
  }

  /* ==========================================================
     CHARGEMENT
  ========================================================== */

  if (loading) {
    return (
      <main className="page-container event-detail-page">
        Chargement...
      </main>
    );
  }

  if (!race) {
    return (
      <main className="page-container event-detail-page">
        Course introuvable.
      </main>
    );
  }

  const myAttendance =
    getMyAttendance();

  const supporters =
    getSupporters();

  const totalParticipants =
    attendance.filter(
      (item) =>
        item.status ===
        "participant"
    ).length;

  return (
    <main className="page-container event-detail-page">

      <Link
        href="/courses"
        className="event-back"
      >
        ← Retour aux événements
      </Link>

      {/* ==================================================
          HEADER COURSE
      ================================================== */}

      <section className="event-detail-header race-detail-header race-detail-with-logo">

        {race.image_url && (
          <div className="race-detail-logo">
            <img
              src={
                race.image_url
              }
              alt={`Logo ${race.name}`}
            />
          </div>
        )}

        <div className="race-detail-content">

          <span>
            COURSE
          </span>

          <h1>
            {race.name}
          </h1>

          {race.location && (
            <p className="race-detail-location">
              📍{" "}
              {race.location}
            </p>
          )}

          <div className="event-detail-stats">

            <div>
              <small>
                DATE
              </small>

              <strong>
                {new Date(
                  `${race.race_date}T12:00:00`
                ).toLocaleDateString(
                  "fr-FR"
                )}
              </strong>
            </div>

            <div>
              <small>
                FORMATS
              </small>

              <strong>
                {
                  raceOptions.length
                }
              </strong>
            </div>

            <div>
              <small>
                PARTICIPANTS
              </small>

              <strong>
                🏃{" "}
                {
                  totalParticipants
                }
              </strong>
            </div>

            <div>
              <small>
                SUPPORTERS
              </small>

              <strong>
                📣{" "}
                {
                  supporters.length
                }
              </strong>
            </div>

            <div>
              <small>
                DISCUSSION
              </small>

              <strong>
                💬{" "}
                {
                  comments.length
                }
              </strong>
            </div>

          </div>
        </div>
      </section>

      {canManageCurrentRace() && (
        <div className="race-detail-admin-actions">
          <Link
            href="/courses"
            className="race-detail-admin-edit"
          >
            Modifier l&apos;événement
          </Link>

          <button
            type="button"
            className="race-delete-button"
            onClick={deleteCurrentRace}
          >
            Supprimer l&apos;événement
          </button>
        </div>
      )}

      {/* ==================================================
          INSCRIPTION
      ================================================== */}

      <section className="race-detail-registration">

        <div className="race-detail-section-title">

          <span>
            INSCRIPTION TEAM
          </span>

          <h2>
            Tu seras de la partie ?
          </h2>

        </div>

        <div className="race-detail-options">

          {raceOptions.map(
            (option) => {

              const selected =
                myAttendance?.status ===
                  "participant" &&
                myAttendance
                  .race_option_id ===
                  option.id;

              const participants =
                getOptionParticipants(
                  option.id
                );

              return (
                <div
                  key={
                    option.id
                  }
                  className={`race-detail-option ${
                    selected
                      ? "race-detail-option-selected"
                      : ""
                  }`}
                >

                  <div>

                    <span>
                      {option.name ||
                        `${option.distance} KM`}
                    </span>

                    <h3>
                      {
                        option.distance
                      }{" "}
                      km
                    </h3>

                    <p>
                      {
                        option.elevation
                      }{" "}
                      m+
                    </p>

                  </div>

                  <div className="race-detail-option-count">
                    🏃{" "}
                    {
                      participants.length
                    }
                  </div>

                  {userId && (
                    <button
                      type="button"
                      className={
                        selected
                          ? "race-choice race-choice-active"
                          : "race-choice"
                      }
                      onClick={() =>
                        participate(
                          option.id
                        )
                      }
                    >
                      {selected
                        ? "✓ Je participe"
                        : "Je participe"}
                    </button>
                  )}

                </div>
              );
            }
          )}

        </div>

        {userId && (
          <form
            className="race-detail-add-format"
            onSubmit={addRaceOption}
          >
            <div className="race-detail-add-format-heading">
              <span>
                AJOUTER UNE DISTANCE
              </span>

              <strong>
                Un format manque à cet événement ?
              </strong>

              <p>
                Tous les membres connectés peuvent ajouter un format.
              </p>
            </div>

            <div className="race-detail-add-format-fields">
              <div>
                <label>
                  Nom du format
                </label>

                <input
                  value={newOptionName}
                  onChange={(event) =>
                    setNewOptionName(
                      event.target.value
                    )
                  }
                  placeholder="50K, Trail long..."
                />
              </div>

              <div>
                <label>
                  Distance
                </label>

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={newOptionDistance}
                  onChange={(event) =>
                    setNewOptionDistance(
                      event.target.value
                    )
                  }
                  placeholder="58"
                />
              </div>

              <div>
                <label>
                  D+
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={newOptionElevation}
                  onChange={(event) =>
                    setNewOptionElevation(
                      event.target.value
                    )
                  }
                  placeholder="3300"
                />
              </div>

              <button
                type="submit"
                disabled={savingOption}
              >
                {savingOption
                  ? "Ajout..."
                  : "+ Ajouter le format"}
              </button>
            </div>
          </form>
        )}

        {userId && (
          <div className="race-detail-support-actions">

            <button
              type="button"
              className={
                myAttendance?.status ===
                "support"
                  ? "race-choice race-choice-active"
                  : "race-choice"
              }
              onClick={
                supportRace
              }
            >
              📣{" "}
              {myAttendance?.status ===
              "support"
                ? "Je supporte"
                : "Je supporte"}
            </button>

            {myAttendance && (
              <button
                type="button"
                className="race-detail-remove-attendance"
                onClick={
                  removeAttendance
                }
              >
                Annuler ma participation
              </button>
            )}

          </div>
        )}

      </section>

      {/* ==================================================
          MEMBRES PAR FORMAT
      ================================================== */}

      <section className="race-detail-members-section">

        <div className="race-detail-section-title">

          <span>
            LE TEAM
          </span>

          <h2>
            Qui sera présent ?
          </h2>

        </div>

        {raceOptions.map(
          (option) => {

            const participants =
              getOptionParticipants(
                option.id
              );

            return (
              <div
                key={
                  option.id
                }
                className="race-detail-members-group"
              >

                <div className="race-detail-members-heading">

                  <div>

                    <span>
                      {option.name ||
                        "FORMAT"}
                    </span>

                    <h3>
                      {
                        option.distance
                      }{" "}
                      km
                    </h3>

                    <p>
                      {
                        option.elevation
                      }{" "}
                      m+
                    </p>

                  </div>

                  <strong>
                    {
                      participants.length
                    }{" "}
                    participant
                    {participants.length !==
                    1
                      ? "s"
                      : ""}
                  </strong>

                </div>

                {participants.length ===
                0 ? (

                  <div className="race-detail-no-member">
                    Personne inscrit pour le moment.
                  </div>

                ) : (

                  <div className="race-detail-member-grid">

                    {participants.map(
                      (
                        attendanceItem
                      ) => {

                        const profile =
                          getProfile(
                            attendanceItem.user_id
                          );

                        if (
                          !profile
                        ) {
                          return null;
                        }

                        /*
                         * ========================================
                         * CALCUL TEMPS ESTIME
                         * ========================================
                         */

                        const utmbIndex =
                          getUtmbIndexForRace(
                            attendanceItem.user_id,
                            option.distance
                          );

                        const estimatedTime =
                          utmbIndex !==
                          null
                            ? estimateTrailTime(
                                option.distance,
                                option.elevation,
                                utmbIndex
                              )
                            : null;

                        return (
                          <Link
                            key={
                              attendanceItem.id
                            }
                            href={`/equipe/${profile.id}`}
                            className="race-detail-member-card"
                          >

                            <div className="race-detail-member-avatar">

                              {profile.avatar_url ? (

                                <img
                                  src={
                                    profile.avatar_url
                                  }
                                  alt={
                                    getFullName(
                                      profile.id
                                    )
                                  }
                                />

                              ) : (

                                <span>
                                  {getProfileName(
                                    profile.id
                                  )
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </span>

                              )}

                            </div>

                            <div className="race-detail-member-info">

                              <strong>
                                {getFullName(
                                  profile.id
                                )}
                              </strong>

                              {profile.nickname && (
                                <span className="race-detail-member-nickname">
                                  @
                                  {
                                    profile.nickname
                                  }
                                </span>
                              )}

                              {/* ==================================
                                  TEMPS ESTIME MTT
                              ================================== */}

                              {estimatedTime !==
                                null &&
                                utmbIndex !==
                                  null && (

                                <div className="race-member-estimate">

                                  <div className="race-member-estimate-main">

                                    <span>
                                      TEMPS ESTIMÉ
                                    </span>

                                    <strong>
                                      {formatEstimatedTime(
                                        estimatedTime
                                      )}
                                    </strong>

                                  </div>

                                  <small>
                                    UTMB Index{" "}
                                    {
                                      utmbIndex
                                    }
                                  </small>

                                </div>
                              )}

                              {profile.bio && (
                                <p>
                                  {
                                    profile.bio
                                  }
                                </p>
                              )}

                            </div>

                          </Link>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            );
          }
        )}

        {/* ==================================================
            SUPPORTERS
        ================================================== */}

        <div className="race-detail-members-group race-detail-supporters-group">

          <div className="race-detail-members-heading">

            <div>

              <span>
                SUPPORT
              </span>

              <h3>
                Les supporters
              </h3>

            </div>

            <strong>
              {
                supporters.length
              }{" "}
              supporter
              {supporters.length !==
              1
                ? "s"
                : ""}
            </strong>

          </div>

          {supporters.length ===
          0 ? (

            <div className="race-detail-no-member">
              Aucun supporter pour le moment.
            </div>

          ) : (

            <div className="race-detail-member-grid">

              {supporters.map(
                (
                  attendanceItem
                ) => {

                  const profile =
                    getProfile(
                      attendanceItem.user_id
                    );

                  if (
                    !profile
                  ) {
                    return null;
                  }

                  return (
                    <Link
                      key={
                        attendanceItem.id
                      }
                      href={`/equipe/${profile.id}`}
                      className="race-detail-member-card"
                    >

                      <div className="race-detail-member-avatar">

                        {profile.avatar_url ? (

                          <img
                            src={
                              profile.avatar_url
                            }
                            alt={
                              getFullName(
                                profile.id
                              )
                            }
                          />

                        ) : (

                          <span>
                            {getProfileName(
                              profile.id
                            )
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </span>

                        )}

                      </div>

                      <div className="race-detail-member-info">

                        <strong>
                          {getFullName(
                            profile.id
                          )}
                        </strong>

                        {profile.nickname && (
                          <span className="race-detail-member-nickname">
                            @
                            {
                              profile.nickname
                            }
                          </span>
                        )}

                        {profile.bio && (
                          <p>
                            {
                              profile.bio
                            }
                          </p>
                        )}

                      </div>

                    </Link>
                  );
                }
              )}

            </div>
          )}

        </div>

      </section>

      {/* ==================================================
          DISCUSSION
      ================================================== */}

      <section className="event-discussion">

        <div className="event-discussion-title">

          <span>
            DISCUSSION
          </span>

          <h2>
            {
              comments.length
            }{" "}
            message
            {comments.length !==
            1
              ? "s"
              : ""}
          </h2>

        </div>

        <div className="event-comments">

          {comments.length ===
            0 && (

            <div className="event-no-comments">
              Aucun message pour le moment.
            </div>

          )}

          {comments.map(
            (comment) => (

              <article
                key={
                  comment.id
                }
                className="event-comment"
              >

                <div className="event-comment-avatar">

                  {getProfileName(
                    comment.user_id
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div className="event-comment-content">

                  <div className="event-comment-head">

                    <div>

                      <strong>
                        {getProfileName(
                          comment.user_id
                        )}
                      </strong>

                      <span>
                        {new Date(
                          comment.created_at
                        ).toLocaleString(
                          "fr-FR",
                          {
                            day:
                              "2-digit",

                            month:
                              "short",

                            hour:
                              "2-digit",

                            minute:
                              "2-digit",
                          }
                        )}
                      </span>

                    </div>

                    {comment.user_id ===
                      userId && (

                      <button
                        type="button"
                        className="comment-delete"
                        onClick={() =>
                          deleteComment(
                            comment.id
                          )
                        }
                      >
                        Supprimer
                      </button>

                    )}

                  </div>

                  <p>
                    {
                      comment.message
                    }
                  </p>

                </div>

              </article>

            )
          )}

        </div>

        {userId ? (

          <form
            className="comment-form"
            onSubmit={
              sendComment
            }
          >

            <label>
              Écrire un message
            </label>

            <textarea
              rows={4}
              value={
                message
              }
              onChange={(
                event
              ) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Organisation, covoiturage, matériel, rendez-vous..."
            />

            <button
              type="submit"
              disabled={
                sending
              }
            >
              {sending
                ? "Envoi..."
                : "Envoyer le message"}
            </button>

          </form>

        ) : (

          <div className="event-login-message">
            Connecte-toi pour participer à la discussion.
          </div>

        )}

      </section>

    </main>
  );
}