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

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
  is_admin: boolean;
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

type NewRaceOption = {
  name: string;
  distance: string;
  elevation: string;
};

export default function CoursesPage() {
  const supabase = createClient();

  const [races, setRaces] = useState<Race[]>([]);
  const [raceOptions, setRaceOptions] = useState<RaceOption[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  const [trainings, setTrainings] = useState<Training[]>([]);
  const [trainingAttendance, setTrainingAttendance] =
    useState<TrainingAttendance[]>([]);

  const [comments, setComments] = useState<EventComment[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [showRaceCreate, setShowRaceCreate] = useState(false);
  const [showTrainingCreate, setShowTrainingCreate] = useState(false);

  /* ======================================================
     CREATION COURSE
  ====================================================== */

  const [name, setName] = useState("");
  const [raceLocation, setRaceLocation] = useState("");
  const [raceDate, setRaceDate] = useState("");

  const [newRaceOptions, setNewRaceOptions] = useState<NewRaceOption[]>([
    {
      name: "",
      distance: "",
      elevation: "",
    },
  ]);

  const [raceImage, setRaceImage] = useState<File | null>(null);
  const [raceImagePreview, setRaceImagePreview] =
    useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  /* ======================================================
     CREATION ENTRAINEMENT
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

  const [editRaceName, setEditRaceName] = useState("");
  const [editRaceLocation, setEditRaceLocation] = useState("");
  const [editRaceDate, setEditRaceDate] = useState("");

  const [editOptions, setEditOptions] = useState<RaceOption[]>([]);

  const [editRaceImage, setEditRaceImage] =
    useState<File | null>(null);

  const [editRaceImagePreview, setEditRaceImagePreview] =
    useState<string | null>(null);

  /* ======================================================
     EDITION ENTRAINEMENT
  ====================================================== */

  const [editingTrainingId, setEditingTrainingId] =
    useState<string | null>(null);

  const [editTrainingTitle, setEditTrainingTitle] = useState("");
  const [editTrainingLocation, setEditTrainingLocation] = useState("");
  const [editTrainingDuration, setEditTrainingDuration] = useState("");
  const [editTrainingDate, setEditTrainingDate] = useState("");
  const [editTrainingComment, setEditTrainingComment] = useState("");
  const [editTrainingLevel, setEditTrainingLevel] = useState("<300");

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

    const { data: raceOptionsData } = await supabase
      .from("race_options")
      .select("*")
      .order("distance", { ascending: true });

    const { data: attendanceData } = await supabase
      .from("race_attendance")
      .select("*");

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, nickname, is_admin");

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
    setRaceOptions((raceOptionsData ?? []) as RaceOption[]);
    setAttendance((attendanceData ?? []) as Attendance[]);
    setProfiles((profilesData ?? []) as Profile[]);
    setTrainings((trainingsData ?? []) as Training[]);

    setTrainingAttendance(
      (trainingAttendanceData ?? []) as TrainingAttendance[]
    );

    setComments(
      (commentsData ?? []) as EventComment[]
    );

    setLoading(false);
  }

  /* ======================================================
     OUTILS PROFIL
  ====================================================== */

  function getProfileName(profileId: string) {
    const profile = profiles.find(
      (profile) => profile.id === profileId
    );

    if (!profile) {
      return "Membre";
    }

    if (profile.nickname) {
      return profile.nickname;
    }

    return (
      [profile.first_name, profile.last_name]
        .filter(Boolean)
        .join(" ") || "Membre"
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

  function canManageRace(race: Race) {
    if (!userId) {
      return false;
    }

    return (
      race.created_by === userId ||
      isCurrentUserAdmin()
    );
  }

  /* ======================================================
     FORMATS COURSE
  ====================================================== */

  function getRaceOptions(raceId: string) {
    return raceOptions.filter(
      (option) => option.race_id === raceId
    );
  }

  function addRaceOptionField() {
    setNewRaceOptions((current) => [
      ...current,
      {
        name: "",
        distance: "",
        elevation: "",
      },
    ]);
  }

  function updateNewRaceOption(
    index: number,
    field: keyof NewRaceOption,
    value: string
  ) {
    setNewRaceOptions((current) =>
      current.map((option, currentIndex) =>
        currentIndex === index
          ? {
              ...option,
              [field]: value,
            }
          : option
      )
    );
  }

  function removeRaceOptionField(index: number) {
    if (newRaceOptions.length === 1) {
      return;
    }

    setNewRaceOptions((current) =>
      current.filter(
        (_, currentIndex) => currentIndex !== index
      )
    );
  }

  /* ======================================================
     IMAGE COURSE
  ====================================================== */

  function handleRaceImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Merci de sélectionner une image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    if (raceImagePreview) {
      URL.revokeObjectURL(raceImagePreview);
    }

    setRaceImage(file);
    setRaceImagePreview(URL.createObjectURL(file));
  }

  function handleEditRaceImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setEditRaceImage(file);

    if (
      editRaceImagePreview &&
      editRaceImagePreview.startsWith("blob:")
    ) {
      URL.revokeObjectURL(editRaceImagePreview);
    }

    setEditRaceImagePreview(
      URL.createObjectURL(file)
    );
  }

  async function uploadRaceImage(file: File) {
    if (!userId) {
      throw new Error("Utilisateur non connecté.");
    }

    const extension =
      file.name.split(".").pop() ?? "jpg";

    const path =
      `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("race-images")
      .upload(path, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("race-images")
      .getPublicUrl(path);

    return data.publicUrl;
  }

  /* ======================================================
     AJOUT COURSE
  ====================================================== */

  async function addRace(event: React.FormEvent) {
    event.preventDefault();

    if (!userId) {
      alert("Tu dois être connecté.");
      return;
    }

    if (
      !name.trim() ||
      !raceLocation.trim() ||
      !raceDate
    ) {
      alert("Merci de remplir le nom, le lieu et la date.");
      return;
    }

    const validOptions = newRaceOptions.filter(
      (option) =>
        option.distance &&
        option.elevation
    );

    if (validOptions.length === 0) {
      alert("Ajoute au moins un format de course.");
      return;
    }

    setSaving(true);

    try {
      let imageUrl: string | null = null;

      if (raceImage) {
        imageUrl = await uploadRaceImage(raceImage);
      }

      const firstOption = validOptions[0];

      const {
        data: raceData,
        error: raceError,
      } = await supabase
        .from("races")
        .insert({
          name: name.trim(),
          location: raceLocation.trim(),
          race_date: raceDate,

          // anciennes colonnes conservées pour compatibilité
          distance: Number(firstOption.distance),
          elevation: Number(firstOption.elevation),

          image_url: imageUrl,
          created_by: userId,
        })
        .select("id")
        .single();

      if (raceError) {
        throw raceError;
      }

      const optionsToInsert =
        validOptions.map((option) => ({
          race_id: raceData.id,

          name:
            option.name.trim() || null,

          distance:
            Number(option.distance),

          elevation:
            Number(option.elevation),
        }));

      const { error: optionsError } =
        await supabase
          .from("race_options")
          .insert(optionsToInsert);

      if (optionsError) {
        throw optionsError;
      }

      setName("");
      setRaceLocation("");
      setRaceDate("");

      setNewRaceOptions([
        {
          name: "",
          distance: "",
          elevation: "",
        },
      ]);

      setRaceImage(null);
      setRaceImagePreview(null);

      setShowRaceCreate(false);

      await loadEverything();
    } catch (error: any) {
      console.error(error);

      alert(
        `Erreur : ${
          error?.message ??
          "Impossible d'ajouter l'événement."
        }`
      );
    } finally {
      setSaving(false);
    }
  }

  /* ======================================================
     PARTICIPATION COURSE
  ====================================================== */

  async function participateRaceOption(
    raceId: string,
    raceOptionId: string
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
          race_option_id: raceOptionId,
          user_id: userId,
          status: "participant",
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

  async function supportRace(raceId: string) {
    if (!userId) {
      alert("Tu dois être connecté.");
      return;
    }

    const { error } = await supabase
      .from("race_attendance")
      .upsert(
        {
          race_id: raceId,
          race_option_id: null,
          user_id: userId,
          status: "support",
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

  async function removeRaceAttendance(raceId: string) {
    if (!userId) return;

    await supabase
      .from("race_attendance")
      .delete()
      .eq("race_id", raceId)
      .eq("user_id", userId);

    await loadEverything();
  }

  function getRaceParticipants(raceId: string) {
    return attendance.filter(
      (item) =>
        item.race_id === raceId &&
        item.status === "participant"
    );
  }

  function getRaceSupporters(raceId: string) {
    return attendance.filter(
      (item) =>
        item.race_id === raceId &&
        item.status === "support"
    );
  }

  function getOptionParticipants(optionId: string) {
    return attendance.filter(
      (item) =>
        item.race_option_id === optionId &&
        item.status === "participant"
    );
  }

  function getMyRaceAttendance(raceId: string) {
    return attendance.find(
      (item) =>
        item.race_id === raceId &&
        item.user_id === userId
    );
  }

  /* ======================================================
     MODIFICATION COURSE
  ====================================================== */

  function startEditRace(race: Race) {
    setEditingRaceId(race.id);

    setEditRaceName(race.name);
    setEditRaceLocation(race.location ?? "");
    setEditRaceDate(race.race_date);

    setEditOptions(
      getRaceOptions(race.id).map((option) => ({
        ...option,
      }))
    );

    setEditRaceImage(null);
    setEditRaceImagePreview(race.image_url);
  }

  function cancelEditRace() {
    setEditingRaceId(null);
    setEditOptions([]);
    setEditRaceImage(null);
    setEditRaceImagePreview(null);
  }

  function updateEditOption(
    optionId: string,
    field: "name" | "distance" | "elevation",
    value: string
  ) {
    setEditOptions((current) =>
      current.map((option) =>
        option.id === optionId
          ? {
              ...option,
              [field]:
                field === "name"
                  ? value
                  : Number(value),
            }
          : option
      )
    );
  }

  async function addOptionToExistingRace(raceId: string) {
    const { data, error } =
      await supabase
        .from("race_options")
        .insert({
          race_id: raceId,
          name: null,
          distance: 1,
          elevation: 0,
        })
        .select("*")
        .single();

    if (error) {
      alert(error.message);
      return;
    }

    setEditOptions((current) => [
      ...current,
      data as RaceOption,
    ]);
  }

  async function deleteExistingOption(optionId: string) {
    if (editOptions.length <= 1) {
      alert(
        "Un événement doit conserver au moins un format."
      );
      return;
    }

    const confirmed = window.confirm(
      "Supprimer ce format ? Les participations sur ce format seront également supprimées."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("race_options")
      .delete()
      .eq("id", optionId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditOptions((current) =>
      current.filter(
        (option) => option.id !== optionId
      )
    );
  }

  async function updateRace(race: Race) {
    if (!userId) return;

    try {
      let imageUrl =
        race.image_url;

      if (editRaceImage) {
        imageUrl =
          await uploadRaceImage(editRaceImage);
      }

      const firstOption =
        editOptions[0];

      let raceUpdateQuery =
        supabase
          .from("races")
          .update({
            name:
              editRaceName.trim(),

            location:
              editRaceLocation.trim(),

            race_date:
              editRaceDate,

            image_url:
              imageUrl,

            // compatibilité ancienne structure
            distance:
              firstOption?.distance ??
              race.distance,

            elevation:
              firstOption?.elevation ??
              race.elevation,
          })
          .eq("id", race.id);

      // Un membre normal ne peut modifier que sa course.
      // L'admin peut modifier n'importe quelle course.
      if (!isCurrentUserAdmin()) {
        raceUpdateQuery =
          raceUpdateQuery.eq(
            "created_by",
            userId
          );
      }

      const { error: raceError } =
        await raceUpdateQuery;

      if (raceError) {
        throw raceError;
      }

      for (const option of editOptions) {
        const { error } = await supabase
          .from("race_options")
          .update({
            name:
              option.name?.trim() ||
              null,

            distance:
              Number(option.distance),

            elevation:
              Number(option.elevation),
          })
          .eq("id", option.id);

        if (error) {
          throw error;
        }
      }

      cancelEditRace();

      await loadEverything();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function deleteRace(raceId: string) {
    if (!userId) return;

    if (
      !window.confirm(
        "Supprimer complètement cet événement ?"
      )
    ) {
      return;
    }

    let deleteQuery =
      supabase
        .from("races")
        .delete()
        .eq("id", raceId);

    // Un membre normal ne peut supprimer que sa course.
    // L'admin peut supprimer n'importe quelle course.
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

    await loadEverything();
  }

  /* ======================================================
     ENTRAINEMENTS
  ====================================================== */

  async function addTraining(event: React.FormEvent) {
    event.preventDefault();

    if (!userId) return;

    const { error } = await supabase
      .from("trainings")
      .insert({
        title: trainingTitle.trim(),
        location: trainingLocation.trim(),
        duration_minutes:
          Number(trainingDuration),
        training_date:
          trainingDate,
        comment:
          trainingComment.trim() ||
          null,
        expected_level:
          trainingLevel,
        created_by:
          userId,
      });

    if (error) {
      alert(error.message);
      return;
    }

    setTrainingTitle("");
    setTrainingLocation("");
    setTrainingDuration("");
    setTrainingDate("");
    setTrainingComment("");
    setTrainingLevel("<300");

    setShowTrainingCreate(false);

    await loadEverything();
  }

  function getTrainingParticipants(trainingId: string) {
    return trainingAttendance.filter(
      (item) =>
        item.training_id === trainingId
    );
  }

  function isParticipatingTraining(trainingId: string) {
    return trainingAttendance.some(
      (item) =>
        item.training_id === trainingId &&
        item.user_id === userId
    );
  }

  async function joinTraining(trainingId: string) {
    if (!userId) return;

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
        title:
          editTrainingTitle.trim(),

        location:
          editTrainingLocation.trim(),

        duration_minutes:
          Number(editTrainingDuration),

        training_date:
          editTrainingDate,

        comment:
          editTrainingComment.trim() ||
          null,

        expected_level:
          editTrainingLevel,
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
     COMMENTAIRES
  ====================================================== */

  function getRaceCommentCount(raceId: string) {
    return comments.filter(
      (comment) =>
        comment.race_id === raceId
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

  function getCalendarDate(day: number) {
    const year =
      currentMonth.getFullYear();

    const month = String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0");

    return `${year}-${month}-${String(
      day
    ).padStart(2, "0")}`;
  }

  function racesForDay(day: number) {
    const date =
      getCalendarDate(day);

    return races.filter(
      (race) =>
        race.race_date === date
    );
  }

  function trainingsForDay(day: number) {
    const date =
      getCalendarDate(day);

    return trainings.filter(
      (training) =>
        training.training_date ===
        date
    );
  }

  if (loading) {
    return (
      <main className="page-container">
        Chargement...
      </main>
    );
  }

  return (
    <main className="courses-page">

      {/* ==================================================
          HEADER
      ================================================== */}

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

      {/* ==================================================
          AJOUTER UNE COURSE / UN ENTRAINEMENT
      ================================================== */}

      {userId && (
        <section className="page-container">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setShowRaceCreate((current) => !current);
                setShowTrainingCreate(false);
              }}
              className="group flex min-h-[118px] w-full items-center gap-4 rounded-2xl !border !border-violet-200 !bg-white p-4 text-left !text-[#28134d] shadow-md transition hover:-translate-y-0.5 hover:!border-violet-400 hover:!bg-violet-50 hover:shadow-lg"
            >
              <img
                src="/add-race.png"
                alt=""
                className="h-20 w-20 shrink-0 object-contain md:h-24 md:w-24"
              />

              <div className="min-w-0 flex-1">
                <span className="block text-[0.62rem] font-black tracking-[0.18em] !text-violet-700">
                  COURSE
                </span>

                <strong className="mt-1 block text-lg font-black !text-[#28134d] md:text-xl">
                  Ajouter une course
                </strong>

                <span className="mt-1 block text-sm font-semibold !text-[#5f5667]">
                  Créer un nouvel événement et ses formats
                </span>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full !bg-violet-100 text-3xl font-light !text-violet-700">
                {showRaceCreate ? "−" : "+"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowTrainingCreate((current) => !current);
                setShowRaceCreate(false);
              }}
              className="group flex min-h-[118px] w-full items-center gap-4 rounded-2xl !border !border-violet-200 !bg-white p-4 text-left !text-[#28134d] shadow-md transition hover:-translate-y-0.5 hover:!border-violet-400 hover:!bg-violet-50 hover:shadow-lg"
            >
              <img
                src="/add-training.png"
                alt=""
                className="h-20 w-20 shrink-0 object-contain md:h-24 md:w-24"
              />

              <div className="min-w-0 flex-1">
                <span className="block text-[0.62rem] font-black tracking-[0.18em] !text-violet-700">
                  ENTRAÎNEMENT
                </span>

                <strong className="mt-1 block text-lg font-black !text-[#28134d] md:text-xl">
                  Ajouter un entraînement
                </strong>

                <span className="mt-1 block text-sm font-semibold !text-[#5f5667]">
                  Planifier une sortie ou un entraînement du team
                </span>
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full !bg-violet-100 text-3xl font-light !text-violet-700">
                {showTrainingCreate ? "−" : "+"}
              </span>
            </button>
          </div>
        </section>
      )}

      {/* ==================================================
          CREATION EVENEMENT
      ================================================== */}

      {userId && showRaceCreate && (
        <section className="page-container pt-0">
          <div className="race-create">
            <div className="race-create-heading">
              <span>
                AJOUTER UN ÉVÉNEMENT
              </span>

              <h2>
                Un nouveau défi ?
              </h2>

              <p>
                Crée un événement puis ajoute autant de formats que nécessaire.
              </p>
            </div>

            <form
              className="race-event-form"
              onSubmit={addRace}
            >
              <div className="race-event-main-fields">
                <div>
                  <label>
                    Nom de l&apos;événement
                  </label>

                  <input
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Urban Night Trail..."
                  />
                </div>

                <div>
                  <label>
                    Lieu
                  </label>

                  <input
                    value={raceLocation}
                    onChange={(e) =>
                      setRaceLocation(
                        e.target.value
                      )
                    }
                    placeholder="Saint-Jean-de-Maurienne"
                  />
                </div>

                <div>
                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={raceDate}
                    onChange={(e) =>
                      setRaceDate(
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              <div className="race-options-create">
                <div className="race-options-create-heading">
                  <div>
                    <span>
                      FORMATS / DISTANCES
                    </span>

                    <h3>
                      Les courses proposées
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={addRaceOptionField}
                  >
                    + Ajouter un format
                  </button>
                </div>

                {newRaceOptions.map(
                  (option, index) => (
                    <div
                      className="race-option-create-row"
                      key={index}
                    >
                      <div>
                        <label>
                          Nom du format
                        </label>

                        <input
                          value={option.name}
                          onChange={(e) =>
                            updateNewRaceOption(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="12K, Trail court..."
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
                            value={option.distance}
                            onChange={(e) =>
                              updateNewRaceOption(
                                index,
                                "distance",
                                e.target.value
                              )
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
                            min="0"
                            value={option.elevation}
                            onChange={(e) =>
                              updateNewRaceOption(
                                index,
                                "elevation",
                                e.target.value
                              )
                            }
                          />

                          <span>M</span>
                        </div>
                      </div>

                      {newRaceOptions.length > 1 && (
                        <button
                          type="button"
                          className="race-option-remove"
                          onClick={() =>
                            removeRaceOptionField(index)
                          }
                        >
                          ×
                        </button>
                      )}
                    </div>
                  )
                )}
              </div>

              <div className="race-image-upload-zone">
                <label>
                  LOGO / VISUEL
                </label>

                <label className="race-image-upload-button">
                  + Ajouter une image

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleRaceImage}
                  />
                </label>

                {raceImagePreview && (
                  <div className="race-image-preview">
                    <img
                      src={raceImagePreview}
                      alt=""
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  type="submit"
                  className="race-submit flex-1"
                  disabled={saving}
                >
                  {saving
                    ? "Création..."
                    : "Créer l'événement"}
                </button>

                <button
                  type="button"
                  className="race-edit-cancel"
                  onClick={() => setShowRaceCreate(false)}
                >
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ==================================================
          CREATION ENTRAINEMENT
      ================================================== */}

      {userId && showTrainingCreate && (
        <section className="page-container pt-0">
          <div className="training-create">
            <div className="training-create-heading">
              <span>
                AJOUTER UNE SORTIE
              </span>

              <h2>
                Une sortie prévue ?
              </h2>
            </div>

            <form
              className="training-form"
              onSubmit={addTraining}
            >
              <div>
                <label>Nom</label>

                <input
                  value={trainingTitle}
                  onChange={(e) =>
                    setTrainingTitle(
                      e.target.value
                    )
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

                <input
                  type="number"
                  value={trainingDuration}
                  onChange={(e) =>
                    setTrainingDuration(
                      e.target.value
                    )
                  }
                />
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
                <label>
                  Niveau attendu
                </label>

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
                <label>
                  Commentaire
                </label>

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

              <div className="flex flex-col gap-3 md:flex-row">
                <button
                  className="training-submit flex-1"
                  disabled={savingTraining}
                >
                  Ajouter la sortie
                </button>

                <button
                  type="button"
                  className="race-edit-cancel"
                  onClick={() => setShowTrainingCreate(false)}
                >
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* ==================================================
          CALENDRIER
      ================================================== */}

      <section className="page-container courses-calendar-section">
        <div className="courses-section-title">
          <div>
            <span>CALENDRIER</span>

            <h2>
              Les rendez-vous du team
            </h2>
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
          ].map((weekday) => (
            <div
              key={weekday}
              className="calendar-weekday"
            >
              {weekday}
            </div>
          ))}

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

              return (
                <div
                  key={day}
                  className="calendar-day"
                >
                  <span className="calendar-number">
                    {day}
                  </span>

                  {racesForDay(day).map(
                    (race) => (
                      <Link
                        key={race.id}
                        href={`/courses/course/${race.id}`}
                        className="calendar-race calendar-event-link"
                      >
                        <strong>
                          {race.name}
                        </strong>

                        {race.location && (
                          <span>
                            📍 {race.location}
                          </span>
                        )}

                        <div className="calendar-race-status">
                          🏃{" "}
                          {
                            getRaceParticipants(
                              race.id
                            ).length
                          }{" "}
                          · 📣{" "}
                          {
                            getRaceSupporters(
                              race.id
                            ).length
                          }{" "}
                          · 💬{" "}
                          {getRaceCommentCount(
                            race.id
                          )}
                        </div>
                      </Link>
                    )
                  )}

                  {trainingsForDay(day).map(
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
                          {training.location}
                        </span>
                      </Link>
                    )
                  )}
                </div>
              );
            }
          )}
        </div>
      </section>

      {/* ==================================================
          LISTE EVENEMENTS COURSE
      ================================================== */}

      <section className="page-container race-list-section">
        <div className="courses-section-title">
          <div>
            <span>
              PROCHAINS ÉVÉNEMENTS
            </span>

            <h2>
              Sur la ligne de départ
            </h2>
          </div>
        </div>

        <div className="race-list">
          {races.map((race) => {
            const options =
              getRaceOptions(race.id);

            const totalParticipants =
              getRaceParticipants(race.id);

            const supporters =
              getRaceSupporters(race.id);

            const myAttendance =
              getMyRaceAttendance(race.id);

            const isCreator =
              race.created_by === userId;

            const canManage =
              canManageRace(race);

            const isEditing =
              editingRaceId === race.id;

            return (
              <article
                className="race-event-card"
                key={race.id}
              >
                <div className="race-event-date">
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

                <div className="race-event-content">
                  {isEditing ? (
                    <div className="race-event-edit">
                      <label>
                        Nom
                      </label>

                      <input
                        value={editRaceName}
                        onChange={(e) =>
                          setEditRaceName(
                            e.target.value
                          )
                        }
                      />

                      <label>
                        Lieu
                      </label>

                      <input
                        value={editRaceLocation}
                        onChange={(e) =>
                          setEditRaceLocation(
                            e.target.value
                          )
                        }
                      />

                      <label>
                        Date
                      </label>

                      <input
                        type="date"
                        value={editRaceDate}
                        onChange={(e) =>
                          setEditRaceDate(
                            e.target.value
                          )
                        }
                      />

                      <h4>
                        FORMATS
                      </h4>

                      {editOptions.map(
                        (option) => (
                          <div
                            className="race-option-edit-row"
                            key={option.id}
                          >
                            <input
                              value={option.name ?? ""}
                              placeholder="Nom"
                              onChange={(e) =>
                                updateEditOption(
                                  option.id,
                                  "name",
                                  e.target.value
                                )
                              }
                            />

                            <input
                              type="number"
                              value={option.distance}
                              onChange={(e) =>
                                updateEditOption(
                                  option.id,
                                  "distance",
                                  e.target.value
                                )
                              }
                            />

                            <input
                              type="number"
                              value={option.elevation}
                              onChange={(e) =>
                                updateEditOption(
                                  option.id,
                                  "elevation",
                                  e.target.value
                                )
                              }
                            />

                            <button
                              type="button"
                              className="race-delete-button"
                              onClick={() =>
                                deleteExistingOption(
                                  option.id
                                )
                              }
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          addOptionToExistingRace(
                            race.id
                          )
                        }
                      >
                        + Ajouter un format
                      </button>

                      <div className="race-edit-image">
                        {editRaceImagePreview && (
                          <img
                            src={
                              editRaceImagePreview
                            }
                            alt=""
                          />
                        )}

                        <label className="race-image-upload-button">
                          Changer le logo

                          <input
                            type="file"
                            accept="image/*"
                            onChange={
                              handleEditRaceImage
                            }
                          />
                        </label>
                      </div>

                      <div className="race-edit-actions">
                        <button
                          type="button"
                          onClick={() =>
                            updateRace(race)
                          }
                        >
                          Enregistrer
                        </button>

                        <button
                          type="button"
                          className="race-edit-cancel"
                          onClick={cancelEditRace}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="race-event-header">
                        {race.image_url && (
                          <Link
                            href={`/courses/course/${race.id}`}
                            className="race-event-logo"
                          >
                            <img
                              src={race.image_url}
                              alt=""
                            />
                          </Link>
                        )}

                        <div>
                          <span className="race-card-label">
                            COURSE
                          </span>

                          <Link
                            href={`/courses/course/${race.id}`}
                            className="event-title-link"
                          >
                            <h3>
                              {race.name}
                            </h3>
                          </Link>

                          {race.location && (
                            <p className="race-event-location">
                              📍 {race.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="race-formats-list">
                        {options.map(
                          (option) => {
                            const optionParticipants =
                              getOptionParticipants(
                                option.id
                              );

                            const selected =
                              myAttendance?.status ===
                                "participant" &&
                              myAttendance.race_option_id ===
                                option.id;

                            return (
                              <div
                                className={`race-format-row ${
                                  selected
                                    ? "race-format-selected"
                                    : ""
                                }`}
                                key={option.id}
                              >
                                <div className="race-format-name">
                                  <span>
                                    {option.name ||
                                      `${option.distance} KM`}
                                  </span>

                                  <strong>
                                    {option.distance} km
                                  </strong>
                                </div>

                                <div>
                                  <span>D+</span>

                                  <strong>
                                    {option.elevation} m+
                                  </strong>
                                </div>

                                <div>
                                  <span>
                                    PARTICIPANTS
                                  </span>

                                  <strong>
                                    🏃{" "}
                                    {
                                      optionParticipants.length
                                    }
                                  </strong>

                                  <div className="race-format-people">
                                    {optionParticipants.map(
                                      (participant) => (
                                        <small
                                          key={
                                            participant.id
                                          }
                                        >
                                          {getProfileName(
                                            participant.user_id
                                          )}
                                        </small>
                                      )
                                    )}
                                  </div>
                                </div>

                                {userId && (
                                  <button
                                    type="button"
                                    className={`race-format-join ${
                                      selected
                                        ? "race-choice-active"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      participateRaceOption(
                                        race.id,
                                        option.id
                                      )
                                    }
                                  >
                                    {selected
                                      ? "✓ Je participe"
                                      : "🏃 Je participe"}
                                  </button>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>

                      <div className="race-event-summary">
                        <div>
                          <span>
                            TOTAL PARTICIPANTS
                          </span>

                          <strong>
                            🏃{" "}
                            {
                              totalParticipants.length
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            SUPPORTERS
                          </span>

                          <strong>
                            📣{" "}
                            {supporters.length}
                          </strong>
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
                      </div>

                      {userId && (
                        <div className="race-event-actions">
                          <button
                            type="button"
                            className={`race-choice ${
                              myAttendance?.status ===
                              "support"
                                ? "race-choice-active"
                                : ""
                            }`}
                            onClick={() =>
                              supportRace(race.id)
                            }
                          >
                            📣 Je supporte
                          </button>

                          {myAttendance && (
                            <button
                              type="button"
                              className="race-remove"
                              onClick={() =>
                                removeRaceAttendance(
                                  race.id
                                )
                              }
                            >
                              ×
                            </button>
                          )}
                        </div>
                      )}

                      {canManage && (
                        <div className="race-owner-actions">
                          <button
                            type="button"
                            onClick={() =>
                              startEditRace(race)
                            }
                          >
                            Modifier
                          </button>

                          <button
                            type="button"
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
              </article>
            );
          })}
        </div>
      </section>

      {/* ==================================================
          SORTIES / ENTRAINEMENTS
      ================================================== */}

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
          {trainings.map(
            (training) => {
              const participants =
                getTrainingParticipants(
                  training.id
                );

              const joined =
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
                    {isEditing ? (
                      <>
                        <input
                          value={
                            editTrainingTitle
                          }
                          onChange={(e) =>
                            setEditTrainingTitle(
                              e.target.value
                            )
                          }
                        />

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

                        <select
                          value={
                            editTrainingLevel
                          }
                          onChange={(e) =>
                            setEditTrainingLevel(
                              e.target.value
                            )
                          }
                        >
                          <option value="<300">
                            &lt;300
                          </option>
                          <option value="400">400</option>
                          <option value="500">500</option>
                          <option value="600">600</option>
                          <option value="700">700</option>
                          <option value="800">800</option>
                          <option value="900">900</option>
                          <option value="1000">1000</option>
                        </select>

                        <textarea
                          value={
                            editTrainingComment
                          }
                          onChange={(e) =>
                            setEditTrainingComment(
                              e.target.value
                            )
                          }
                        />

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
                          onClick={
                            cancelEditTraining
                          }
                        >
                          Annuler
                        </button>
                      </>
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
                              NIVEAU
                            </span>

                            <strong>
                              {training.expected_level ??
                                "—"}
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
                          )}
                        </Link>

                        <div className="training-participants">
                          <span>
                            🏃 PARTICIPANTS
                          </span>

                          <div className="race-names">
                            {participants.map(
                              (participant) => (
                                <span
                                  key={
                                    participant.id
                                  }
                                  className="race-person participant"
                                >
                                  {getProfileName(
                                    participant.user_id
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