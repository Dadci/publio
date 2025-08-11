"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else if (response.status === 429) {
          console.warn("Rate limited. Please wait before retrying.");
          setIsAuthenticated(false);
          // Don't redirect immediately on rate limit, show a message instead
        } else {
          setIsAuthenticated(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-6">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">Redirecting to login...</p>
            {process.env.NODE_ENV === "development" && (
              <div className="text-sm text-blue-600">
                <p>
                  Getting rate limited? Visit{" "}
                  <a href="/dev-tools" className="underline">
                    /dev-tools
                  </a>{" "}
                  to reset limits.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
