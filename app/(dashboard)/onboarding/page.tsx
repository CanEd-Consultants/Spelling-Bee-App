import { ChildProfileSetup } from "@/components/auth/child-profile-setup"

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sboc-white p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-sboc-dark">
            Welcome!
          </h1>
          <p className="mt-2 text-sboc-neutral">
            Let&apos;s set up your child&apos;s profile to get started
          </p>
        </div>
        <ChildProfileSetup />
      </div>
    </div>
  )
}
