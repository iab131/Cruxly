"use client"

import { cn } from "@/lib/utils"

export const DISCIPLINES = [
    { value: "boulder", label: "Boulder" },
    { value: "sport", label: "Sport" },
    { value: "trad", label: "Trad" },
] as const

export const BOULDER_STYLES = [
    "slab",
    "vertical",
    "overhang",
    "crimpy",
    "compression",
    "dynamic",
    "technical",
    "coordination",
    "volume",
] as const

interface DisciplineSelectorProps {
    discipline: string
    onDisciplineChange: (value: string) => void
    boulderStyles: string[]
    onBoulderStylesChange: (styles: string[]) => void
}

export function DisciplineSelector({
    discipline,
    onDisciplineChange,
    boulderStyles,
    onBoulderStylesChange,
}: DisciplineSelectorProps) {

    const toggleStyle = (style: string) => {
        if (boulderStyles.includes(style)) {
            onBoulderStylesChange(boulderStyles.filter((s) => s !== style))
        } else {
            if (boulderStyles.length < 3) {
                onBoulderStylesChange([...boulderStyles, style])
            }
        }
    }

    return (
        <div className="space-y-3">
            {/* Discipline Selector */}
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Discipline
                </label>
                <div className="flex p-1 bg-slate-100 rounded-lg">
                    {DISCIPLINES.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onDisciplineChange(option.value)
                                if (option.value !== "boulder") {
                                    onBoulderStylesChange([]) // Clear styles if not boulder
                                }
                            }}
                            className={cn(
                                "flex-1 text-sm font-medium py-2 rounded-md transition-all",
                                discipline === option.value
                                    ? "bg-white text-blue-950 shadow-sm"
                                    : "text-slate-500 hover:text-slate-900"
                            )}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Bouldering Styles - Only show if discipline is boulder */}
            <div className={cn(
                "space-y-3 transition-all duration-300 overflow-hidden",
                discipline === "boulder" ? "opacity-100 max-h-[400px]" : "opacity-0 max-h-0"
            )}>
                <label className="text-sm font-medium leading-none">
                    Style <span className="text-slate-400 font-normal ml-1">(Max 3)</span>
                </label>
                
                <div className="flex flex-wrap gap-2">
                    {BOULDER_STYLES.map((style) => {
                        const isSelected = boulderStyles.includes(style)
                        const isDisabled = !isSelected && boulderStyles.length >= 3

                        return (
                            <button
                                key={style}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => toggleStyle(style)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize",
                                    isSelected
                                        ? "bg-blue-950 text-white border-blue-950"
                                        : isDisabled
                                            ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                )}
                            >
                                {style}
                            </button>
                        )
                    })}
                </div>
            </div>
            
            {/* Hidden inputs to ensure data is submitted with formData if needed, 
                though we are using controlled state in parent likely.
                But providing them helps with standard form actions.
            */}
            <input type="hidden" name="type" value={discipline} />
            <input type="hidden" name="styles" value={JSON.stringify(boulderStyles)} />
        </div>
    )
}
