// hooks/useProtectedRoute.ts

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface UseProtectedRouteOptions {
  requireRole?: "user" | "author" | "admin";
  redirectTo?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { requireRole, redirectTo = "/login" } = options;
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(redirectTo);
      return;
    }

    if (requireRole && profile) {
      if (profile.role === "admin") return;
      if (profile.role !== requireRole) {
        router.push("/");
        return;
      }
    }
  }, [user, profile, loading, requireRole, redirectTo, router]);

  return { user, profile, loading };
}
