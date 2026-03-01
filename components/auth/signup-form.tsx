"use client"

import { useState } from "react"
import Link from "next/link"
import { signup } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignup(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    }
    setIsLoading(false)
  }

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-display font-bold text-sboc-dark">
        Create your account
      </h2>
      <p className="mt-1 text-sm text-sboc-neutral">
        Set up a parent account to track your child&apos;s progress
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-sboc-red">
          {error}
        </div>
      )}

      <form action={handleSignup} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Your Name</Label>
          <Input
            id="full_name"
            name="full_name"
            type="text"
            placeholder="Your full name"
          />
        </div>
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
            placeholder="At least 6 characters"
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-sboc-neutral">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-sboc-dark hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
