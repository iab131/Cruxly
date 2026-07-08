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
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-full">
                {(Object.keys(GRADES) as Bucket[]).map((bucket) => {
                    const isSelected = selectedBucket === bucket
                    return (
                        <button
                            key={bucket}
                            type="button"
                            onClick={() => {
                                setSelectedBucket(bucket)
                                // Changing to a bucket that doesn't contain the current
                                // grade clears the selection until a new grade is picked.
                                const currentGrades = GRADES[bucket] as readonly string[]
                                if (!value || !currentGrades.includes(value)) {
                                    onChange("") // Clear selection
                                }
                            }}
                            className={cn(
                                "py-2 px-1 rounded-full text-xs sm:text-sm font-medium capitalize transition-all",
                                isSelected
                                    ? "bg-white text-blue-950 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {bucket}
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
                                    "flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all snap-center border",
                                    value === grade
                                        ? "bg-blue-950 text-white border-blue-950 scale-110"
                                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
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
