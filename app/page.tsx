import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  // Public landing page for unauthenticated users
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-5xl font-display font-bold text-sboc-dark">
          Spelling Bee of Canada
        </h1>
        <p className="text-xl text-sboc-neutral font-body">
          Practice and master the official SBOC word list. Study 400 words,
          track your progress, and get ready for competition day.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-sboc-yellow px-8 py-3 text-lg font-semibold text-sboc-dark hover:bg-yellow-400 transition-colors min-h-[44px] min-w-[44px]"
          >
            Get Started
          </Link>
          <Link
            href="/words"
            className="inline-flex items-center justify-center rounded-lg border-2 border-sboc-dark px-8 py-3 text-lg font-semibold text-sboc-dark hover:bg-sboc-dark hover:text-white transition-colors min-h-[44px] min-w-[44px]"
          >
            Browse Words
          </Link>
        </div>
      </div>
    </main>
  )
}
