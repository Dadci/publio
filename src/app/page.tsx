import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Publio
          </h1>
          <p className="text-lg text-gray-600">
            Your social media scheduling platform
          </p>
        </div>

        <div className="space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>

          <p className="text-sm text-gray-500">
            Manage your social media posts across multiple platforms
          </p>
        </div>
      </div>
    </div>
  );
}
