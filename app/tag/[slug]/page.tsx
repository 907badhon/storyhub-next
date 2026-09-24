import type { Metadata } from "next";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import PostCard from "@/components/blog/PostCard";
import { Post } from "@/types/post";

async function getPosts(tag: string): Promise<Post[]> {
  try {
    const q = query(
      collection(db, "posts"),
      where("tags", "array-contains", tag),
      where("status", "==", "published"),
    );
    const snap = await getDocs(q);
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Post[];
    return posts.sort((a: any, b: any) => {
      const aTime = a.publishedAt?.seconds || 0;
      const bTime = b.publishedAt?.seconds || 0;
      return bTime - aTime;
    });
  } catch (err) {
    console.error("Error fetching posts:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = `#${slug} Articles`;
  const description = `Articles tagged with #${slug} on ${SITE_NAME}.`;
  const url = `${SITE_URL}/tag/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPosts(slug);

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <p className="text-sm text-gray-500 mb-2">Tag</p>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">#{slug}</h1>
          <p className="text-gray-600">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <p className="text-gray-500">There are no posts with this tag yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
