"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowUpRight, Circle, Eraser, Loader2, PenLine, RotateCcw, Send, Type, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Tool = "pen" | "arrow" | "circle" | "text" | "stamp"

type Point = {
    x: number
    y: number
}

/** Preset hold markers — the standard beta-guide vocabulary. */
type StampKind = "lh" | "rh" | "lf" | "rf" | "match" | "start" | "top"

type Annotation =
    | { type: "pen"; points: Point[]; color: string; width: number }
    | { type: "arrow"; start: Point; end: Point; color: string; width: number }
    | { type: "circle"; start: Point; end: Point; color: string; width: number }
    | { type: "text"; point: Point; text: string; color: string }
    | { type: "stamp"; point: Point; kind: StampKind }

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

// Fixed semantic colours/shapes so every beta guide reads the same way:
// hands are circles, feet are squares, route markers are pills.
const STAMPS: Record<StampKind, { label: string; color: string; shape: "circle" | "square" | "pill"; title: string }> = {
    lh: { label: "LH", color: "#3b82f6", shape: "circle", title: "Left hand" },
    rh: { label: "RH", color: "#ef4444", shape: "circle", title: "Right hand" },
    lf: { label: "LF", color: "#06b6d4", shape: "square", title: "Left foot" },
    rf: { label: "RF", color: "#f97316", shape: "square", title: "Right foot" },
    match: { label: "M", color: "#eab308", shape: "circle", title: "Match hands" },
    start: { label: "START", color: "#22c55e", shape: "pill", title: "Start hold" },
    top: { label: "TOP", color: "#a855f7", shape: "pill", title: "Finish hold" },
}

const STAMP_ORDER: StampKind[] = ["lh", "rh", "lf", "rf", "match", "start", "top"]

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

function drawStamp(ctx: CanvasRenderingContext2D, point: Point, kind: StampKind) {
    const spec = STAMPS[kind]
    const { x, y } = point

    ctx.save()
    ctx.shadowColor = "rgba(0,0,0,0.45)"
    ctx.shadowBlur = 6
    ctx.shadowOffsetY = 1
    ctx.fillStyle = spec.color
    ctx.strokeStyle = "rgba(255,255,255,0.95)"
    ctx.lineWidth = 2.5

    if (spec.shape === "circle") {
        ctx.beginPath()
        ctx.arc(x, y, 16, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
    } else if (spec.shape === "square") {
        ctx.beginPath()
        ctx.roundRect(x - 15, y - 15, 30, 30, 8)
        ctx.fill()
        ctx.stroke()
    } else {
        ctx.font = "800 12px system-ui, sans-serif"
        const width = ctx.measureText(spec.label).width + 20
        ctx.beginPath()
        ctx.roundRect(x - width / 2, y - 13, width, 26, 13)
        ctx.fill()
        ctx.stroke()
    }

    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
    ctx.fillStyle = "#fff"
    ctx.font = spec.shape === "pill" ? "800 12px system-ui, sans-serif" : "800 11px system-ui, sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(spec.label, x, y + 0.5)
    ctx.restore()
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

    if (annotation.type === "stamp") {
        drawStamp(ctx, annotation.point, annotation.kind)
    }

    ctx.restore()
}

export function ProblemImageAnnotator({ problemId, image, name, onCancel, onPosted }: ProblemImageAnnotatorProps) {
    const imageRef = useRef<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [tool, setTool] = useState<Tool>("stamp")
    const [stampKind, setStampKind] = useState<StampKind>("lh")
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

    function commitAnnotation(annotation: Annotation) {
        const updated = [...annotations, annotation]
        setAnnotations(updated)
        setSteps(prev => {
            const next = [...prev]
            next[activeStepIndex] = { annotations: updated, content }
            return next
        })
    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        const point = getPoint(event)

        if (tool === "stamp") {
            commitAnnotation({ type: "stamp", point, kind: stampKind })
            return
        }

        if (tool === "text") {
            const text = labelText.trim()
            if (!text) {
                toast.error("Add label text first")
                return
            }
            commitAnnotation({ type: "text", point, text, color })
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
        commitAnnotation(draftAnnotation)
        setDraftAnnotation(null)
        setIsDrawing(false)
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

    const hint =
        tool === "stamp"
            ? `Tap the photo to place a ${STAMPS[stampKind].title.toLowerCase()} marker`
            : tool === "text"
                ? "Type a label, then tap the photo to place it"
                : "Drag on the photo to draw"

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:p-4">
            {/* Row 1 — hold markers: the primary beta-guide tools */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Holds</span>
                {STAMP_ORDER.map((kind) => {
                    const spec = STAMPS[kind]
                    const isActive = tool === "stamp" && stampKind === kind
                    return (
                        <button
                            key={kind}
                            type="button"
                            title={spec.title}
                            onClick={() => { setTool("stamp"); setStampKind(kind) }}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-all active:scale-95",
                                isActive
                                    ? "border-white bg-white text-slate-900 shadow-sm"
                                    : "border-white/15 bg-white/5 text-white/80 hover:bg-white/15 hover:text-white"
                            )}
                        >
                            <span
                                className={cn("h-3 w-3 shrink-0", spec.shape === "square" ? "rounded-[3px]" : "rounded-full")}
                                style={{ backgroundColor: spec.color }}
                            />
                            {spec.label}
                        </button>
                    )
                })}
                <span className="ml-auto hidden text-xs text-white/40 sm:block">{hint}</span>
            </div>

            {/* Row 2 — freehand tools, colour, width, actions */}
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Draw</span>
                <div className="flex items-center gap-1 rounded-full bg-black/25 p-1">
                    {tools.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            onClick={() => setTool(option.value)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                                tool === option.value
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-white/70 hover:text-white"
                            )}
                        >
                            {option.icon}
                            <span className="hidden md:inline">{option.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 px-1">
                    {COLORS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setColor(option)}
                            className={cn(
                                "h-6 w-6 rounded-full border border-white/30 transition-transform",
                                color === option && "scale-110 ring-2 ring-white ring-offset-1 ring-offset-transparent"
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
                    className="w-20 accent-white"
                    aria-label="Stroke width"
                />

                {tool === "text" && (
                    <input
                        value={labelText}
                        onChange={(event) => setLabelText(event.target.value)}
                        placeholder="Label"
                        maxLength={32}
                        className="h-8 min-w-0 rounded-full border border-white/20 bg-black/30 px-3 text-sm text-white placeholder:text-white/50"
                    />
                )}

                <div className="ml-auto flex items-center gap-1">
                    <button
                        type="button"
                        onClick={handleUndo}
                        disabled={annotations.length === 0}
                        title="Undo"
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span className="hidden md:inline">Undo</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleClear}
                        disabled={annotations.length === 0}
                        title="Clear step"
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30"
                    >
                        <Eraser className="h-4 w-4" />
                        <span className="hidden md:inline">Clear</span>
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        title="Cancel"
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                        <span className="hidden md:inline">Cancel</span>
                    </button>
                </div>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex flex-wrap items-center gap-2 px-1 text-white select-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Steps</span>
                <div className="flex flex-wrap items-center gap-1.5">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center overflow-hidden rounded-full border transition-colors",
                                activeStepIndex === index ? "border-blue-500 bg-blue-600" : "border-white/15 bg-white/5"
                            )}
                        >
                            <button
                                type="button"
                                onClick={() => switchStep(index)}
                                className={cn(
                                    "px-3 py-1 text-xs font-bold transition-colors",
                                    activeStepIndex === index ? "text-white" : "text-white/70 hover:text-white"
                                )}
                            >
                                {index + 1}
                            </button>
                            {steps.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeStep(index)}
                                    className="pr-2 pl-0.5 py-1 text-white/40 hover:text-red-300 transition-colors"
                                    title="Delete step"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addStep}
                        className="rounded-full border border-dashed border-white/25 px-3 py-1 text-xs font-semibold text-white/70 transition-colors hover:border-white/50 hover:text-white"
                    >
                        + Step
                    </button>
                </div>
                <span className="ml-auto text-xs text-white/40 sm:hidden">{hint}</span>
            </div>

            <div ref={containerRef} className="relative min-h-0 flex-1 overflow-auto rounded-2xl bg-black/40">
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
                            className={cn("absolute inset-0 touch-none", tool === "stamp" || tool === "text" ? "cursor-copy" : "cursor-crosshair")}
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
                    placeholder={`Explain step ${activeStepIndex + 1} — sequence, body position, advice...`}
                    maxLength={500}
                    className="min-h-[76px] resize-none rounded-2xl border-white/15 bg-white/95 text-slate-900"
                />
                <Button
                    onClick={postBeta}
                    disabled={isPosting || (!content.trim() && annotations.length === 0)}
                    className="h-full min-h-[44px] rounded-2xl bg-blue-600 font-bold hover:bg-blue-500"
                >
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Post beta
                </Button>
            </div>
        </div>
    )
}
