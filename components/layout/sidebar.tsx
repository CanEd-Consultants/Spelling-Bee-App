"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  GraduationCap,
  BarChart3,
  Scroll,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { logout } from "@/app/(auth)/actions"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  childName: string
  category: string
  currentStreak: number
}

const navItems = [
  { href: "/practice", label: "Practice", icon: GraduationCap },
  { href: "/words", label: "My Words", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
  { href: "/guidelines", label: "Spelling Rules", icon: Scroll },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ childName, category, currentStreak }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white p-2 shadow-md lg:hidden min-h-[44px] min-w-[44px]"
        aria-label="Open navigation menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sboc-dark text-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 lg:hidden min-h-[44px] min-w-[44px]"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo & branding */}
        <div className="border-b border-white/10 p-6">
          <h2 className="font-display text-lg font-bold text-sboc-yellow">
            Spelling Bee
          </h2>
          <p className="text-xs text-white/60">of Canada</p>
        </div>

        {/* Child info */}
        <div className="border-b border-white/10 p-6">
          <p className="font-semibold">{childName}</p>
          <span className="mt-1 inline-block rounded-full bg-sboc-yellow/20 px-3 py-0.5 text-xs font-medium text-sboc-yellow capitalize">
            {category}
          </span>
          {currentStreak > 0 && (
            <p className="mt-2 text-sm text-white/60">
              {currentStreak} day streak
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors min-h-[44px]",
                  isActive
                    ? "bg-sboc-yellow text-sboc-dark"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start gap-3 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>
    </>
  )
}
