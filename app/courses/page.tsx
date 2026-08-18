"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Race = {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  race_date: string;
  created_by: string | null;
};

type Attendance = {
  id: string;
  race_id: string;
  user_id: string;
  status: "participant" | "support";
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
};

type Training = {
  id: string;
  title: string;
  location: string;
  duration_minutes: number;
  training_date: string;
  comment: string | null;
  created_by: string;
  expected_level: string | null;
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

export default function CoursesPage() {
  const supabase = createClient();

  const [races, setRaces] = useState<Race[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [trainingAttendance, setTrainingAttendance] =
    useState<TrainingAttendance[]>([]);

  const [comments, setComments] = useState<EventComment[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  /* ======================================================
     AJOUT COURSE
  ====================================================== */

  const [name, setName] = useState("");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [raceDate, setRaceDate] = useState("");

  const [saving, setSaving] = useState(false);

  /* ======================================================
     AJOUT SORTIE
  ====================================================== */

  const [trainingTitle, setTrainingTitle] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [trainingDuration, setTrainingDuration] = useState("");
  const [trainingDate, setTrainingDate] = useState("");
  const [trainingComment, setTrainingComment] = useState("");
  const [trainingLevel, setTrainingLevel] = useState("<300");

  const [savingTraining, setSavingTraining] = useState(false);

  /* ======================================================
     EDITION COURSE
  ====================================================== */

  const [editingRaceId, setEditingRaceId] =
    useState<string | null>(null);

  const [editName, setEditName] = useState("");
  const [editDistance, setEditDistance] = useState("");
  const [editElevation, setEditElevation] = useState("");
  const [editDate, setEditDate] = useState("");

  /* ======================================================
     EDITION SORTIE
  ====================================================== */

  const [editingTrainingId, setEditingTrainingId] =
    useState<string | null>(null);

  const [editTrainingTitle, setEditTrainingTitle] = useState("");
  const [editTrainingLocation, setEditTrainingLocation] =
    useState("");
  const [editTrainingDuration, setEditTrainingDuration] =
    useState("");
  const [editTrainingDate, setEditTrainingDate] = useState("");
  const [editTrainingComment, setEditTrainingComment] =
    useState("");
  const [editTrainingLevel, setEditTrainingLevel] =
    useState("<300");

  /* ======================================================
     CALENDRIER
  ====================================================== */

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
  });

  useEffect(() => {
    loadEverything();
  }, []);

  /* ======================================================
     CHARGEMENT
  ====================================================== */

  async function loadEverything() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data: racesData } = await supabase
      .from("races")
      .select("*")
      .order("race_date", { ascending: true });

    const { data: attendanceData } = await supabase
      .from("race_attendance")
      .select("*");

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, nickname");

    const { data: trainingsData } = await supabase
      .from("trainings")
      .select("*")
      .order("training_date", { ascending: true });

    const { data: trainingAttendanceData } = await supabase
      .from("training_attendance")
      .select("*");

    const { data: commentsData } = await supabase
      .from("event_comments")
      .select("*");

    setRaces((racesData ?? []) as Race[]);

    setAttendance(
      (attendanceData ?? []) as Attendance[]
    );

    setProfiles(
      (profilesData ?? []) as Profile[]
    );

    setTrainings(
      (trainingsData ?? []) as Training[]
    );

    setTrainingAttendance(
      (trainingAttendanceData ?? []) as TrainingAttendance[]
    );

    setComments(
      (commentsData ?? []) as EventComment[]
    );

    setLoading(false);
  }

  /* ======================================================
     AJOUT COURSE
  ====================================================== */

  async function addRace(event: React.FormEvent) {
    event.preventDefault();

    if (!userId) {
      alert("Tu dois être connecté pour ajouter une course.");
      return;
    }

    if (!name || !distance || !elevation || !raceDate) {
      alert("Merci de remplir tous les champs.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("races")
      .insert({
        name: name.trim(),
        distance: Number(distance),
        elevation: Number(elevation),
        race_date: raceDate,
        created_by: userId,
      });

    setSaving(false);

    if (error) {
      console.error(error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    setName("");
    setDistance("");
    setElevation("");
    setRaceDate("");

    await loadEverything();
  }

  /* ======================================================
     AJOUT SORTIE
  ====================================================== */

  async function addTraining(event: React.FormEvent) {
    event.preventDefault();

    if (!userId) {
      alert("Tu dois être connecté pour ajouter une sortie.");
      return;
    }

    if (
      !trainingTitle.trim() ||
      !trainingLocation.trim() ||
      !trainingDuration ||
      !trainingDate ||
      !trainingLevel
    ) {
      alert("Merci de remplir tous les champs.");
      return;
    }

    setSavingTraining(true);

    const { error } = await supabase
      .from("trainings")
      .insert({
        title: trainingTitle.trim(),
        location: trainingLocation.trim(),
        duration_minutes: Number(trainingDuration),
        training_date: trainingDate,
        comment: trainingComment.trim() || null,
        expected_level: trainingLevel,
        created_by: userId,
      });

    setSavingTraining(false);

    if (error) {
      console.error(error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    setTrainingTitle("");
    setTrainingLocation("");
    setTrainingDuration("");
    setTrainingDate("");
    setTrainingComment("");
    setTrainingLevel("<300");

    await loadEverything();
  }

  /* ======================================================
     PARTICIPATION COURSE
  ====================================================== */

  async function chooseStatus(
    raceId: string,
    status: "participant" | "support"
  ) {
    if (!userId) {
      alert("Tu dois être connecté.");
      return;
    }

    const { error } = await supabase
      .from("race_attendance")
      .upsert(
        {
          race_id: raceId,
          user_id: userId,
          status,
        },
        {
          onConflict: "race_id,user_id",
        }
      );

    if (error) {
      alert(error.message);
      return;
    }

    await loadEverything();
  }

  async function removeStatus(raceId: string) {
    if (!userId) return;

    await supabase
      .from("race_attendance")
      .delete()
      .eq("race_id", raceId)
      .eq("user_id", userId);

    await loadEverything();
  }

  /* ======================================================
     PARTICIPATION SORTIE
  ====================================================== */

  async function joinTraining(trainingId: string) {
    if (!userId) {
      alert("Tu dois être connecté.");
      return;
    }

    const { error } = await supabase
      .from("training_attendance")
      .insert({
        training_id: trainingId,
        user_id: userId,
      });

    if (error) {
      alert(error.message);
      return;
    }

    await loadEverything();
  }

  async function leaveTraining(trainingId: string) {
    if (!userId) return;

    await supabase
      .from("training_attendance")
      .delete()
      .eq("training_id", trainingId)
      .eq("user_id", userId);

    await loadEverything();
  }

  /* ======================================================
     MODIFIER COURSE
  ====================================================== */

  function startEditRace(race: Race) {
    setEditingRaceId(race.id);
    setEditName(race.name);
    setEditDistance(String(race.distance));
    setEditElevation(String(race.elevation));
    setEditDate(race.race_date);
  }

  function cancelEditRace() {
    setEditingRaceId(null);
  }

  async function updateRace(raceId: string) {
    if (!userId) return;

    const { error } = await supabase
      .from("races")
      .update({
        name: editName.trim(),
        distance: Number(editDistance),
        elevation: Number(editElevation),
        race_date: editDate,
      })
      .eq("id", raceId)
      .eq("created_by", userId);

    if (error) {
      alert(error.message);
      return;
    }

    cancelEditRace();
    await loadEverything();
  }

  async function deleteRace(raceId: string) {
    if (!userId) return;

    if (!window.confirm("Supprimer cette course ?")) {
      return;
    }

    const { error } = await supabase
      .from("races")
      .delete()
      .eq("id", raceId)
      .eq("created_by", userId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadEverything();
  }

  /* ======================================================
     MODIFIER SORTIE
  ====================================================== */

  function startEditTraining(training: Training) {
    setEditingTrainingId(training.id);

    setEditTrainingTitle(training.title);
    setEditTrainingLocation(training.location);
    setEditTrainingDuration(
      String(training.duration_minutes)
    );

    setEditTrainingDate(training.training_date);
    setEditTrainingComment(training.comment ?? "");
    setEditTrainingLevel(
      training.expected_level ?? "<300"
    );
  }

  function cancelEditTraining() {
    setEditingTrainingId(null);
  }

  async function updateTraining(trainingId: string) {
    if (!userId) return;

    const { error } = await supabase
      .from("trainings")
      .update({
        title: editTrainingTitle.trim(),
        location: editTrainingLocation.trim(),
        duration_minutes: Number(editTrainingDuration),
        training_date: editTrainingDate,
        comment: editTrainingComment.trim() || null,
        expected_level: editTrainingLevel,
      })
      .eq("id", trainingId)
      .eq("created_by", userId);

    if (error) {
      alert(error.message);
      return;
    }

    cancelEditTraining();
    await loadEverything();
  }

  async function deleteTraining(trainingId: string) {
    if (!userId) return;

    if (!window.confirm("Supprimer cette sortie ?")) {
      return;
    }

    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", trainingId)
      .eq("created_by", userId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadEverything();
  }

  /* ======================================================
     OUTILS
  ====================================================== */

  function getProfileName(profileId: string) {
    const profile = profiles.find(
      (profile) => profile.id === profileId
    );

    if (!profile) return "Membre";

    if (profile.nickname) {
      return profile.nickname;
    }

    return (
      [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ") || "Membre"
    );
  }

  function getRaceAttendance(
    raceId: string,
    status: "participant" | "support"
  ) {
    return attendance.filter(
      (item) =>
        item.race_id === raceId &&
        item.status === status
    );
  }

  function getMyStatus(raceId: string) {
    return attendance.find(
      (item) =>
        item.race_id === raceId &&
        item.user_id === userId
    )?.status;
  }

  function getTrainingParticipants(trainingId: string) {
    return trainingAttendance.filter(
      (item) => item.training_id === trainingId
    );
  }

  function isParticipatingTraining(trainingId: string) {
    return trainingAttendance.some(
      (item) =>
        item.training_id === trainingId &&
        item.user_id === userId
    );
  }

  function getRaceCommentCount(raceId: string) {
    return comments.filter(
      (comment) => comment.race_id === raceId
    ).length;
  }

  function getTrainingCommentCount(trainingId: string) {
    return comments.filter(
      (comment) =>
        comment.training_id === trainingId
    ).length;
  }

  /* ======================================================
     CALENDRIER
  ====================================================== */

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    let firstWeekDay = firstDay.getDay();

    if (firstWeekDay === 0) {
      firstWeekDay = 7;
    }

    const result: Array<number | null> = [];

    for (let i = 1; i < firstWeekDay; i++) {
      result.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      result.push(day);
    }

    return result;
  }, [currentMonth]);

  function previousMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() - 1,
        1
      )
    );
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  function getCalendarDate(day: number) {
    const year = currentMonth.getFullYear();

    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}-${String(day).padStart(
      2,
      "0"
    )}`;
  }

  function racesForDay(day: number) {
    const date = getCalendarDate(day);

    return races.filter(
      (race) => race.race_date === date
    );
  }

  function trainingsForDay(day: number) {
    const date = getCalendarDate(day);

    return trainings.filter(
      (training) =>
        training.training_date === date
    );
  }

  if (loading) {
    return (
      <main className="page-container">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="courses-page">
      {/* HEADER */}

      <section className="courses-hero">
        <div className="courses-hero-inner">
          <p>MAURIENNE TRAIL TEAM</p>

          <h1>
            LES PROCHAINS
            <br />
            <span>DÉFIS.</span>
          </h1>

          <div className="courses-title-line" />

          <p className="courses-description">
            Courses, entraînements et rendez-vous du team.
          </p>
        </div>
      </section>

      {/* AJOUT COURSE */}

      <section className="page-container">
        <div className="race-create">
          <div className="race-create-heading">
            <span>AJOUTER UNE COURSE</span>
            <h2>Un nouvel objectif ?</h2>
          </div>

          {userId && (
            <form
              className="race-form"
              onSubmit={addRace}
            >
              <div className="race-form-name">
                <label>Nom de la course</label>
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div>
                <label>Distance</label>

                <div className="race-input-unit">
                  <input
                    type="number"
                    value={distance}
                    onChange={(e) =>
                      setDistance(e.target.value)
                    }
                  />
                  <span>KM</span>
                </div>
              </div>

              <div>
                <label>D+</label>

                <div className="race-input-unit">
                  <input
                    type="number"
                    value={elevation}
                    onChange={(e) =>
                      setElevation(e.target.value)
                    }
                  />
                  <span>M</span>
                </div>
              </div>

              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={raceDate}
                  onChange={(e) =>
                    setRaceDate(e.target.value)
                  }
                />
              </div>

              <button
                className="race-submit"
                disabled={saving}
              >
                {saving
                  ? "Ajout..."
                  : "Ajouter la course"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* AJOUT ENTRAINEMENT */}

      <section className="page-container">
        <div className="training-create">
          <div className="training-create-heading">
            <span>AJOUTER UNE SORTIE</span>
            <h2>Une sortie prévue ?</h2>

            <p>
              Propose un entraînement au reste du team.
            </p>
          </div>

          {userId && (
            <form
              className="training-form"
              onSubmit={addTraining}
            >
              <div>
                <label>Nom</label>

                <input
                  value={trainingTitle}
                  onChange={(e) =>
                    setTrainingTitle(e.target.value)
                  }
                />
              </div>

              <div>
                <label>Lieu</label>

                <input
                  value={trainingLocation}
                  onChange={(e) =>
                    setTrainingLocation(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Durée</label>

                <div className="race-input-unit">
                  <input
                    type="number"
                    value={trainingDuration}
                    onChange={(e) =>
                      setTrainingDuration(
                        e.target.value
                      )
                    }
                  />

                  <span>MIN</span>
                </div>
              </div>

              <div>
                <label>Date</label>

                <input
                  type="date"
                  value={trainingDate}
                  onChange={(e) =>
                    setTrainingDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Niveau attendu</label>

                <select
                  value={trainingLevel}
                  onChange={(e) =>
                    setTrainingLevel(
                      e.target.value
                    )
                  }
                >
                  <option value="<300">
                    &lt; 300
                  </option>

                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                  <option value="1000">1000</option>
                </select>
              </div>

              <div className="training-form-comment">
                <label>Commentaire</label>

                <textarea
                  rows={4}
                  value={trainingComment}
                  onChange={(e) =>
                    setTrainingComment(
                      e.target.value
                    )
                  }
                />
              </div>

              <button
                className="training-submit"
                disabled={savingTraining}
              >
                {savingTraining
                  ? "Ajout..."
                  : "Ajouter la sortie"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* CALENDRIER */}

      <section className="page-container courses-calendar-section">
        <div className="courses-section-title">
          <div>
            <span>CALENDRIER</span>
            <h2>Les rendez-vous du team</h2>
          </div>

          <div className="calendar-controls">
            <button onClick={previousMonth}>
              ←
            </button>

            <strong>
              {currentMonth.toLocaleDateString(
                "fr-FR",
                {
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>

            <button onClick={nextMonth}>
              →
            </button>
          </div>
        </div>

        <div className="race-calendar">
          {[
            "LUN",
            "MAR",
            "MER",
            "JEU",
            "VEN",
            "SAM",
            "DIM",
          ].map((day) => (
            <div
              key={day}
              className="calendar-weekday"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day, index) => {
            if (!day) {
              return (
                <div
                  key={`empty-${index}`}
                  className="calendar-day calendar-empty"
                />
              );
            }

            const dayRaces = racesForDay(day);
            const dayTrainings =
              trainingsForDay(day);

            return (
              <div
                key={day}
                className="calendar-day"
              >
                <span className="calendar-number">
                  {day}
                </span>

                {dayRaces.map((race) => (
                  <Link
                    key={race.id}
                    href={`/courses/course/${race.id}`}
                    className="calendar-race calendar-event-link"
                  >
                    <strong>{race.name}</strong>

                    <span>
                      {race.distance} km ·{" "}
                      {race.elevation} D+
                    </span>

                    <div className="calendar-race-status">
                      🏃{" "}
                      {
                        getRaceAttendance(
                          race.id,
                          "participant"
                        ).length
                      }{" "}
                      · 📣{" "}
                      {
                        getRaceAttendance(
                          race.id,
                          "support"
                        ).length
                      }{" "}
                      · 💬{" "}
                      {getRaceCommentCount(
                        race.id
                      )}
                    </div>
                  </Link>
                ))}

                {dayTrainings.map(
                  (training) => (
                    <Link
                      key={training.id}
                      href={`/courses/training/${training.id}`}
                      className="calendar-training calendar-event-link"
                    >
                      <strong>
                        {training.title}
                      </strong>

                      <span>
                        {training.location} ·{" "}
                        {
                          training.duration_minutes
                        }{" "}
                        min
                      </span>

                      <div className="calendar-training-status">
                        🏃{" "}
                        {
                          getTrainingParticipants(
                            training.id
                          ).length
                        }{" "}
                        · 💬{" "}
                        {getTrainingCommentCount(
                          training.id
                        )}
                      </div>
                    </Link>
                  )
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* COURSES */}

      <section className="page-container race-list-section">
        <div className="courses-section-title">
          <div>
            <span>PROCHAINES COURSES</span>
            <h2>Sur la ligne de départ</h2>
          </div>
        </div>

        <div className="race-list">
          {races.map((race) => {
            const participants =
              getRaceAttendance(
                race.id,
                "participant"
              );

            const supporters =
              getRaceAttendance(
                race.id,
                "support"
              );

            const myStatus =
              getMyStatus(race.id);

            const isCreator =
              race.created_by === userId;

            const isEditing =
              editingRaceId === race.id;

            return (
              <article
                className="race-card"
                key={race.id}
              >
                <div className="race-card-date">
                  <strong>
                    {new Date(
                      `${race.race_date}T12:00:00`
                    ).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                      }
                    )}
                  </strong>

                  <span>
                    {new Date(
                      `${race.race_date}T12:00:00`
                    )
                      .toLocaleDateString(
                        "fr-FR",
                        {
                          month: "short",
                        }
                      )
                      .toUpperCase()}
                  </span>
                </div>

                <div className="race-card-main">
                  <p className="race-card-label">
                    COURSE
                  </p>

                  {isEditing ? (
                    <div className="race-edit-form">
                      <label>Nom</label>

                      <input
                        value={editName}
                        onChange={(e) =>
                          setEditName(
                            e.target.value
                          )
                        }
                      />

                      <div className="race-edit-grid">
                        <input
                          type="number"
                          value={editDistance}
                          onChange={(e) =>
                            setEditDistance(
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="number"
                          value={editElevation}
                          onChange={(e) =>
                            setEditElevation(
                              e.target.value
                            )
                          }
                        />

                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) =>
                            setEditDate(
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="race-edit-actions">
                        <button
                          onClick={() =>
                            updateRace(race.id)
                          }
                        >
                          Enregistrer
                        </button>

                        <button
                          className="race-edit-cancel"
                          onClick={cancelEditRace}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/courses/course/${race.id}`}
                        className="event-title-link"
                      >
                        <h3>{race.name}</h3>
                      </Link>

                      <div className="race-stats">
                        <div>
                          <span>DISTANCE</span>
                          <strong>
                            {race.distance} km
                          </strong>
                        </div>

                        <div>
                          <span>DÉNIVELÉ</span>
                          <strong>
                            {race.elevation} m+
                          </strong>
                        </div>
                      </div>

                      <Link
                        href={`/courses/course/${race.id}`}
                        className="event-comment-count"
                      >
                        💬{" "}
                        {getRaceCommentCount(
                          race.id
                        )}{" "}
                        commentaire
                        {getRaceCommentCount(
                          race.id
                        ) !== 1
                          ? "s"
                          : ""}
                      </Link>

                      {isCreator && (
                        <div className="race-owner-actions">
                          <button
                            onClick={() =>
                              startEditRace(
                                race
                              )
                            }
                          >
                            Modifier
                          </button>

                          <button
                            className="race-delete-button"
                            onClick={() =>
                              deleteRace(race.id)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="race-people">
                  <div className="race-people-group">
                    <span className="race-people-title">
                      🏃 PARTICIPANTS
                    </span>

                    <div className="race-names">
                      {participants.map(
                        (item) => (
                          <span
                            key={item.id}
                            className="race-person participant"
                          >
                            {getProfileName(
                              item.user_id
                            )}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div className="race-people-group">
                    <span className="race-people-title">
                      📣 SUPPORTERS
                    </span>

                    <div className="race-names">
                      {supporters.map(
                        (item) => (
                          <span
                            key={item.id}
                            className="race-person supporter"
                          >
                            {getProfileName(
                              item.user_id
                            )}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {userId && (
                  <div className="race-actions">
                    <button
                      className={`race-choice ${
                        myStatus ===
                        "participant"
                          ? "race-choice-active"
                          : ""
                      }`}
                      onClick={() =>
                        chooseStatus(
                          race.id,
                          "participant"
                        )
                      }
                    >
                      🏃 Je participe
                    </button>

                    <button
                      className={`race-choice ${
                        myStatus === "support"
                          ? "race-choice-active"
                          : ""
                      }`}
                      onClick={() =>
                        chooseStatus(
                          race.id,
                          "support"
                        )
                      }
                    >
                      📣 Je supporte
                    </button>

                    {myStatus && (
                      <button
                        className="race-remove"
                        onClick={() =>
                          removeStatus(race.id)
                        }
                      >
                        ×
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* SORTIES */}

      <section className="page-container training-list-section">
        <div className="courses-section-title">
          <div>
            <span>
              SORTIES / ENTRAÎNEMENTS
            </span>

            <h2>Les prochaines sorties</h2>
          </div>
        </div>

        <div className="training-list">
          {trainings.map((training) => {
            const participants =
              getTrainingParticipants(
                training.id
              );

            const joined =
              isParticipatingTraining(
                training.id
              );

            const isCreator =
              training.created_by === userId;

            const isEditing =
              editingTrainingId ===
              training.id;

            return (
              <article
                className="training-card"
                key={training.id}
              >
                <div className="training-card-date">
                  <strong>
                    {new Date(
                      `${training.training_date}T12:00:00`
                    ).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "2-digit",
                      }
                    )}
                  </strong>

                  <span>
                    {new Date(
                      `${training.training_date}T12:00:00`
                    )
                      .toLocaleDateString(
                        "fr-FR",
                        {
                          month: "short",
                        }
                      )
                      .toUpperCase()}
                  </span>
                </div>

                <div className="training-card-main">
                  <p className="training-card-label">
                    SORTIE / ENTRAÎNEMENT
                  </p>

                  {isEditing ? (
                    <div className="race-edit-form">
                      <label>Nom</label>

                      <input
                        value={editTrainingTitle}
                        onChange={(e) =>
                          setEditTrainingTitle(
                            e.target.value
                          )
                        }
                      />

                      <div className="race-edit-grid">
                        <div>
                          <label>Lieu</label>

                          <input
                            value={
                              editTrainingLocation
                            }
                            onChange={(e) =>
                              setEditTrainingLocation(
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>Durée</label>

                          <input
                            type="number"
                            value={
                              editTrainingDuration
                            }
                            onChange={(e) =>
                              setEditTrainingDuration(
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>Date</label>

                          <input
                            type="date"
                            value={
                              editTrainingDate
                            }
                            onChange={(e) =>
                              setEditTrainingDate(
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <label>
                        Niveau attendu
                      </label>

                      <select
                        value={editTrainingLevel}
                        onChange={(e) =>
                          setEditTrainingLevel(
                            e.target.value
                          )
                        }
                      >
                        <option value="<300">
                          &lt; 300
                        </option>
                        <option value="400">
                          400
                        </option>
                        <option value="500">
                          500
                        </option>
                        <option value="600">
                          600
                        </option>
                        <option value="700">
                          700
                        </option>
                        <option value="800">
                          800
                        </option>
                        <option value="900">
                          900
                        </option>
                        <option value="1000">
                          1000
                        </option>
                      </select>

                      <label>
                        Commentaire
                      </label>

                      <textarea
                        rows={4}
                        value={
                          editTrainingComment
                        }
                        onChange={(e) =>
                          setEditTrainingComment(
                            e.target.value
                          )
                        }
                      />

                      <div className="race-edit-actions">
                        <button
                          onClick={() =>
                            updateTraining(
                              training.id
                            )
                          }
                        >
                          Enregistrer
                        </button>

                        <button
                          className="race-edit-cancel"
                          onClick={
                            cancelEditTraining
                          }
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Link
                        href={`/courses/training/${training.id}`}
                        className="event-title-link"
                      >
                        <h3>
                          {training.title}
                        </h3>
                      </Link>

                      <div className="training-info-grid">
                        <div>
                          <span>LIEU</span>
                          <strong>
                            {training.location}
                          </strong>
                        </div>

                        <div>
                          <span>DURÉE</span>
                          <strong>
                            {
                              training.duration_minutes
                            }{" "}
                            min
                          </strong>
                        </div>

                        <div>
                          <span>
                            NIVEAU ATTENDU
                          </span>

                          <strong>
                            {training.expected_level ??
                              "Non défini"}
                          </strong>
                        </div>

                        <div>
                          <span>CRÉÉ PAR</span>

                          <strong>
                            {getProfileName(
                              training.created_by
                            )}
                          </strong>
                        </div>
                      </div>

                      {training.comment && (
                        <p className="training-comment">
                          {training.comment}
                        </p>
                      )}

                      <Link
                        href={`/courses/training/${training.id}`}
                        className="event-comment-count"
                      >
                        💬{" "}
                        {getTrainingCommentCount(
                          training.id
                        )}{" "}
                        commentaire
                        {getTrainingCommentCount(
                          training.id
                        ) !== 1
                          ? "s"
                          : ""}
                      </Link>

                      {isCreator && (
                        <div className="race-owner-actions">
                          <button
                            onClick={() =>
                              startEditTraining(
                                training
                              )
                            }
                          >
                            Modifier
                          </button>

                          <button
                            className="race-delete-button"
                            onClick={() =>
                              deleteTraining(
                                training.id
                              )
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      )}

                      <div className="training-participants">
                        <span className="race-people-title">
                          🏃 PARTICIPANTS
                        </span>

                        <div className="race-names">
                          {participants.map(
                            (item) => (
                              <span
                                key={item.id}
                                className="race-person participant"
                              >
                                {getProfileName(
                                  item.user_id
                                )}
                              </span>
                            )
                          )}
                        </div>
                      </div>

                      {userId && (
                        <div className="training-actions">
                          {!joined ? (
                            <button
                              className="race-choice"
                              onClick={() =>
                                joinTraining(
                                  training.id
                                )
                              }
                            >
                              🏃 Je participe
                            </button>
                          ) : (
                            <>
                              <button className="race-choice race-choice-active">
                                ✓ Je participe
                              </button>

                              <button
                                className="race-remove"
                                onClick={() =>
                                  leaveTraining(
                                    training.id
                                  )
                                }
                              >
                                ×
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}