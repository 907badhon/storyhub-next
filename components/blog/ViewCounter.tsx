"use client";

import { useEffect, useRef } from "react";
import { incrementViewCount } from "@/lib/firebase/posts";

export default function ViewCounter({ postId }: { postId: string }) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    const key = `viewed_${postId}`;
    const lastViewed = sessionStorage.getItem(key);
    const now = Date.now();

    if (!lastViewed || now - parseInt(lastViewed) > 30 * 60 * 1000) {
      incrementViewCount(postId).catch((err) =>
        console.error("View count error:", err),
      );
      sessionStorage.setItem(key, now.toString());
    }
  }, [postId]);

  return null;
}
