"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import type { SpellingRule } from "@/lib/types"
import rulesData from "@/data/guidelines/spelling-rules.json"
import allWordsData from "@/data/words/primary-2026.json"
import type { Word } from "@/lib/types"

const rules = rulesData as SpellingRule[]
const allWords = allWordsData as Word[]

export default function GuidelinesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-sboc-dark">
          Spelling Guidelines
        </h1>
        <p className="mt-1 text-sboc-neutral">
          The 10 official SBOC spelling rules to help you master tricky words
        </p>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <RuleCard key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  )
}

function RuleCard({ rule }: { rule: SpellingRule }) {
  const [isOpen, setIsOpen] = useState(false)

  const linkedWords = rule.word_list_examples
    .map((id) => allWords.find((w) => w.id === id))
    .filter(Boolean) as Word[]

  return (
    <div className="rounded-xl border-2 border-gray-100 bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 text-left min-h-[44px]"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sboc-yellow/20 text-sm font-bold text-sboc-dark">
            {rule.id}
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-sboc-dark">
              {rule.title}
            </h3>
            <p className="mt-0.5 text-sm text-sboc-neutral">{rule.summary}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-sboc-neutral flex-shrink-0" />
        ) : (
          <ChevronRight className="h-5 w-5 text-sboc-neutral flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-6 space-y-6">
          {rule.rules.map((subrule) => (
            <div key={subrule.subrule} className="space-y-2">
              <h4 className="font-semibold text-sboc-dark">
                Rule {rule.id}
                {subrule.subrule}
              </h4>
              <p className="text-sm text-sboc-dark">{subrule.description}</p>
              <div className="flex flex-wrap gap-2">
                {subrule.examples.map((ex) => (
                  <span
                    key={ex}
                    className="rounded-full bg-gray-50 px-3 py-1 text-sm font-mono text-sboc-dark"
                  >
                    {ex}
                  </span>
                ))}
              </div>
              {subrule.exceptions && subrule.exceptions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-sboc-neutral uppercase">
                    Exceptions:
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {subrule.exceptions.map((ex) => (
                      <span
                        key={ex}
                        className="rounded-full bg-orange-50 px-3 py-1 text-sm font-mono text-orange-700"
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {linkedWords.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-semibold text-sboc-neutral uppercase mb-2">
                Words from the list that use this rule:
              </p>
              <div className="flex flex-wrap gap-2">
                {linkedWords.map((word) => (
                  <Link
                    key={word.id}
                    href={`/words/${encodeURIComponent(word.word)}`}
                    className="rounded-full bg-sboc-yellow/10 px-3 py-1 text-sm font-semibold text-sboc-dark hover:bg-sboc-yellow/20 transition-colors"
                  >
                    {word.word}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
