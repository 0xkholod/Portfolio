import type { CollectionEntry } from "astro:content";

export type ArticleEntry = CollectionEntry<"articles">;

export const articleSlug = (id: string) => id.replace(/\/index$/, "");

export const articleHref = (article: ArticleEntry) => `/articles/${articleSlug(article.id)}`;

export const articleReadingMinutes = (body = "") => {
  const plainText = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#[\]()*_>~-]/g, " ")
    .trim();

  const words = plainText ? plainText.split(/\s+/u).length : 0;
  return Math.max(1, Math.ceil(words / 220));
};

export const sortArticles = (articles: ArticleEntry[]) => [...articles].sort(
  (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf(),
);

export const formatArticleDate = (date: Date) => new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(date);
