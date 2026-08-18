"use client";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { createClient } from "@/utils/supabase/client";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  image_urls: string[];
  author_id: string;
  created_at: string;
};

type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  nickname: string | null;
};

export default function ArticlePage() {
  const params =
    useParams<{ id: string }>();

  const router = useRouter();

  const supabase =
    createClient();

  const [article, setArticle] =
    useState<Article | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [userId, setUserId] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  async function loadArticle() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUserId(
      user?.id ?? null
    );

    const {
      data: articleData,
      error,
    } = await supabase
      .from("articles")
      .select("*")
      .eq("id", params.id)
      .single();

    if (
      error ||
      !articleData
    ) {
      setArticle(null);
      setLoading(false);
      return;
    }

    setArticle(
      articleData as Article
    );

    const {
      data: profileData,
    } = await supabase
      .from("profiles")
      .select(
        "id, first_name, last_name, nickname"
      )
      .eq(
        "id",
        articleData.author_id
      )
      .single();

    setProfile(
      profileData as Profile
    );

    setLoading(false);
  }

  function authorName() {
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

  async function deleteArticle() {
    if (
      !article ||
      userId !==
        article.author_id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Supprimer cet article ?"
      );

    if (!confirmed) {
      return;
    }

    const { error } =
      await supabase
        .from("articles")
        .delete()
        .eq("id", article.id)
        .eq(
          "author_id",
          userId
        );

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  if (loading) {
    return (
      <main className="page-container article-page">
        Chargement...
      </main>
    );
  }

  if (!article) {
    return (
      <main className="page-container article-page">
        <Link
          href="/"
          className="event-back"
        >
          ← Retour
        </Link>

        <h1>
          Article introuvable.
        </h1>
      </main>
    );
  }

  return (
    <main className="article-page">
      <div className="page-container article-page-inner">
        <Link
          href="/"
          className="event-back"
        >
          ← Retour au journal
        </Link>

        <header className="article-header">
          <span>
            JOURNAL DU TEAM
          </span>

          <h1>
            {article.title}
          </h1>

          {article.excerpt && (
            <p>
              {article.excerpt}
            </p>
          )}

          <div className="article-header-meta">
            <strong>
              {authorName()}
            </strong>

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
          </div>
        </header>

        {article.image_urls?.[0] && (
          <div className="article-cover">
            <img
              src={
                article
                  .image_urls[0]
              }
              alt={
                article.title
              }
            />
          </div>
        )}

        <article className="article-body">
          {article.content
            .split("\n")
            .map(
              (
                paragraph,
                index
              ) => {
                if (
                  paragraph.trim() ===
                  ""
                ) {
                  return (
                    <div
                      key={index}
                      className="article-spacer"
                    />
                  );
                }

                return (
                  <p key={index}>
                    {paragraph}
                  </p>
                );
              }
            )}
        </article>

        {article.image_urls &&
          article.image_urls.length >
            1 && (
            <section className="article-gallery">
              <div className="article-gallery-heading">
                <span>
                  PHOTOS
                </span>

                <h2>
                  Dans l&apos;aventure.
                </h2>
              </div>

              <div className="article-gallery-grid">
                {article.image_urls
                  .slice(1)
                  .map(
                    (
                      image,
                      index
                    ) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt=""
                      />
                    )
                  )}
              </div>
            </section>
          )}

        {userId ===
          article.author_id && (
          <div className="article-owner-zone">
            <button
              type="button"
              onClick={
                deleteArticle
              }
            >
              Supprimer l&apos;article
            </button>
          </div>
        )}
      </div>
    </main>
  );
}