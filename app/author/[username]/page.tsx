import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import ProfileContent from "./ProfileContent";

async function getAuthorByUsername(username: string) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const snap = await getDocs(q);

    if (snap.empty) return null;
    return snap.docs[0].data();
  } catch (err) {
    console.error("Error fetching author:", err);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const author = await getAuthorByUsername(username);

  if (!author) {
    return {
      title: "Author Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${author.name} (@${author.username})`;
  const description =
    author.bio ||
    `Read articles by ${author.name} on ${SITE_NAME}. ${author.postsCount || 0} posts published.`;
  const url = `${SITE_URL}/author/${author.username}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "profile",
      images: author.photoURL
        ? [{ url: author.photoURL, alt: author.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: author.photoURL ? [author.photoURL] : undefined,
    },
    robots: { index: true, follow: true },
  };
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const author = await getAuthorByUsername(username);

  if (!author) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    url: `${SITE_URL}/author/${author.username}`,
    ...(author.photoURL && { image: author.photoURL }),
    ...(author.bio && { description: author.bio }),
    ...(author.socialLinks &&
      Object.values(author.socialLinks).filter(Boolean).length > 0 && {
        sameAs: Object.values(author.socialLinks).filter(Boolean),
      }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProfileContent author={JSON.parse(JSON.stringify(author))} />
    </>
  );
}
