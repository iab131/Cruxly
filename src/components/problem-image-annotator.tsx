"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpRight, Circle, Eraser, Loader2, PenLine, RotateCcw, Send, Type, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Tool = "pen" | "arrow" | "circle" | "text"

type Point = {
    x: number
    y: number
}

type Annotation =
    | { type: "pen"; points: Point[]; color: string; width: number }
    | { type: "arrow"; start: Point; end: Point; color: string; width: number }
    | { type: "circle"; start: Point; end: Point; color: string; width: number }
    | { type: "text"; point: Point; text: string; color: string }

type BetaStep = {
    annotations: Annotation[]
    content: string
}

interface ProblemImageAnnotatorProps {
    problemId: string
    image: string
    name: string
    onCancel: () => void
    onPosted?: () => void
}

const COLORS = ["#ef4444", "#f97316", "#22c55e", "#3b82f6", "#f8fafc"]

function getEditableImageSrc(image: string) {
    if (!/^https?:\/\//i.test(image)) return image
    return `/api/image-proxy?url=${encodeURIComponent(image)}`
}

function drawArrow(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, width: number) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const headLength = 18

    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = width
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
}

function drawAnnotation(ctx: CanvasRenderingContext2D, annotation: Annotation) {
    ctx.save()

    if (annotation.type === "pen") {
        if (annotation.points.length < 2) return
        ctx.strokeStyle = annotation.color
        ctx.lineWidth = annotation.width
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.beginPath()
        ctx.moveTo(annotation.points[0].x, annotation.points[0].y)
        annotation.points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y))
        ctx.stroke()
    }

    if (annotation.type === "arrow") {
        drawArrow(ctx, annotation.start, annotation.end, annotation.color, annotation.width)
    }

    if (annotation.type === "circle") {
        const x = Math.min(annotation.start.x, annotation.end.x)
        const y = Math.min(annotation.start.y, annotation.end.y)
        const width = Math.abs(annotation.end.x - annotation.start.x)
        const height = Math.abs(annotation.end.y - annotation.start.y)

        ctx.strokeStyle = annotation.color
        ctx.lineWidth = annotation.width
        ctx.beginPath()
        ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2)
        ctx.stroke()
    }

    if (annotation.type === "text") {
        ctx.font = "700 22px sans-serif"
        ctx.lineWidth = 4
        ctx.strokeStyle = "rgba(0,0,0,.75)"
        ctx.fillStyle = annotation.color
        ctx.strokeText(annotation.text, annotation.point.x, annotation.point.y)
        ctx.fillText(annotation.text, annotation.point.x, annotation.point.y)
    }

    ctx.restore()
}

export function ProblemImageAnnotator({ problemId, image, name, onCancel, onPosted }: ProblemImageAnnotatorProps) {
    const imageRef = useRef<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [tool, setTool] = useState<Tool>("pen")
    const [color, setColor] = useState(COLORS[0])
    const [strokeWidth, setStrokeWidth] = useState(5)
    const [labelText, setLabelText] = useState("")
    
    // Step state configuration
    const [steps, setSteps] = useState<BetaStep[]>([{ annotations: [], content: "" }])
    const [activeStepIndex, setActiveStepIndex] = useState(0)

    const [annotations, setAnnotations] = useState<Annotation[]>([])
    const [draftAnnotation, setDraftAnnotation] = useState<Annotation | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [content, setContent] = useState("")
    const [isPosting, setIsPosting] = useState(false)
    const editableImage = getEditableImageSrc(image)

    const redraw = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        annotations.forEach((annotation) => drawAnnotation(ctx, annotation))
        if (draftAnnotation) drawAnnotation(ctx, draftAnnotation)
    }, [annotations, draftAnnotation])

    const syncCanvasSize = useCallback(() => {
        const imageElement = imageRef.current
        const canvas = canvasRef.current
        if (!imageElement || !canvas) return

        const rect = imageElement.getBoundingClientRect()
        canvas.width = Math.max(1, Math.round(rect.width))
        canvas.height = Math.max(1, Math.round(rect.height))
        redraw()
    }, [redraw])

    useEffect(() => {
        syncCanvasSize()
        window.addEventListener("resize", syncCanvasSize)
        return () => window.removeEventListener("resize", syncCanvasSize)
    }, [syncCanvasSize])

    useEffect(() => {
        redraw()
    }, [redraw])

    function getPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
        const rect = event.currentTarget.getBoundingClientRect()
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
        }
    }

    const switchStep = (newIndex: number) => {
        // Save current active step state
        const updated = [...steps]
        updated[activeStepIndex] = { annotations, content }
        setSteps(updated)

        // Load targeted step state
        setAnnotations(updated[newIndex].annotations)
        setContent(updated[newIndex].content)
        setActiveStepIndex(newIndex)
    }

    const addStep = () => {
        const updated = [...steps]
        updated[activeStepIndex] = { annotations, content }
        
        updated.push({ annotations: [], content: "" })
        setSteps(updated)

        setAnnotations([])
        setContent("")
        setActiveStepIndex(updated.length - 1)
    }

    const removeStep = (indexToRemove: number) => {
        if (steps.length <= 1) return

        const updated = steps.filter((_, i) => i !== indexToRemove)
        setSteps(updated)

        let nextIndex = activeStepIndex
        if (activeStepIndex === indexToRemove) {
            nextIndex = Math.max(0, indexToRemove - 1)
        } else if (activeStepIndex > indexToRemove) {
            nextIndex = activeStepIndex - 1
        }

        setAnnotations(updated[nextIndex].annotations)
        setContent(updated[nextIndex].content)
        setActiveStepIndex(nextIndex)
    }

    const handleContentChange = (val: string) => {
        setContent(val)
        setSteps(prev => {
            const next = [...prev]
            next[activeStepIndex] = { annotations, content: val }
            return next
        })
    }

    const handleUndo = () => {
        const updated = annotations.slice(0, -1)
        setAnnotations(updated)
        setSteps(prev => {
            const next = [...prev]
            next[activeStepIndex] = { annotations: updated, content }
            return next
        })
    }

    const handleClear = () => {
        setAnnotations([])
        setSteps(prev => {
            const next = [...prev]
            next[activeStepIndex] = { annotations: [], content }
            return next
        })
    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        const point = getPoint(event)

        if (tool === "text") {
            const text = labelText.trim()
            if (!text) {
                toast.error("Add label text first")
                return
            }
            const updated = [...annotations, { type: "text", point, text, color } as Annotation]
            setAnnotations(updated)
            setSteps(prev => {
                const next = [...prev]
                next[activeStepIndex] = { annotations: updated, content }
                return next
            })
            return
        }

        setIsDrawing(true)
        if (tool === "pen") setDraftAnnotation({ type: "pen", points: [point], color, width: strokeWidth })
        if (tool === "arrow") setDraftAnnotation({ type: "arrow", start: point, end: point, color, width: strokeWidth })
        if (tool === "circle") setDraftAnnotation({ type: "circle", start: point, end: point, color, width: strokeWidth })
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing || !draftAnnotation) return
        event.preventDefault()
        const point = getPoint(event)

        if (draftAnnotation.type === "pen") {
            setDraftAnnotation({ ...draftAnnotation, points: [...draftAnnotation.points, point] })
        } else if (draftAnnotation.type === "arrow" || draftAnnotation.type === "circle") {
            setDraftAnnotation({ ...draftAnnotation, end: point })
        }
    }

    function finishDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
        if (!isDrawing || !draftAnnotation) return
        event.preventDefault()
        const updated = [...annotations, draftAnnotation]
        setAnnotations(updated)
        setDraftAnnotation(null)
        setIsDrawing(false)
        setSteps(prev => {
            const next = [...prev]
            next[activeStepIndex] = { annotations: updated, content }
            return next
        })
    }

    async function exportAnnotatedImage(stepAnnotations: Annotation[]) {
        const sourceImage = imageRef.current
        const annotationCanvas = canvasRef.current
        if (!sourceImage || !annotationCanvas) throw new Error("Image is not ready")

        const output = document.createElement("canvas")
        output.width = annotationCanvas.width
        output.height = annotationCanvas.height
        const ctx = output.getContext("2d")
        if (!ctx) throw new Error("Could not export image")

        ctx.fillStyle = "#020617"
        ctx.fillRect(0, 0, output.width, output.height)
        ctx.drawImage(sourceImage, 0, 0, output.width, output.height)
        stepAnnotations.forEach((annotation) => drawAnnotation(ctx, annotation))

        return new Promise<Blob>((resolve, reject) => {
            output.toBlob((blob) => {
                if (blob) resolve(blob)
                else reject(new Error("Could not create image file"))
            }, "image/jpeg", 0.85)
        })
    }

    async function postBeta() {
        const finalSteps = [...steps]
        finalSteps[activeStepIndex] = { annotations, content }

        const hasAnyContent = finalSteps.some(s => s.content.trim() || s.annotations.length > 0)
        if (!hasAnyContent) {
            toast.error("Add a note or an annotation first")
            return
        }

        setIsPosting(true)
        try {
            const formData = new FormData()

            for (let i = 0; i < finalSteps.length; i++) {
                const step = finalSteps[i]
                const stepNum = i + 1
                
                // Append text description for this step
                formData.append("contents", step.content.trim())

                // Export this step's canvas
                const blob = await exportAnnotatedImage(step.annotations)
                formData.append("images", new File([blob], `beta-${problemId}-step-${stepNum}.jpg`, { type: "image/jpeg" }))
            }

            const response = await fetch(`/api/problems/${problemId}/beta`, {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to post beta guide")
            }

            const comment = await response.json()
            window.dispatchEvent(new CustomEvent("beta-comment-created", {
                detail: { problemId, comment },
            }))

            toast.success("Beta guide posted!")
            onPosted?.()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to post beta guide")
        } finally {
            setIsPosting(false)
        }
    }

    const tools: Array<{ value: Tool; label: string; icon: React.ReactNode }> = [
        { value: "pen", label: "Pen", icon: <PenLine className="h-4 w-4" /> },
        { value: "arrow", label: "Arrow", icon: <ArrowUpRight className="h-4 w-4" /> },
        { value: "circle", label: "Circle", icon: <Circle className="h-4 w-4" /> },
        { value: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
    ]

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:p-4">
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white/10 p-2 text-white">
                {tools.map((option) => (
                    <Button
                        key={option.value}
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setTool(option.value)}
                        className={cn(
                            "text-white hover:bg-white/15",
                            tool === option.value && "bg-white/20"
                        )}
                    >
                        {option.icon}
                        {option.label}
                    </Button>
                ))}

                <div className="flex items-center gap-1 px-1">
                    {COLORS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setColor(option)}
                            className={cn(
                                "h-7 w-7 rounded-full border-2 border-white/40",
                                color === option && "ring-2 ring-white"
                            )}
                            style={{ backgroundColor: option }}
                            aria-label={`Use ${option}`}
                        />
                    ))}
                </div>

                <input
                    type="range"
                    min="2"
                    max="12"
                    value={strokeWidth}
                    onChange={(event) => setStrokeWidth(Number(event.target.value))}
                    className="w-24"
                    aria-label="Stroke width"
                />

                {tool === "text" && (
                    <input
                        value={labelText}
                        onChange={(event) => setLabelText(event.target.value)}
                        placeholder="Label"
                        maxLength={32}
                        className="h-9 min-w-0 rounded-md border border-white/20 bg-black/30 px-3 text-sm text-white placeholder:text-white/50"
                    />
                )}

                <div className="ml-auto flex items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleUndo}
                        disabled={annotations.length === 0}
                        className="text-white hover:bg-white/15"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Undo
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleClear}
                        disabled={annotations.length === 0}
                        className="text-white hover:bg-white/15"
                    >
                        <Eraser className="h-4 w-4" />
                        Clear
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={onCancel} className="text-white hover:bg-white/15">
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex flex-wrap items-center gap-2 px-1 py-1 text-white border-b border-white/5 select-none">
                <span className="text-xs font-semibold text-white/50 mr-1">Beta Guide Steps:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                    {steps.map((s, index) => (
                        <div key={index} className="flex items-center bg-white/5 rounded-md border border-white/10 overflow-hidden">
                            <button
                                type="button"
                                onClick={() => switchStep(index)}
                                className={cn(
                                    "px-2.5 py-1 text-xs font-bold transition-colors",
                                    activeStepIndex === index 
                                        ? "bg-blue-600 text-white" 
                                        : "text-white/70 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                Step {index + 1}
                            </button>
                            {steps.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="px-1.5 py-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 border-l border-white/10 transition-colors"
                                    title="Delete step"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={addStep}
                        className="h-7 text-xs text-blue-400 hover:text-blue-300 hover:bg-white/5 border border-dashed border-blue-500/30 rounded-md gap-1"
                    >
                        + Add Step
                    </Button>
                </div>
            </div>

            <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto rounded-lg bg-black/40">
                <div className="flex min-h-full items-center justify-center p-3">
                    <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            ref={imageRef}
                            src={editableImage}
                            crossOrigin="anonymous"
                            alt={name}
                            onLoad={syncCanvasSize}
                            onError={() => toast.error("Could not load this image for editing")}
                            className="max-h-[58vh] max-w-full select-none object-contain"
                            draggable={false}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 touch-none"
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={finishDrawing}
                            onPointerCancel={finishDrawing}
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Textarea
                    value={content}
                    onChange={(event) => handleContentChange(event.target.value)}
                    placeholder="Explain your beta, sequence, or advice for this step..."
                    maxLength={500}
                    className="min-h-[76px] resize-none border-white/15 bg-white/95 text-slate-900"
                />
                <Button onClick={postBeta} disabled={isPosting || (!content.trim() && annotations.length === 0)} className="h-full min-h-[44px]">
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post beta
                </Button>
            </div>
        </div>
    )
}
