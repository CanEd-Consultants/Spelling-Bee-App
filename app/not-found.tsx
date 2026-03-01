import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-display font-bold text-sboc-yellow">
          404
        </h1>
        <h2 className="text-2xl font-display font-bold text-sboc-dark">
          Page Not Found
        </h2>
        <p className="text-sboc-neutral">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    </div>
  )
}
