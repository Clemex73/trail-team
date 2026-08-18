"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Training = {
  id: string;
  title: string;
  location: string;
  duration_minutes: number;
  training_date: string;
  comment: string | null;
  expected_level: string | null;
  created_by: string;
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
};

export default function TrainingDetailPage() {
  const params = useParams<{ id: string }>();
  const trainingId = params.id;

  const supabase = createClient();

  const [training, setTraining] = useState<Training | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadPage();
  }, [trainingId]);

  async function loadPage() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data: trainingData, error: trainingError } =
      await supabase
        .from("trainings")
        .select("*")
        .eq("id", trainingId)
        .single();

    if (trainingError) {
      console.error("Erreur chargement sortie :", trainingError);
      setTraining(null);
      setLoading(false);
      return;
    }

    const { data: commentsData, error: commentsError } =
      await supabase
        .from("event_comments")
        .select("*")
        .eq("training_id", trainingId)
        .order("created_at", {
          ascending: true,
        });

    if (commentsError) {
      console.error("Erreur commentaires :", commentsError);
    }

    const { data: profilesData, error: profilesError } =
      await supabase
        .from("profiles")
        .select("id, first_name, last_name, nickname");

    if (profilesError) {
      console.error("Erreur profils :", profilesError);
    }

    setTraining(trainingData as Training);

    setComments(
      (commentsData ?? []) as Comment[]
    );

    setProfiles(
      (profilesData ?? []) as Profile[]
    );

    setLoading(false);
  }

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

  async function sendComment(event: React.FormEvent) {
    event.preventDefault();

    if (!userId) {
      alert("Tu dois être connecté pour écrire un message.");
      return;
    }

    if (!message.trim()) {
      return;
    }

    setSending(true);

    const { error } = await supabase
      .from("event_comments")
      .insert({
        user_id: userId,
        race_id: null,
        training_id: trainingId,
        message: message.trim(),
      });

    setSending(false);

    if (error) {
      console.error("Erreur envoi commentaire :", error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    setMessage("");

    await loadPage();
  }

  async function deleteComment(commentId: string) {
    if (!userId) {
      return;
    }

    const confirmed = window.confirm(
      "Supprimer ce message ?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("event_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      console.error("Erreur suppression commentaire :", error);
      alert(`Erreur : ${error.message}`);
      return;
    }

    await loadPage();
  }

  if (loading) {
    return (
      <main className="page-container event-detail-page">
        <p>Chargement...</p>
      </main>
    );
  }

  if (!training) {
    return (
      <main className="page-container event-detail-page">
        <Link href="/courses" className="event-back">
          ← Retour aux événements
        </Link>

        <p>Sortie introuvable.</p>
      </main>
    );
  }

  return (
    <main className="page-container event-detail-page">
      <Link
        href="/courses"
        className="event-back"
      >
        ← Retour aux événements
      </Link>

      <section className="event-detail-header training-detail-header">
        <span>SORTIE / ENTRAÎNEMENT</span>

        <h1>{training.title}</h1>

        <div className="event-detail-stats">
          <div>
            <small>LIEU</small>
            <strong>{training.location}</strong>
          </div>

          <div>
            <small>DURÉE</small>
            <strong>
              {training.duration_minutes} min
            </strong>
          </div>

          <div>
            <small>NIVEAU ATTENDU</small>
            <strong>
              {training.expected_level ?? "Non défini"}
            </strong>
          </div>

          <div>
            <small>DATE</small>
            <strong>
              {new Date(
                `${training.training_date}T12:00:00`
              ).toLocaleDateString("fr-FR")}
            </strong>
          </div>

          <div>
            <small>CRÉÉ PAR</small>
            <strong>
              {getProfileName(training.created_by)}
            </strong>
          </div>

          <div>
            <small>DISCUSSION</small>
            <strong>
              💬 {comments.length}
            </strong>
          </div>
        </div>

        {training.comment && (
          <div className="event-detail-description">
            {training.comment}
          </div>
        )}
      </section>

      <section className="event-discussion">
        <div className="event-discussion-title">
          <span>DISCUSSION</span>

          <h2>
            {comments.length} message
            {comments.length !== 1 ? "s" : ""}
          </h2>
        </div>

        <div className="event-comments">
          {comments.length === 0 && (
            <div className="event-no-comments">
              Aucun message pour le moment.
            </div>
          )}

          {comments.map((comment) => (
            <article
              key={comment.id}
              className="event-comment"
            >
              <div className="event-comment-avatar">
                {getProfileName(comment.user_id)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="event-comment-content">
                <div className="event-comment-head">
                  <div>
                    <strong>
                      {getProfileName(comment.user_id)}
                    </strong>

                    <span>
                      {new Date(
                        comment.created_at
                      ).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {comment.user_id === userId && (
                    <button
                      type="button"
                      className="comment-delete"
                      onClick={() =>
                        deleteComment(comment.id)
                      }
                    >
                      Supprimer
                    </button>
                  )}
                </div>

                <p>{comment.message}</p>
              </div>
            </article>
          ))}
        </div>

        {userId ? (
          <form
            className="comment-form"
            onSubmit={sendComment}
          >
            <label>
              Écrire un message
            </label>

            <textarea
              rows={4}
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Point de rendez-vous, matériel, allure, covoiturage..."
            />

            <button
              type="submit"
              disabled={sending}
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