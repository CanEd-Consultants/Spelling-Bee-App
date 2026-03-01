"use client"

import { useState } from "react"
import Link from "next/link"
import { login, loginWithMagicLink } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  async function handleMagicLink(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setMessage(null)
    const result = await loginWithMagicLink(formData)
    if (result?.error) {
      setError(result.error)
    }
    if (result?.success) {
      setMessage(result.success)
    }
    setIsLoading(false)
  }

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-display font-bold text-sboc-dark">
        Welcome back
      </h2>
      <p className="mt-1 text-sm text-sboc-neutral">
        Sign in to continue practicing
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-sboc-red">
          {error}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-sboc-green">
          {message}
        </div>
      )}

      {!showMagicLink ? (
        <form action={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="parent@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Your password"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <button
            type="button"
            onClick={() => setShowMagicLink(true)}
            className="w-full text-center text-sm text-sboc-neutral hover:text-sboc-dark transition-colors"
          >
            Or sign in with a magic link
          </button>
        </form>
      ) : (
        <form action={handleMagicLink} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="parent@example.com"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Magic Link"}
          </Button>

          <button
            type="button"
            onClick={() => setShowMagicLink(false)}
            className="w-full text-center text-sm text-sboc-neutral hover:text-sboc-dark transition-colors"
          >
            Back to password login
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-sboc-neutral">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-sboc-dark hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
