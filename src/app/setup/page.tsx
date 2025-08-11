"use client";

import { useState } from "react";

export default function SetupPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [adminCreated, setAdminCreated] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/setup/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.ok) {
        setAdminCreated(true);
        setMessage("Admin user created successfully!");
      } else {
        setMessage(data.error || "Failed to create admin user");
      }
    } catch (error) {
      setMessage("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Publio Setup</h2>
          <p className="mt-2 text-gray-600">
            Create your admin account to get started
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              adminCreated
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {adminCreated ? (
          <div className="space-y-4">
            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Login Credentials
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span>
                  <code className="ml-2 px-2 py-1 bg-white rounded">
                    admin@publio.app
                  </code>
                </div>
                <div>
                  <span className="font-medium">Password:</span>
                  <code className="ml-2 px-2 py-1 bg-white rounded">
                    admin123!
                  </code>
                </div>
              </div>
              <p className="text-blue-700 text-xs mt-3">
                ⚠️ Please change this password immediately after logging in!
              </p>
            </div>

            <a
              href="/login"
              className="block w-full text-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Login
            </a>
          </div>
        ) : (
          <button
            onClick={createAdmin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating Admin User..." : "Create Admin User"}
          </button>
        )}

        <div className="text-center text-sm text-gray-500">
          <p>This will create a default admin account with:</p>
          <ul className="mt-2 space-y-1">
            <li>• Email: admin@publio.app</li>
            <li>• Password: admin123!</li>
            <li>• Role: Administrator</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
