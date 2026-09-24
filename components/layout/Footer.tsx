// components/layout/Footer.tsx
import Link from "next/link";
import { HiSparkles } from "react-icons/hi2";
import { FiArrowUpRight, FiHeart } from "react-icons/fi";

const footerLinks = {
  Explore: [
    { label: "Home", href: "/" },
    { label: "All Posts", href: "/posts" },
    { label: "Trending", href: "/#trending" },
    { label: "Popular Authors", href: "/#authors" },
  ],
  Account: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Write a Post", href: "/dashboard/posts/new" },
  ],
};

export default function Footer() {
  return (
    <footer className="mt-20 overflow-hidden bg-indigo-950 text-indigo-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 border-b border-white/10 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-300">The StoryHub community</p>
            <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Make space for ideas that matter.
            </h2>
          </div>
          <Link
            href="/posts"
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100"
          >
            Browse all stories
            <FiArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 md:grid-cols-5">
          {/* Brand col */}
          <div className="sm:col-span-2 md:col-span-3">
            <Link href="/" className="group mb-5 flex w-fit items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-950/30 transition-transform group-hover:scale-105">
                <HiSparkles className="text-white text-base" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Story<span className="text-indigo-300">Hub</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-indigo-200/75">
              A thoughtful space for reading, writing, and sharing practical ideas about technology, programming, and career growth.
            </p>
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
              Read. Write. Inspire.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                {title}
              </p>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-indigo-100/70 transition-colors duration-150 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-xs text-indigo-300/70">
            © {new Date().getFullYear()} StoryHub. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-indigo-300/70">
            Made with <FiHeart className="h-3.5 w-3.5 text-rose-300" /> for readers and writers
          </p>
        </div>
      </div>
    </footer>
  );
}
