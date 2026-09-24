import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/lib/seo/config";
import LatestPostsSection from "@/components/blog/LatestPostsSection";
import TrendingSection from "@/components/blog/TrendingSection";
import PopularAuthors from "@/components/home/PopularAuthors";
import { FiEdit3 } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

export const metadata: Metadata = {
  title: "Home",
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-900">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-violet-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <HiSparkles className="w-4 h-4 text-yellow-300" />
              Read, Write, Inspire
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Stories that{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 to-indigo-300">
                matter
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-indigo-200 max-w-2xl mb-10 leading-relaxed">
              Discover insightful articles on tech, programming, and career growth.
              Join thousands of readers and writers on {SITE_NAME}.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-all shadow-lg shadow-black/20 active:scale-95">
                <FiEdit3 className="w-4 h-4" />
                Start Writing
              </Link>
              <Link href="#latest" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-medium px-6 py-3 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm active:scale-95">
                Explore Posts
              </Link>
            </div>
          </div>

          {/* Stats */}
          {/* <div className="mt-16 flex flex-wrap gap-8">
            {[
              { icon: FiEdit3, label: "Posts Published", value: "500+" },
              { icon: FiUsers, label: "Active Writers", value: "200+" },
              { icon: FiTrendingUp, label: "Monthly Readers", value: "10K+" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-indigo-200" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{value}</p>
                  <p className="text-indigo-300 text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Content sections */}
      <div id="latest" className="bg-gray-50">
        <LatestPostsSection />
        <TrendingSection />
        <PopularAuthors />
      </div>
    </main>
  );
}
