"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { ArrowUpRight, Circle, Eraser, Loader2, PenLine, PersonStanding, RotateCcw, Send, Type, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Tool = "pose" | "arrow" | "circle" | "pen" | "text"

type Point = {
    x: number
    y: number
}

type PoseJointName =
    | "head"
    | "chest"
    | "hips"
    | "leftShoulder"
    | "rightShoulder"
    | "leftElbow"
    | "rightElbow"
    | "leftHand"
    | "rightHand"
    | "leftKnee"
    | "rightKnee"
    | "leftFoot"
    | "rightFoot"

type PosePreset = "neutral" | "flag" | "dropKnee" | "heelHook" | "toeHook" | "highStep" | "cross" | "dyno"
type PoseJoints = Record<PoseJointName, Point>
type PoseAnnotation = { type: "pose"; joints: PoseJoints; preset?: PosePreset; color?: string; opacity?: number }

type Annotation =
    | PoseAnnotation
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

const POSE_JOINTS: PoseJointName[] = [
    "head",
    "chest",
    "hips",
    "leftShoulder",
    "rightShoulder",
    "leftElbow",
    "rightElbow",
    "leftHand",
    "rightHand",
    "leftKnee",
    "rightKnee",
    "leftFoot",
    "rightFoot",
]

const CONTACT_JOINTS = new Set<PoseJointName>(["leftHand", "rightHand", "leftFoot", "rightFoot"])

const SKELETON: Array<[PoseJointName, PoseJointName]> = [
    ["head", "chest"],
    ["chest", "hips"],
    ["chest", "leftShoulder"],
    ["leftShoulder", "leftElbow"],
    ["leftElbow", "leftHand"],
    ["chest", "rightShoulder"],
    ["rightShoulder", "rightElbow"],
    ["rightElbow", "rightHand"],
    ["hips", "leftKnee"],
    ["leftKnee", "leftFoot"],
    ["hips", "rightKnee"],
    ["rightKnee", "rightFoot"],
]

const PRESETS: Record<PosePreset, { label: string; joints: PoseJoints }> = {
    neutral: {
        label: "Neutral",
        joints: {
            head: { x: 0, y: -0.19 },
            chest: { x: 0, y: -0.08 },
            hips: { x: 0, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.09 },
            rightShoulder: { x: 0.08, y: -0.09 },
            leftElbow: { x: -0.14, y: 0.02 },
            rightElbow: { x: 0.14, y: 0.02 },
            leftHand: { x: -0.18, y: -0.1 },
            rightHand: { x: 0.18, y: -0.1 },
            leftKnee: { x: -0.08, y: 0.22 },
            rightKnee: { x: 0.08, y: 0.22 },
            leftFoot: { x: -0.14, y: 0.34 },
            rightFoot: { x: 0.14, y: 0.34 },
        },
    },
    flag: {
        label: "Flag",
        joints: {
            head: { x: -0.02, y: -0.2 },
            chest: { x: 0, y: -0.08 },
            hips: { x: -0.02, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.1 },
            rightShoulder: { x: 0.08, y: -0.07 },
            leftElbow: { x: -0.14, y: 0 },
            rightElbow: { x: 0.16, y: -0.02 },
            leftHand: { x: -0.18, y: -0.11 },
            rightHand: { x: 0.22, y: -0.15 },
            leftKnee: { x: -0.1, y: 0.22 },
            rightKnee: { x: 0.18, y: 0.16 },
            leftFoot: { x: -0.16, y: 0.34 },
            rightFoot: { x: 0.35, y: 0.25 },
        },
    },
    dropKnee: {
        label: "Drop knee",
        joints: {
            head: { x: 0.02, y: -0.2 },
            chest: { x: 0, y: -0.08 },
            hips: { x: 0.04, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.08 },
            rightShoulder: { x: 0.08, y: -0.1 },
            leftElbow: { x: -0.15, y: 0.02 },
            rightElbow: { x: 0.16, y: -0.02 },
            leftHand: { x: -0.2, y: -0.08 },
            rightHand: { x: 0.2, y: -0.16 },
            leftKnee: { x: -0.02, y: 0.24 },
            rightKnee: { x: 0.16, y: 0.16 },
            leftFoot: { x: -0.18, y: 0.3 },
            rightFoot: { x: 0.08, y: 0.34 },
        },
    },
    heelHook: {
        label: "Heel hook",
        joints: {
            head: { x: 0, y: -0.2 },
            chest: { x: 0, y: -0.08 },
            hips: { x: -0.02, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.09 },
            rightShoulder: { x: 0.08, y: -0.09 },
            leftElbow: { x: -0.15, y: 0.01 },
            rightElbow: { x: 0.15, y: 0 },
            leftHand: { x: -0.2, y: -0.12 },
            rightHand: { x: 0.2, y: -0.1 },
            leftKnee: { x: -0.18, y: 0.12 },
            rightKnee: { x: 0.08, y: 0.23 },
            leftFoot: { x: -0.3, y: -0.03 },
            rightFoot: { x: 0.16, y: 0.34 },
        },
    },
    toeHook: {
        label: "Toe hook",
        joints: {
            head: { x: 0.01, y: -0.2 },
            chest: { x: 0, y: -0.08 },
            hips: { x: 0.03, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.1 },
            rightShoulder: { x: 0.08, y: -0.08 },
            leftElbow: { x: -0.16, y: 0 },
            rightElbow: { x: 0.16, y: 0.02 },
            leftHand: { x: -0.22, y: -0.11 },
            rightHand: { x: 0.2, y: -0.08 },
            leftKnee: { x: -0.16, y: 0.18 },
            rightKnee: { x: 0.1, y: 0.23 },
            leftFoot: { x: -0.3, y: 0.02 },
            rightFoot: { x: 0.15, y: 0.34 },
        },
    },
    highStep: {
        label: "High step",
        joints: {
            head: { x: 0, y: -0.2 },
            chest: { x: 0, y: -0.08 },
            hips: { x: -0.01, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.09 },
            rightShoulder: { x: 0.08, y: -0.09 },
            leftElbow: { x: -0.15, y: 0 },
            rightElbow: { x: 0.16, y: -0.02 },
            leftHand: { x: -0.2, y: -0.12 },
            rightHand: { x: 0.22, y: -0.14 },
            leftKnee: { x: -0.2, y: 0 },
            rightKnee: { x: 0.08, y: 0.22 },
            leftFoot: { x: -0.28, y: -0.08 },
            rightFoot: { x: 0.14, y: 0.34 },
        },
    },
    cross: {
        label: "Cross",
        joints: {
            head: { x: 0.02, y: -0.2 },
            chest: { x: 0, y: -0.08 },
            hips: { x: 0, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.08 },
            rightShoulder: { x: 0.08, y: -0.1 },
            leftElbow: { x: 0.05, y: -0.13 },
            rightElbow: { x: -0.05, y: -0.03 },
            leftHand: { x: 0.2, y: -0.16 },
            rightHand: { x: -0.18, y: -0.08 },
            leftKnee: { x: -0.08, y: 0.22 },
            rightKnee: { x: 0.1, y: 0.22 },
            leftFoot: { x: -0.15, y: 0.34 },
            rightFoot: { x: 0.16, y: 0.34 },
        },
    },
    dyno: {
        label: "Dyno",
        joints: {
            head: { x: 0, y: -0.24 },
            chest: { x: 0, y: -0.1 },
            hips: { x: 0, y: 0.08 },
            leftShoulder: { x: -0.08, y: -0.11 },
            rightShoulder: { x: 0.08, y: -0.11 },
            leftElbow: { x: -0.13, y: -0.22 },
            rightElbow: { x: 0.13, y: -0.22 },
            leftHand: { x: -0.18, y: -0.34 },
            rightHand: { x: 0.18, y: -0.34 },
            leftKnee: { x: -0.1, y: 0.2 },
            rightKnee: { x: 0.1, y: 0.2 },
            leftFoot: { x: -0.22, y: 0.26 },
            rightFoot: { x: 0.22, y: 0.26 },
        },
    },
}

const PRESET_ORDER: PosePreset[] = ["neutral", "flag", "dropKnee", "heelHook", "toeHook", "highStep", "cross", "dyno"]

function getEditableImageSrc(image: string) {
    if (!/^https?:\/\//i.test(image)) return image
    return `/api/image-proxy?url=${encodeURIComponent(image)}`
}

function toCanvasPoint(point: Point, width: number, height: number): Point {
    return { x: point.x * width, y: point.y * height }
}

function toNormalizedPoint(point: Point, width: number, height: number): Point {
    return {
        x: Math.min(1, Math.max(0, point.x / Math.max(width, 1))),
        y: Math.min(1, Math.max(0, point.y / Math.max(height, 1))),
    }
}

function createPose(center: Point, preset: PosePreset, width: number, height: number): PoseJoints {
    const scale = Math.min(width, height) * 0.8
    const anchor = PRESETS[preset].joints.hips
    return POSE_JOINTS.reduce((joints, joint) => {
        const offset = PRESETS[preset].joints[joint]
        joints[joint] = toNormalizedPoint({ x: center.x + (offset.x - anchor.x) * scale, y: center.y + (offset.y - anchor.y) * scale }, width, height)
        return joints
    }, {} as PoseJoints)
}

function drawArrow(ctx: CanvasRenderingContext2D, start: Point, end: Point, color: string, width: number) {
    const angle = Math.atan2(end.y - start.y, end.x - start.x)
    const headLength = 20
    const shaftEnd = {
        x: end.x - headLength * 0.72 * Math.cos(angle),
        y: end.y - headLength * 0.72 * Math.sin(angle),
    }

    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = width
    ctx.lineCap = "round"
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(shaftEnd.x, shaftEnd.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(end.x, end.y)
    ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6))
    ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6))
    ctx.closePath()
    ctx.fill()
}

function hexToRgb(hex: string) {
    const value = hex.replace("#", "")
    const number = Number.parseInt(value.length === 3 ? value.split("").map((char) => char + char).join("") : value, 16)
    return `${(number >> 16) & 255},${(number >> 8) & 255},${number & 255}`
}

function drawPose(ctx: CanvasRenderingContext2D, pose: PoseAnnotation, options: { ghost?: boolean; showHandles?: boolean } = {}) {
    const width = ctx.canvas.width
    const height = ctx.canvas.height
    const ghost = options.ghost ?? false
    const showHandles = options.showHandles ?? true
    const alpha = ghost ? 0.22 : 0.68
    const poseColor = hexToRgb(pose.color || "#38bdf8")
    const poseOpacity = pose.opacity ?? 0.68

    ctx.save()
    ctx.lineWidth = ghost ? 3 : 5
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.strokeStyle = ghost ? `rgba(255,255,255,${alpha})` : `rgba(${poseColor},${poseOpacity})`

    SKELETON.forEach(([from, to]) => {
        const start = toCanvasPoint(pose.joints[from], width, height)
        const end = toCanvasPoint(pose.joints[to], width, height)
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
    })

    POSE_JOINTS.forEach((joint) => {
        if (!showHandles && !CONTACT_JOINTS.has(joint)) return
        const point = toCanvasPoint(pose.joints[joint], width, height)
        const isContact = CONTACT_JOINTS.has(joint)
        ctx.beginPath()
        ctx.arc(point.x, point.y, isContact ? 8 : 5.5, 0, Math.PI * 2)
        ctx.fillStyle = isContact ? `rgba(250,204,21,${ghost ? 0.35 : 0.85})` : `rgba(255,255,255,${ghost ? 0.28 : 0.82})`
        ctx.strokeStyle = ghost ? "rgba(255,255,255,0.25)" : "rgba(15,23,42,0.75)"
        ctx.lineWidth = 2
        ctx.fill()
        ctx.stroke()
    })

    ctx.restore()
}

function drawAnnotation(ctx: CanvasRenderingContext2D, annotation: Annotation, options: { showPoseHandles?: boolean } = {}) {
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

    if (annotation.type === "arrow") drawArrow(ctx, annotation.start, annotation.end, annotation.color, annotation.width)

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

    if (annotation.type === "pose") drawPose(ctx, annotation, { showHandles: options.showPoseHandles })

    ctx.restore()
}

export function ProblemImageAnnotator({ problemId, image, name, onCancel, onPosted }: ProblemImageAnnotatorProps) {
    const imageRef = useRef<HTMLImageElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const [tool, setTool] = useState<Tool>("pose")
    const [isPreview, setIsPreview] = useState(false)
    const [posePreset, setPosePreset] = useState<PosePreset>("neutral")
    const [poseColor, setPoseColor] = useState("#38bdf8")
    const [poseOpacity, setPoseOpacity] = useState(0.68)
    const [color, setColor] = useState(COLORS[0])
    const [strokeWidth, setStrokeWidth] = useState(5)
    const [labelText, setLabelText] = useState("")
    const [steps, setSteps] = useState<BetaStep[]>([{ annotations: [], content: "" }])
    const [activeStepIndex, setActiveStepIndex] = useState(0)
    const [annotations, setAnnotations] = useState<Annotation[]>([])
    const [draftAnnotation, setDraftAnnotation] = useState<Annotation | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [dragJoint, setDragJoint] = useState<PoseJointName | null>(null)
    const [undoStack, setUndoStack] = useState<Annotation[][]>([])
    const [showPreviousPose, setShowPreviousPose] = useState(false)
    const [content, setContent] = useState("")
    const [isPosting, setIsPosting] = useState(false)
    const editableImage = getEditableImageSrc(image)

    const redraw = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const previousPose = steps[activeStepIndex - 1]?.annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        if (showPreviousPose && previousPose) drawPose(ctx, previousPose, { ghost: true, showHandles: false })
        annotations.forEach((annotation) => drawAnnotation(ctx, annotation, { showPoseHandles: !isPreview }))
        if (draftAnnotation) drawAnnotation(ctx, draftAnnotation)
    }, [activeStepIndex, annotations, draftAnnotation, isPreview, showPreviousPose, steps])

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
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    function syncStep(nextAnnotations: Annotation[], nextContent = content) {
        setSteps(prev => {
            const next = [...prev]
            next[activeStepIndex] = { annotations: nextAnnotations, content: nextContent }
            return next
        })
    }

    function getPoseIndex(items = annotations) {
        return items.findIndex((annotation) => annotation.type === "pose")
    }

    function setPose(pose: PoseAnnotation) {
        const poseIndex = getPoseIndex()
        const updated = poseIndex >= 0
            ? annotations.map((annotation, index) => index === poseIndex ? pose : annotation)
            : [...annotations, pose]
        setAnnotations(updated)
        syncStep(updated)
    }

    function updatePose(nextPose: PoseAnnotation) {
        const updated = annotations.map((annotation) => annotation.type === "pose" ? nextPose : annotation)
        setAnnotations(updated)
        syncStep(updated)
    }

    function deletePose() {
        setUndoStack((prev) => [...prev, annotations])
        const updated = annotations.filter((annotation) => annotation.type !== "pose")
        setAnnotations(updated)
        syncStep(updated)
    }

    function hitPoseJoint(point: Point): PoseJointName | null {
        const canvas = canvasRef.current
        const pose = annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        if (!canvas || !pose) return null

        for (const joint of POSE_JOINTS) {
            const jointPoint = toCanvasPoint(pose.joints[joint], canvas.width, canvas.height)
            const radius = CONTACT_JOINTS.has(joint) ? 13 : 10
            if (Math.hypot(point.x - jointPoint.x, point.y - jointPoint.y) <= radius) return joint
        }

        return null
    }

    function applyPreset(preset: PosePreset) {
        setPosePreset(preset)
        const canvas = canvasRef.current
        if (!canvas) return
        const existingPose = annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        const center = existingPose ? toCanvasPoint(existingPose.joints.hips, canvas.width, canvas.height) : { x: canvas.width / 2, y: canvas.height / 2 }
        setUndoStack((prev) => [...prev, annotations])
        setPose({ type: "pose", joints: createPose(center, preset, canvas.width, canvas.height), preset, color: poseColor, opacity: poseOpacity })
    }

    function copyPreviousPose() {
        const previousPose = steps[activeStepIndex - 1]?.annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        if (!previousPose) return
        setUndoStack((prev) => [...prev, annotations])
        setPoseColor(previousPose.color || poseColor)
        setPoseOpacity(previousPose.opacity ?? poseOpacity)
        setPose({ ...previousPose, joints: { ...previousPose.joints } })
    }

    const switchStep = (newIndex: number) => {
        const updated = [...steps]
        updated[activeStepIndex] = { annotations, content }
        setSteps(updated)
        setAnnotations(updated[newIndex].annotations)
        setContent(updated[newIndex].content)
        setActiveStepIndex(newIndex)
        const nextPose = updated[newIndex].annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        if (nextPose) {
            setPoseColor(nextPose.color || poseColor)
            setPoseOpacity(nextPose.opacity ?? poseOpacity)
        }
        setUndoStack([])
    }

    const addStep = () => {
        const updated = [...steps]
        updated[activeStepIndex] = { annotations, content }
        const previousPose = annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        const nextAnnotations: Annotation[] = previousPose ? [{ ...previousPose, joints: { ...previousPose.joints } }] : []
        updated.push({ annotations: nextAnnotations, content: "" })
        setSteps(updated)
        setAnnotations(nextAnnotations)
        setContent("")
        setActiveStepIndex(updated.length - 1)
        if (previousPose) {
            setPoseColor(previousPose.color || poseColor)
            setPoseOpacity(previousPose.opacity ?? poseOpacity)
        }
        setUndoStack([])
    }

    const removeStep = (indexToRemove: number) => {
        if (steps.length <= 1) return

        const updated = steps.filter((_, i) => i !== indexToRemove)
        let nextIndex = activeStepIndex
        if (activeStepIndex === indexToRemove) nextIndex = Math.max(0, indexToRemove - 1)
        else if (activeStepIndex > indexToRemove) nextIndex = activeStepIndex - 1

        setSteps(updated)
        setAnnotations(updated[nextIndex].annotations)
        setContent(updated[nextIndex].content)
        setActiveStepIndex(nextIndex)
        const nextPose = updated[nextIndex].annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
        if (nextPose) {
            setPoseColor(nextPose.color || poseColor)
            setPoseOpacity(nextPose.opacity ?? poseOpacity)
        }
        setUndoStack([])
    }

    const handleContentChange = (value: string) => {
        setContent(value)
        syncStep(annotations, value)
    }

    const handleUndo = () => {
        const previous = undoStack[undoStack.length - 1]
        if (previous) {
            setUndoStack((prev) => prev.slice(0, -1))
            setAnnotations(previous)
            syncStep(previous)
            return
        }

        const updated = annotations.slice(0, -1)
        setAnnotations(updated)
        syncStep(updated)
    }

    const handleClear = () => {
        setAnnotations([])
        syncStep([])
    }

    function commitAnnotation(annotation: Annotation) {
        const updated = [...annotations, annotation]
        setAnnotations(updated)
        syncStep(updated)
    }

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
        if (isPreview) return
        event.preventDefault()
        event.currentTarget.setPointerCapture(event.pointerId)
        const point = getPoint(event)

        if (tool === "pose") {
            const joint = hitPoseJoint(point)
            if (joint) {
                setUndoStack((prev) => [...prev, annotations])
                setDragJoint(joint)
                setIsDrawing(true)
                return
            }

            const canvas = canvasRef.current
            if (!canvas || getPoseIndex() >= 0) return
            setUndoStack((prev) => [...prev, annotations])
            setPose({ type: "pose", joints: createPose(point, posePreset, canvas.width, canvas.height), preset: posePreset, color: poseColor, opacity: poseOpacity })
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
        if (dragJoint) {
            event.preventDefault()
            const point = getPoint(event)
            const canvas = canvasRef.current
            const pose = annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
            if (!canvas || !pose) return
            setPose({ ...pose, joints: { ...pose.joints, [dragJoint]: toNormalizedPoint(point, canvas.width, canvas.height) } })
            return
        }

        if (!isDrawing || !draftAnnotation) return
        event.preventDefault()
        const point = getPoint(event)

        if (draftAnnotation.type === "pen") setDraftAnnotation({ ...draftAnnotation, points: [...draftAnnotation.points, point] })
        else if (draftAnnotation.type === "arrow" || draftAnnotation.type === "circle") setDraftAnnotation({ ...draftAnnotation, end: point })
    }

    function finishDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
        if (dragJoint) {
            event.preventDefault()
            setDragJoint(null)
            setIsDrawing(false)
            return
        }

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
        stepAnnotations.forEach((annotation) => drawAnnotation(ctx, annotation, { showPoseHandles: false }))

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

        const hasAnyContent = finalSteps.some(step => step.content.trim() || step.annotations.length > 0)
        if (!hasAnyContent) {
            toast.error("Add a note or an annotation first")
            return
        }

        setIsPosting(true)
        try {
            const formData = new FormData()

            for (let i = 0; i < finalSteps.length; i++) {
                const step = finalSteps[i]
                formData.append("contents", step.content.trim())
                const blob = await exportAnnotatedImage(step.annotations)
                formData.append("images", new File([blob], `beta-${problemId}-step-${i + 1}.jpg`, { type: "image/jpeg" }))
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

    const tools: Array<{ value: Tool; label: string; icon: ReactNode }> = [
        { value: "pose", label: "Pose", icon: <PersonStanding className="h-4 w-4" /> },
        { value: "arrow", label: "Arrow", icon: <ArrowUpRight className="h-4 w-4" /> },
        { value: "circle", label: "Circle", icon: <Circle className="h-4 w-4" /> },
        { value: "pen", label: "Pen", icon: <PenLine className="h-4 w-4" /> },
        { value: "text", label: "Text", icon: <Type className="h-4 w-4" /> },
    ]

    const previousStepHasPose = activeStepIndex > 0 && steps[activeStepIndex - 1]?.annotations.some((annotation) => annotation.type === "pose")
    const currentPose = annotations.find((annotation): annotation is PoseAnnotation => annotation.type === "pose")
    const hint = tool === "pose" ? "Tap the photo to place a pose, then drag joints" : tool === "text" ? "Type a label, then tap the photo to place it" : "Drag on the photo to draw"

    function handlePoseColorChange(nextColor: string) {
        setPoseColor(nextColor)
        if (currentPose) updatePose({ ...currentPose, color: nextColor })
    }

    function handlePoseOpacityChange(nextOpacity: number) {
        setPoseOpacity(nextOpacity)
        if (currentPose) updatePose({ ...currentPose, opacity: nextOpacity })
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:p-4">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Tools</span>
                <div className="flex items-center gap-1 rounded-full bg-black/25 p-1">
                    {tools.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            title={option.label}
                            onClick={() => setTool(option.value)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                                tool === option.value ? "bg-white text-slate-900 shadow-sm" : "text-white/70 hover:text-white"
                            )}
                        >
                            {option.icon}
                            <span className="hidden md:inline">{option.label}</span>
                        </button>
                    ))}
                </div>
            </div>

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
                                    "px-3 py-1.5 text-xs font-bold transition-colors",
                                    activeStepIndex === index ? "text-white" : "text-white/70 hover:text-white"
                                )}
                            >
                                Step {index + 1}
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
                        className="rounded-full border border-dashed border-white/25 px-3 py-1.5 text-xs font-semibold text-white/70 transition-colors hover:border-white/50 hover:text-white"
                    >
                        + Step
                    </button>
                </div>
                <div className="ml-auto flex flex-wrap items-center gap-1">
                    <div className="flex items-center rounded-full bg-black/25 p-1">
                        <button
                            type="button"
                            onClick={() => setIsPreview(false)}
                            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", !isPreview ? "bg-white text-slate-900" : "text-white/65 hover:text-white")}
                        >
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPreview(true)}
                            className={cn("rounded-full px-3 py-1.5 text-xs font-semibold transition-colors", isPreview ? "bg-white text-slate-900" : "text-white/65 hover:text-white")}
                        >
                            Preview
                        </button>
                    </div>
                    {!isPreview && (
                        <>
                            <button
                                type="button"
                                onClick={handleUndo}
                                disabled={annotations.length === 0}
                                title="Undo"
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Undo
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                disabled={annotations.length === 0}
                                title="Clear step"
                                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-30"
                            >
                                <Eraser className="h-4 w-4" />
                                Clear
                            </button>
                        </>
                    )}
                    <button
                        type="button"
                        onClick={onCancel}
                        title="Cancel"
                        className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                        Cancel
                    </button>
                </div>
            </div>

            <div className={cn("grid min-h-0 flex-1 gap-3", !isPreview && "lg:grid-cols-[minmax(0,1fr)_280px]")}>
                <div className="relative min-h-0 overflow-auto rounded-2xl bg-black/40">
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
                                className={cn(
                                    "absolute inset-0 touch-none",
                                    isPreview ? "pointer-events-none cursor-default" : tool === "pose" || tool === "text" ? "cursor-copy" : "cursor-crosshair"
                                )}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={finishDrawing}
                                onPointerCancel={finishDrawing}
                            />
                            {!isPreview && tool === "pose" && !currentPose && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
                                    <div className="rounded-full border border-white/15 bg-black/55 px-4 py-2 text-sm font-semibold text-white/85 shadow-lg backdrop-blur">
                                        Tap the wall to place the climber pose.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {!isPreview && tool === "pose" && (
                    <aside className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 text-white">
                        <div className="mb-3">
                            <h3 className="text-sm font-bold">Pose settings</h3>
                            <p className="text-xs text-white/45">{hint}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Preset</div>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {PRESET_ORDER.map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => applyPreset(preset)}
                                            className={cn(
                                                "rounded-lg border px-2.5 py-2 text-xs font-semibold transition-colors",
                                                posePreset === preset ? "border-sky-300 bg-sky-400 text-slate-950" : "border-white/10 bg-black/20 text-white/75 hover:bg-white/10 hover:text-white"
                                            )}
                                        >
                                            {PRESETS[preset].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <button
                                    type="button"
                                    onClick={copyPreviousPose}
                                    disabled={!previousStepHasPose}
                                    className="rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 disabled:opacity-30"
                                >
                                    Copy previous pose
                                </button>
                                <label className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white/80">
                                    Show previous pose ghost
                                    <input
                                        type="checkbox"
                                        checked={showPreviousPose}
                                        onChange={(event) => setShowPreviousPose(event.target.checked)}
                                        disabled={!previousStepHasPose}
                                        className="h-4 w-4 accent-sky-400"
                                    />
                                </label>
                            </div>

                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Pose color</div>
                                <div className="flex items-center gap-2">
                                    {COLORS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handlePoseColorChange(option)}
                                            className={cn("h-8 w-8 rounded-full border border-white/30 transition-transform", poseColor === option && "scale-110 ring-2 ring-white")}
                                            style={{ backgroundColor: option }}
                                            aria-label={`Use ${option} for pose`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Pose opacity</span>
                                <input
                                    type="range"
                                    min="0.25"
                                    max="0.9"
                                    step="0.05"
                                    value={poseOpacity}
                                    onChange={(event) => handlePoseOpacityChange(Number(event.target.value))}
                                    className="w-full accent-sky-400"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={deletePose}
                                disabled={!currentPose}
                                className="w-full rounded-lg border border-red-400/25 px-3 py-2 text-sm font-semibold text-red-200 transition-colors hover:bg-red-500/15 disabled:opacity-30"
                            >
                                Delete pose
                            </button>
                        </div>
                    </aside>
                )}

                {!isPreview && tool !== "pose" && (
                    <aside className="rounded-2xl border border-white/10 bg-white/[0.07] p-3 text-white">
                        <div className="mb-3">
                            <h3 className="text-sm font-bold">{tool === "text" ? "Text settings" : "Drawing settings"}</h3>
                            <p className="text-xs text-white/45">{hint}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/40">Color</div>
                                <div className="flex items-center gap-2">
                                    {COLORS.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => setColor(option)}
                                            className={cn("h-8 w-8 rounded-full border border-white/30 transition-transform", color === option && "scale-110 ring-2 ring-white")}
                                            style={{ backgroundColor: option }}
                                            aria-label={`Use ${option}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {tool !== "text" && (
                                <label className="block">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Brush size</span>
                                    <input
                                        type="range"
                                        min="2"
                                        max="12"
                                        value={strokeWidth}
                                        onChange={(event) => setStrokeWidth(Number(event.target.value))}
                                        className="w-full accent-white"
                                        aria-label="Stroke width"
                                    />
                                </label>
                            )}

                            {tool === "text" && (
                                <label className="block">
                                    <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-white/40">Label text</span>
                                    <input
                                        value={labelText}
                                        onChange={(event) => setLabelText(event.target.value)}
                                        placeholder="Short label"
                                        maxLength={32}
                                        className="h-10 w-full rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-white placeholder:text-white/45"
                                    />
                                </label>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="space-y-1">
                    <label className="px-1 text-xs font-bold uppercase tracking-widest text-white/45">Step cue</label>
                    <Textarea
                        value={content}
                        onChange={(event) => handleContentChange(event.target.value)}
                        placeholder="Example: RH bump, keep left hip close, flag right foot."
                        maxLength={500}
                        className="min-h-[76px] resize-none rounded-2xl border-white/15 bg-white/95 text-slate-900"
                    />
                </div>
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
