"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main className="min-w-screen min-h-screen flex items-center justify-center gap-10">
      <button type="button" onClick={() => router.push("/ex101")} className="rounded-lg p-3 bg-black text-white active:bg-gray-700">
        Example 1
      </button>
      <button type="button" onClick={() => router.push("/ex102")} className="rounded-lg p-3 bg-black text-white active:bg-gray-700">
        Example 2
      </button>
    </main>
  );
}
