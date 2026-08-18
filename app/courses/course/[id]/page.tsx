"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Race = {
  id: string;
  name: string;
  distance: number;
  elevation: number;
  race_date: string;
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

export default function RaceDetailPage() {
  const params = useParams<{ id: string }>();

  const raceId = params.id;

  const supabase = createClient();

  const [race, setRace] =
    useState<Race | null>(null);

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  useEffect(() => {
    loadPage();
  }, [raceId]);

  async function loadPage() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    const { data: raceData } =
      await supabase
        .from("races")
        .select("*")
        .eq("id", raceId)
        .single();

    const { data: commentsData } =
      await supabase
        .from("event_comments")
        .select("*")
        .eq("race_id", raceId)
        .order("created_at", {
          ascending: true,
        });

    const { data: profilesData } =
      await supabase
        .from("profiles")
        .select(
          "id, first_name, last_name, nickname"
        );

    setRace(raceData as Race);

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
      (profile) =>
        profile.id === profileId
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

    const { error } = await supabase
      .from("event_comments")
      .insert({
        user_id: userId,
        race_id: raceId,
        training_id: null,
        message: message.trim(),
      });

    setSending(false);

    if (error) {
      alert(error.message);
      return;
    }

    setMessage("");

    await loadPage();
  }

  async function deleteComment(
    commentId: string
  ) {
    if (!userId) return;

    const confirmed = window.confirm(
      "Supprimer ce message ?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("event_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      alert(error.message);
      return;
    }

    await loadPage();
  }

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

  return (
    <main className="page-container event-detail-page">
      <Link
        href="/courses"
        className="event-back"
      >
        ← Retour aux événements
      </Link>

      <section className="event-detail-header race-detail-header">
        <span>COURSE</span>

        <h1>{race.name}</h1>

        <div className="event-detail-stats">
          <div>
            <small>DISTANCE</small>
            <strong>
              {race.distance} km
            </strong>
          </div>

          <div>
            <small>DÉNIVELÉ</small>
            <strong>
              {race.elevation} m+
            </strong>
          </div>

          <div>
            <small>DATE</small>

            <strong>
              {new Date(
                `${race.race_date}T12:00:00`
              ).toLocaleDateString(
                "fr-FR"
              )}
            </strong>
          </div>

          <div>
            <small>DISCUSSION</small>
            <strong>
              💬 {comments.length}
            </strong>
          </div>
        </div>
      </section>

      <section className="event-discussion">
        <div className="event-discussion-title">
          <span>DISCUSSION</span>

          <h2>
            {comments.length} message
            {comments.length !== 1
              ? "s"
              : ""}
          </h2>
        </div>

        <div className="event-comments">
          {comments.length === 0 && (
            <div className="event-no-comments">
              Aucun message pour le moment.
              Sois le premier à lancer la
              discussion.
            </div>
          )}

          {comments.map((comment) => (
            <article
              key={comment.id}
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
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
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
                setMessage(
                  event.target.value
                )
              }
              placeholder="Organisation, covoiturage, matériel, rendez-vous..."
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
            Connecte-toi pour participer
            à la discussion.
          </div>
        )}
      </section>
    </main>
  );
}