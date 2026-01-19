"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

const GRADES = {
    easy: ["VB", "V0", "V1", "V2"],
    moderate: ["V3", "V4", "V5"],
    hard: ["V6", "V7", "V8"],
    elite: ["V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"]
} as const

type Bucket = keyof typeof GRADES

interface GradeSelectorProps {
    value?: string
    onChange: (grade: string) => void
}

export function GradeSelector({ value, onChange }: GradeSelectorProps) {
    const [selectedBucket, setSelectedBucket] = useState<Bucket | null>(null)

    // Sync internal bucket state if value provided externally
    useEffect(() => {
        if (value) {
            if (GRADES.easy.includes(value as any)) setSelectedBucket("easy")
            else if (GRADES.moderate.includes(value as any)) setSelectedBucket("moderate")
            else if (GRADES.hard.includes(value as any)) setSelectedBucket("hard")
            else if (GRADES.elite.includes(value as any)) setSelectedBucket("elite")
        }
    }, [value])

    return (
        <div className="space-y-2">
            {/* Step 1: Buckets */}
            <div className="grid grid-cols-4 gap-2 bg-slate-100 p-1 rounded-xl">
                {(Object.keys(GRADES) as Bucket[]).map((bucket) => {
                    const isSelected = selectedBucket === bucket
                    return (
                        <button
                            key={bucket}
                            type="button"
                            onClick={() => {
                                setSelectedBucket(bucket)
                                // Optional: Clear grade when bucket changes? 
                                // User constraints said: "Changing the bucket resets the grade"
                                // But if we are clicking the bucket we might want to just show options.
                                // Let's strictly follow: "Changing the bucket resets the grade" implies if I switch buckets, value is cleared until I pick a grade.
                                // However, usually UX prefers keeping a default or asking. 
                                // Let's clear the value if the new bucket doesn't contain the current value.
                                const currentGrades = GRADES[bucket] as readonly string[]
                                if (!value || !currentGrades.includes(value)) {
                                    onChange("") // Clear selection
                                }
                            }}
                            className={cn(
                                "flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs sm:text-sm font-medium transition-all",
                                isSelected 
                                    ? "bg-white text-blue-950 shadow-sm ring-1 ring-black/5" 
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                            )}
                        >
                            <span className="capitalize">{bucket}</span>
                            <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                                {GRADES[bucket][0]}-{GRADES[bucket][GRADES[bucket].length - 1]}
                            </span>
                        </button>
                    )
                })}
            </div>

            {/* Step 2: Specific Grade */}
            <div className={cn(
                "transition-all duration-300 overflow-hidden",
                selectedBucket ? "opacity-100 max-h-32" : "opacity-0 max-h-0"
            )}>
                {selectedBucket && (
                    <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide mask-fade-sides snap-x">
                        {GRADES[selectedBucket].map((grade) => (
                            <button
                                key={grade}
                                type="button"
                                onClick={() => onChange(grade)}
                                className={cn(
                                    "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all snap-center border-2",
                                    value === grade
                                        ? "bg-blue-950 text-white border-blue-950 scale-110"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                                )}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Hidden Input for Form Submission if needed, but we are using controlled state in parent */}
            <input type="hidden" name="grade" value={value || ""} />
        </div>
    )
}
