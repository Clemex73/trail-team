"use client";

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
};

type TrainingAttendance = {
  id: string;
  training_id: string;
  user_id: string;
};

export default function CoursesPage() {
  const supabase = createClient();

  const [races, setRaces] = useState<Race[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [trainingAttendance, setTrainingAttendance] =
    useState<TrainingAttendance[]>([]);

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

    const { data: racesData, error: racesError } =
      await supabase
        .from("races")
        .select("*")
        .order("race_date", { ascending: true });

    if (racesError) {
      console.error("Erreur courses :", racesError);
    }

    const {
      data: attendanceData,
      error: attendanceError,
    } = await supabase
      .from("race_attendance")
      .select("*");

    if (attendanceError) {
      console.error(
        "Erreur participations courses :",
        attendanceError
      );
    }

    const {
      data: profilesData,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, nickname");

    if (profilesError) {
      console.error("Erreur profils :", profilesError);
    }

    const {
      data: trainingsData,
      error: trainingsError,
    } = await supabase
      .from("trainings")
      .select("*")
      .order("training_date", { ascending: true });

    if (trainingsError) {
      console.error("Erreur sorties :", trainingsError);
    }

    const {
      data: trainingAttendanceData,
      error: trainingAttendanceError,
    } = await supabase
      .from("training_attendance")
      .select("*");

    if (trainingAttendanceError) {
      console.error(
        "Erreur participations sorties :",
        trainingAttendanceError
      );
    }

    setRaces((racesData ?? []) as Race[]);
    setAttendance((attendanceData ?? []) as Attendance[]);
    setProfiles((profilesData ?? []) as Profile[]);

    setTrainings((trainingsData ?? []) as Training[]);

    setTrainingAttendance(
      (trainingAttendanceData ?? []) as TrainingAttendance[]
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
      console.error("Erreur ajout course :", error);
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
      !trainingDate
    ) {
      alert(
        "Merci de remplir le nom, le lieu, la durée et la date."
      );
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
        created_by: userId,
      });

    setSavingTraining(false);

    if (error) {
      console.error("Erreur ajout sortie :", error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    setTrainingTitle("");
    setTrainingLocation("");
    setTrainingDuration("");
    setTrainingDate("");
    setTrainingComment("");

    await loadEverything();
  }

  /* ======================================================
     PARTICIPER / SUPPORTER COURSE
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
      console.error(error);
      alert("Impossible d'enregistrer ton choix.");
      return;
    }

    await loadEverything();
  }

  async function removeStatus(raceId: string) {
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from("race_attendance")
      .delete()
      .eq("race_id", raceId)
      .eq("user_id", userId);

    if (error) {
      console.error(error);
      alert("Impossible de retirer ta participation.");
      return;
    }

    await loadEverything();
  }

  /* ======================================================
     PARTICIPER SORTIE
  ====================================================== */

  async function joinTraining(trainingId: string) {
    if (!userId) {
      alert("Tu dois être connecté pour participer.");
      return;
    }

    const alreadyJoined = trainingAttendance.some(
      (item) =>
        item.training_id === trainingId &&
        item.user_id === userId
    );

    if (alreadyJoined) {
      return;
    }

    const { error } = await supabase
      .from("training_attendance")
      .insert({
        training_id: trainingId,
        user_id: userId,
      });

    if (error) {
      console.error(
        "Erreur participation sortie :",
        error
      );

      alert(
        `Impossible de participer à cette sortie : ${error.message}`
      );

      return;
    }

    await loadEverything();
  }

  async function leaveTraining(trainingId: string) {
    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from("training_attendance")
      .delete()
      .eq("training_id", trainingId)
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Erreur retrait participation :",
        error
      );

      alert(
        `Impossible de retirer ta participation : ${error.message}`
      );

      return;
    }

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

    setEditName("");
    setEditDistance("");
    setEditElevation("");
    setEditDate("");
  }

  async function updateRace(raceId: string) {
    if (!userId) {
      return;
    }

    if (
      !editName.trim() ||
      !editDistance ||
      !editElevation ||
      !editDate
    ) {
      alert("Merci de remplir tous les champs.");
      return;
    }

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
      console.error("Erreur modification :", error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    cancelEditRace();

    await loadEverything();
  }

  /* ======================================================
     SUPPRIMER COURSE
  ====================================================== */

  async function deleteRace(raceId: string) {
    if (!userId) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer cette course ? Les participations et supporters associés seront également supprimés."
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("races")
      .delete()
      .eq("id", raceId)
      .eq("created_by", userId);

    if (error) {
      console.error("Erreur suppression :", error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    if (editingRaceId === raceId) {
      cancelEditRace();
    }

    await loadEverything();
  }

  /* ======================================================
     MODIFIER SORTIE
  ====================================================== */

  function startEditTraining(training: Training) {
    setEditingTrainingId(training.id);

    setEditTrainingTitle(training.title);

    setEditTrainingLocation(
      training.location
    );

    setEditTrainingDuration(
      String(training.duration_minutes)
    );

    setEditTrainingDate(
      training.training_date
    );

    setEditTrainingComment(
      training.comment ?? ""
    );
  }

  function cancelEditTraining() {
    setEditingTrainingId(null);

    setEditTrainingTitle("");
    setEditTrainingLocation("");
    setEditTrainingDuration("");
    setEditTrainingDate("");
    setEditTrainingComment("");
  }

  async function updateTraining(
    trainingId: string
  ) {
    if (!userId) {
      return;
    }

    if (
      !editTrainingTitle.trim() ||
      !editTrainingLocation.trim() ||
      !editTrainingDuration ||
      !editTrainingDate
    ) {
      alert(
        "Merci de remplir le nom, le lieu, la durée et la date."
      );

      return;
    }

    const { error } = await supabase
      .from("trainings")
      .update({
        title: editTrainingTitle.trim(),

        location:
          editTrainingLocation.trim(),

        duration_minutes: Number(
          editTrainingDuration
        ),

        training_date:
          editTrainingDate,

        comment:
          editTrainingComment.trim() ||
          null,
      })
      .eq("id", trainingId)
      .eq("created_by", userId);

    if (error) {
      console.error(
        "Erreur modification sortie :",
        error
      );

      alert(`Erreur : ${error.message}`);

      return;
    }

    cancelEditTraining();

    await loadEverything();
  }

  /* ======================================================
     SUPPRIMER SORTIE
  ====================================================== */

  async function deleteTraining(
    trainingId: string
  ) {
    if (!userId) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer cette sortie ? Les participations associées seront également supprimées."
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("trainings")
      .delete()
      .eq("id", trainingId)
      .eq("created_by", userId);

    if (error) {
      console.error(
        "Erreur suppression sortie :",
        error
      );

      alert(`Erreur : ${error.message}`);

      return;
    }

    if (editingTrainingId === trainingId) {
      cancelEditTraining();
    }

    await loadEverything();
  }

  /* ======================================================
     PROFILS
  ====================================================== */

  function getProfileName(profileId: string) {
    const profile = profiles.find(
      (profile) =>
        profile.id === profileId
    );

    if (!profile) {
      return "Membre";
    }

    if (profile.nickname) {
      return profile.nickname;
    }

    const fullName = [
      profile.first_name,
      profile.last_name,
    ]
      .filter(Boolean)
      .join(" ");

    return fullName || "Membre";
  }

  /* ======================================================
     PARTICIPATIONS COURSES
  ====================================================== */

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
    if (!userId) {
      return null;
    }

    return attendance.find(
      (item) =>
        item.race_id === raceId &&
        item.user_id === userId
    )?.status;
  }

  /* ======================================================
     PARTICIPATIONS SORTIES
  ====================================================== */

  function getTrainingParticipants(
    trainingId: string
  ) {
    return trainingAttendance.filter(
      (item) =>
        item.training_id === trainingId
    );
  }

  function isParticipatingTraining(
    trainingId: string
  ) {
    if (!userId) {
      return false;
    }

    return trainingAttendance.some(
      (item) =>
        item.training_id === trainingId &&
        item.user_id === userId
    );
  }

  /* ======================================================
     CALENDRIER
  ====================================================== */

  const calendarDays = useMemo(() => {
    const year =
      currentMonth.getFullYear();

    const month =
      currentMonth.getMonth();

    const firstDay =
      new Date(year, month, 1);

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    let firstWeekDay =
      firstDay.getDay();

    if (firstWeekDay === 0) {
      firstWeekDay = 7;
    }

    const result:
      Array<number | null> = [];

    for (
      let i = 1;
      i < firstWeekDay;
      i++
    ) {
      result.push(null);
    }

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
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

  function racesForDay(day: number) {
    const year =
      currentMonth.getFullYear();

    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    const formattedDay =
      String(day).padStart(2, "0");

    const date =
      `${year}-${month}-${formattedDay}`;

    return races.filter(
      (race) =>
        race.race_date === date
    );
  }

  function trainingsForDay(
    day: number
  ) {
    const year =
      currentMonth.getFullYear();

    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    const formattedDay =
      String(day).padStart(2, "0");

    const date =
      `${year}-${month}-${formattedDay}`;

    return trainings.filter(
      (training) =>
        training.training_date === date
    );
  }

  /* ======================================================
     CHARGEMENT
  ====================================================== */

  if (loading) {
    return (
      <main className="page-container">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="courses-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

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
            Choisis ton prochain défi ou rejoins une sortie.
          </p>
        </div>
      </section>

      {/* ======================================================
          AJOUT COURSE
      ====================================================== */}

      <section className="page-container">
        <div className="race-create">
          <div className="race-create-heading">
            <span>
              AJOUTER UNE COURSE
            </span>

            <h2>
              Un nouvel objectif ?
            </h2>

            <p>
              Ajoute une course au calendrier du team.
            </p>
          </div>

          {userId ? (
            <form
              className="race-form"
              onSubmit={addRace}
            >
              <div className="race-form-name">
                <label>
                  Nom de la course
                </label>

                <input
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Trail des Aiguilles..."
                />
              </div>

              <div>
                <label>
                  Distance
                </label>

                <div className="race-input-unit">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={distance}
                    onChange={(event) =>
                      setDistance(
                        event.target.value
                      )
                    }
                    placeholder="42"
                  />

                  <span>KM</span>
                </div>
              </div>

              <div>
                <label>D+</label>

                <div className="race-input-unit">
                  <input
                    type="number"
                    min="0"
                    value={elevation}
                    onChange={(event) =>
                      setElevation(
                        event.target.value
                      )
                    }
                    placeholder="2500"
                  />

                  <span>M</span>
                </div>
              </div>

              <div>
                <label>Date</label>

                <input
                  type="date"
                  value={raceDate}
                  onChange={(event) =>
                    setRaceDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="race-submit"
              >
                {saving
                  ? "Ajout..."
                  : "Ajouter la course"}
              </button>
            </form>
          ) : (
            <div className="race-login-message">
              Connecte-toi pour ajouter une course.
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          AJOUT SORTIE
      ====================================================== */}

      <section className="page-container">
        <div className="training-create">
          <div className="training-create-heading">
            <span>
              AJOUTER UNE SORTIE
            </span>

            <h2>
              Une sortie prévue ?
            </h2>

            <p>
              Propose un entraînement ou une sortie au reste du team.
            </p>
          </div>

          {userId ? (
            <form
              className="training-form"
              onSubmit={addTraining}
            >
              <div className="training-form-title">
                <label>
                  Nom de la sortie
                </label>

                <input
                  value={trainingTitle}
                  onChange={(event) =>
                    setTrainingTitle(
                      event.target.value
                    )
                  }
                  placeholder="Sortie trail du dimanche..."
                />
              </div>

              <div>
                <label>Lieu</label>

                <input
                  value={trainingLocation}
                  onChange={(event) =>
                    setTrainingLocation(
                      event.target.value
                    )
                  }
                  placeholder="Saint-Jean-de-Maurienne"
                />
              </div>

              <div>
                <label>Durée</label>

                <div className="race-input-unit">
                  <input
                    type="number"
                    min="1"
                    value={trainingDuration}
                    onChange={(event) =>
                      setTrainingDuration(
                        event.target.value
                      )
                    }
                    placeholder="120"
                  />

                  <span>MIN</span>
                </div>
              </div>

              <div>
                <label>Date</label>

                <input
                  type="date"
                  value={trainingDate}
                  onChange={(event) =>
                    setTrainingDate(
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="training-form-comment">
                <label>
                  Commentaire
                </label>

                <textarea
                  value={trainingComment}
                  onChange={(event) =>
                    setTrainingComment(
                      event.target.value
                    )
                  }
                  placeholder="Départ 8h, allure tranquille, prévoir de l'eau..."
                  rows={4}
                />
              </div>

              <button
                type="submit"
                disabled={savingTraining}
                className="training-submit"
              >
                {savingTraining
                  ? "Ajout..."
                  : "Ajouter la sortie"}
              </button>
            </form>
          ) : (
            <div className="race-login-message">
              Connecte-toi pour ajouter une sortie.
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CALENDRIER
      ====================================================== */}

      <section className="page-container courses-calendar-section">
        <div className="courses-section-title">
          <div>
            <span>CALENDRIER</span>

            <h2>
              Les rendez-vous du team
            </h2>
          </div>

          <div className="calendar-controls">
            <button
              type="button"
              onClick={previousMonth}
            >
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

            <button
              type="button"
              onClick={nextMonth}
            >
              →
            </button>
          </div>
        </div>

        <div className="race-calendar">
          <div className="calendar-weekday">
            LUN
          </div>

          <div className="calendar-weekday">
            MAR
          </div>

          <div className="calendar-weekday">
            MER
          </div>

          <div className="calendar-weekday">
            JEU
          </div>

          <div className="calendar-weekday">
            VEN
          </div>

          <div className="calendar-weekday">
            SAM
          </div>

          <div className="calendar-weekday">
            DIM
          </div>

          {calendarDays.map(
            (day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="calendar-day calendar-empty"
                  />
                );
              }

              const dayRaces =
                racesForDay(day);

              const dayTrainings =
                trainingsForDay(day);

              return (
                <div
                  key={day}
                  className={`calendar-day ${
                    dayRaces.length ||
                    dayTrainings.length
                      ? "calendar-day-race"
                      : ""
                  }`}
                >
                  <span className="calendar-number">
                    {day}
                  </span>

                  {dayRaces.map(
                    (race) => (
                      <div
                        key={race.id}
                        className="calendar-race"
                      >
                        <strong>
                          {race.name}
                        </strong>

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
                          }

                          <span>·</span>

                          📣{" "}
                          {
                            getRaceAttendance(
                              race.id,
                              "support"
                            ).length
                          }
                        </div>
                      </div>
                    )
                  )}

                  {dayTrainings.map(
                    (training) => (
                      <div
                        key={training.id}
                        className="calendar-training"
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
                          }
                        </div>
                      </div>
                    )
                  )}
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* ======================================================
          LISTE COURSES
      ====================================================== */}

      <section className="page-container race-list-section">
        <div className="courses-section-title">
          <div>
            <span>
              PROCHAINES COURSES
            </span>

            <h2>
              Sur la ligne de départ
            </h2>
          </div>
        </div>

        <div className="race-list">
          {races.length === 0 && (
            <div className="no-races">
              Aucune course pour le moment.
            </div>
          )}

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
                      <div>
                        <label>Nom</label>

                        <input
                          value={editName}
                          onChange={(event) =>
                            setEditName(
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="race-edit-grid">
                        <div>
                          <label>
                            Distance
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={editDistance}
                            onChange={(event) =>
                              setEditDistance(
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>D+</label>

                          <input
                            type="number"
                            min="0"
                            value={editElevation}
                            onChange={(event) =>
                              setEditElevation(
                                event.target.value
                              )
                            }
                          />
                        </div>

                        <div>
                          <label>Date</label>

                          <input
                            type="date"
                            value={editDate}
                            onChange={(event) =>
                              setEditDate(
                                event.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="race-edit-actions">
                        <button
                          type="button"
                          onClick={() =>
                            updateRace(
                              race.id
                            )
                          }
                        >
                          Enregistrer
                        </button>

                        <button
                          type="button"
                          className="race-edit-cancel"
                          onClick={
                            cancelEditRace
                          }
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3>
                        {race.name}
                      </h3>

                      <div className="race-stats">
                        <div>
                          <span>
                            DISTANCE
                          </span>

                          <strong>
                            {
                              race.distance
                            }{" "}
                            km
                          </strong>
                        </div>

                        <div>
                          <span>
                            DÉNIVELÉ
                          </span>

                          <strong>
                            {
                              race.elevation
                            }{" "}
                            m+
                          </strong>
                        </div>
                      </div>

                      {isCreator && (
                        <div className="race-owner-actions">
                          <button
                            type="button"
                            onClick={() =>
                              startEditRace(
                                race
                              )
                            }
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
                            className="race-delete-button"
                            onClick={() =>
                              deleteRace(
                                race.id
                              )
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
                      {participants.length ===
                      0 ? (
                        <span className="race-empty">
                          Aucun pour le moment
                        </span>
                      ) : (
                        participants.map(
                          (item) => (
                            <span
                              key={
                                item.id
                              }
                              className="race-person participant"
                            >
                              {getProfileName(
                                item.user_id
                              )}
                            </span>
                          )
                        )
                      )}
                    </div>
                  </div>

                  <div className="race-people-group">
                    <span className="race-people-title">
                      📣 SUPPORTERS
                    </span>

                    <div className="race-names">
                      {supporters.length ===
                      0 ? (
                        <span className="race-empty">
                          Aucun pour le moment
                        </span>
                      ) : (
                        supporters.map(
                          (item) => (
                            <span
                              key={
                                item.id
                              }
                              className="race-person supporter"
                            >
                              {getProfileName(
                                item.user_id
                              )}
                            </span>
                          )
                        )
                      )}
                    </div>
                  </div>
                </div>

                {userId && (
                  <div className="race-actions">
                    <button
                      type="button"
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
                      type="button"
                      className={`race-choice ${
                        myStatus ===
                        "support"
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
                        type="button"
                        className="race-remove"
                        onClick={() =>
                          removeStatus(
                            race.id
                          )
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

      {/* ======================================================
          LISTE SORTIES / ENTRAINEMENTS
      ====================================================== */}

      <section className="page-container training-list-section">
        <div className="courses-section-title">
          <div>
            <span>
              SORTIES / ENTRAÎNEMENTS
            </span>

            <h2>
              Les prochaines sorties
            </h2>
          </div>
        </div>

        <div className="training-list">
          {trainings.length === 0 && (
            <div className="no-races">
              Aucune sortie prévue pour le moment.
            </div>
          )}

          {trainings.map(
            (training) => {
              const participants =
                getTrainingParticipants(
                  training.id
                );

              const isParticipating =
                isParticipatingTraining(
                  training.id
                );

              const isCreator =
                training.created_by ===
                userId;

              const isEditing =
                editingTrainingId ===
                training.id;

              return (
                <article
                  className="training-card"
                  key={training.id}
                >
                  {/* DATE */}

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
                            month:
                              "short",
                          }
                        )
                        .toUpperCase()}
                    </span>
                  </div>

                  {/* CONTENU */}

                  <div className="training-card-main">
                    <p className="training-card-label">
                      SORTIE / ENTRAÎNEMENT
                    </p>

                    {isEditing ? (
                      <div className="race-edit-form">
                        <div>
                          <label>
                            Nom
                          </label>

                          <input
                            value={
                              editTrainingTitle
                            }
                            onChange={(
                              event
                            ) =>
                              setEditTrainingTitle(
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="race-edit-grid">
                          <div>
                            <label>
                              Lieu
                            </label>

                            <input
                              value={
                                editTrainingLocation
                              }
                              onChange={(
                                event
                              ) =>
                                setEditTrainingLocation(
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </div>

                          <div>
                            <label>
                              Durée
                            </label>

                            <input
                              type="number"
                              min="1"
                              value={
                                editTrainingDuration
                              }
                              onChange={(
                                event
                              ) =>
                                setEditTrainingDuration(
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </div>

                          <div>
                            <label>
                              Date
                            </label>

                            <input
                              type="date"
                              value={
                                editTrainingDate
                              }
                              onChange={(
                                event
                              ) =>
                                setEditTrainingDate(
                                  event
                                    .target
                                    .value
                                )
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label>
                            Commentaire
                          </label>

                          <textarea
                            rows={4}
                            value={
                              editTrainingComment
                            }
                            onChange={(
                              event
                            ) =>
                              setEditTrainingComment(
                                event
                                  .target
                                  .value
                              )
                            }
                          />
                        </div>

                        <div className="race-edit-actions">
                          <button
                            type="button"
                            onClick={() =>
                              updateTraining(
                                training.id
                              )
                            }
                          >
                            Enregistrer
                          </button>

                          <button
                            type="button"
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
                        <h3>
                          {
                            training.title
                          }
                        </h3>

                        <div className="training-info-grid">
                          <div>
                            <span>
                              LIEU
                            </span>

                            <strong>
                              {
                                training.location
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              DURÉE
                            </span>

                            <strong>
                              {
                                training.duration_minutes
                              }{" "}
                              min
                            </strong>
                          </div>

                          <div>
                            <span>
                              CRÉÉ PAR
                            </span>

                            <strong>
                              {getProfileName(
                                training.created_by
                              )}
                            </strong>
                          </div>
                        </div>

                        {training.comment && (
                          <p className="training-comment">
                            {
                              training.comment
                            }
                          </p>
                        )}

                        {isCreator && (
                          <div className="race-owner-actions">
                            <button
                              type="button"
                              onClick={() =>
                                startEditTraining(
                                  training
                                )
                              }
                            >
                              Modifier
                            </button>

                            <button
                              type="button"
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
                            {participants.length ===
                            0 ? (
                              <span className="race-empty">
                                Aucun pour le moment
                              </span>
                            ) : (
                              participants.map(
                                (item) => (
                                  <span
                                    key={
                                      item.id
                                    }
                                    className="race-person participant"
                                  >
                                    {getProfileName(
                                      item.user_id
                                    )}
                                  </span>
                                )
                              )
                            )}
                          </div>
                        </div>

                        {userId && (
                          <div className="training-actions">
                            {!isParticipating ? (
                              <button
                                type="button"
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
                                <button
                                  type="button"
                                  className="race-choice race-choice-active"
                                  disabled
                                >
                                  ✓ Je participe
                                </button>

                                <button
                                  type="button"
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
            }
          )}
        </div>
      </section>
    </main>
  );
}