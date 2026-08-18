"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function NewArticlePage() {
  const supabase = createClient();

  const router = useRouter();

  const [userId, setUserId] =
    useState<string | null>(null);

  const [title, setTitle] =
    useState("");

  const [excerpt, setExcerpt] =
    useState("");

  const [content, setContent] =
    useState("");

  const [photos, setPhotos] =
    useState<File[]>([]);

  const [previews, setPreviews] =
    useState<string[]>([]);

  const [saving, setSaving] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(user?.id ?? null);

    setLoading(false);
  }

  function handlePhotos(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    const accepted =
      files.slice(0, 10);

    setPhotos(accepted);

    const urls =
      accepted.map((file) =>
        URL.createObjectURL(file)
      );

    setPreviews(urls);
  }

  function removePhoto(
    index: number
  ) {
    setPhotos((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );

    setPreviews((current) =>
      current.filter(
        (_, i) => i !== index
      )
    );
  }

  async function uploadPhotos() {
    if (!userId) {
      return [];
    }

    const uploadedUrls:
      string[] = [];

    for (const photo of photos) {
      const extension =
        photo.name
          .split(".")
          .pop() ?? "jpg";

      const fileName =
        `${userId}/${crypto.randomUUID()}.${extension}`;

      const { error } =
        await supabase.storage
          .from("article-images")
          .upload(
            fileName,
            photo,
            {
              cacheControl: "3600",
              upsert: false,
            }
          );

      if (error) {
        throw error;
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from("article-images")
          .getPublicUrl(fileName);

      uploadedUrls.push(
        publicUrlData.publicUrl
      );
    }

    return uploadedUrls;
  }

  async function publishArticle(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (!userId) {
      alert(
        "Tu dois être connecté."
      );

      return;
    }

    if (
      !title.trim() ||
      !content.trim()
    ) {
      alert(
        "Ajoute au minimum un titre et le contenu de l'article."
      );

      return;
    }

    setSaving(true);

    try {
      const imageUrls =
        await uploadPhotos();

      const {
        data,
        error,
      } = await supabase
        .from("articles")
        .insert({
          title: title.trim(),

          excerpt:
            excerpt.trim() || null,

          content:
            content.trim(),

          image_urls: imageUrls,

          author_id: userId,

          published: true,
        })
        .select("id")
        .single();

      if (error) {
        throw error;
      }

      router.push(
        `/articles/${data.id}`
      );
    } catch (error: any) {
      console.error(error);

      alert(
        `Erreur : ${
          error?.message ??
          "Impossible de publier l'article."
        }`
      );

      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="page-container article-editor-page">
        Chargement...
      </main>
    );
  }

  if (!userId) {
    return (
      <main className="page-container article-editor-page">
        <Link
          href="/"
          className="event-back"
        >
          ← Retour
        </Link>

        <h1>
          Connexion nécessaire
        </h1>

        <p>
          Connecte-toi pour publier
          un article.
        </p>

        <Link
          href="/login"
          className="home-primary-button"
        >
          Se connecter
        </Link>
      </main>
    );
  }

  return (
    <main className="page-container article-editor-page">
      <Link
        href="/"
        className="event-back"
      >
        ← Retour à l&apos;accueil
      </Link>

      <div className="article-editor-heading">
        <span>
          JOURNAL DU TEAM
        </span>

        <h1>
          Raconte
          <br />
          <strong>
            l&apos;aventure.
          </strong>
        </h1>

        <p>
          Course, entraînement,
          reconnaissance, voyage,
          souvenir ou moment du team.
        </p>
      </div>

      <form
        className="article-editor"
        onSubmit={publishArticle}
      >
        <div className="article-editor-field">
          <label>
            TITRE DE L&apos;ARTICLE
          </label>

          <input
            value={title}
            onChange={(event) =>
              setTitle(
                event.target.value
              )
            }
            placeholder="Une journée sur les sentiers de Maurienne..."
          />
        </div>

        <div className="article-editor-field">
          <label>
            PETITE INTRODUCTION
          </label>

          <textarea
            rows={3}
            value={excerpt}
            onChange={(event) =>
              setExcerpt(
                event.target.value
              )
            }
            placeholder="Quelques lignes pour donner envie de lire..."
          />
        </div>

        <div className="article-editor-field">
          <label>
            ARTICLE
          </label>

          <textarea
            className="article-main-textarea"
            rows={16}
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value
              )
            }
            placeholder={`Raconte ton aventure...

Tu peux faire plusieurs paragraphes.

Partager les sensations, le parcours, les moments difficiles, les anecdotes du team...`}
          />
        </div>

        <div className="article-photo-upload">
          <div>
            <label>
              PHOTOS
            </label>

            <p>
              Jusqu&apos;à 10 photos.
              La première sera utilisée
              comme image principale.
            </p>
          </div>

          <label className="article-photo-button">
            + Ajouter des photos

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={
                handlePhotos
              }
            />
          </label>
        </div>

        {previews.length > 0 && (
          <div className="article-photo-previews">
            {previews.map(
              (preview, index) => (
                <div
                  key={preview}
                  className="article-photo-preview"
                >
                  <img
                    src={preview}
                    alt=""
                  />

                  {index === 0 && (
                    <span>
                      IMAGE PRINCIPALE
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      removePhoto(
                        index
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              )
            )}
          </div>
        )}

        <div className="article-publish-zone">
          <div>
            <strong>
              Prêt à publier ?
            </strong>

            <span>
              L&apos;article sera
              immédiatement visible
              sur l&apos;accueil.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="article-publish-button"
          >
            {saving
              ? "Publication..."
              : "Publier l'article"}
          </button>
        </div>
      </form>
    </main>
  );
}