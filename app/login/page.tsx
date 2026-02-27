"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function Login() {
  const router = useRouter();

  // if already logged in → go dashboard
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push("/dashboard");
    });
  }, []);

  const loginGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f9f8]">
      <div className="bg-white p-8 rounded-xl border w-full max-w-md">
        <Link href="/" className="text-sm text-gray-500">
          ← Back
        </Link>

        <h1 className="text-2xl font-bold mt-4">Welcome</h1>

        <button
          onClick={loginGoogle}
          className="w-full border p-3 rounded-lg mt-6"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
