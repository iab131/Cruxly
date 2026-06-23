"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { CommentInput } from "./comment-input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { pusherClient } from "@/lib/pusher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { createPortal } from "react-dom"
import { GalleryCardStack } from "@/components/gallery-card-stack"

interface CommentUser {
    id: string
    username: string | null
    image: string | null
}

interface Comment {
    id: string
    content: string | null
    mediaUrl: string | null
    mediaType: "image" | "video" | "gallery" | null
    createdAt: string
    user: CommentUser
}

interface CommentSectionProps {
    problemId: string
}

function timeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + "y"
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + "mo"
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + "d"
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + "h"
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + "m"
    return "just now"
}

export function CommentSection({ problemId }: CommentSectionProps) {
    const { user } = useUser()
    const [comments, setComments] = useState<Comment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
    const [hasMore, setHasMore] = useState(false)
    const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null)
    const [previewImages, setPreviewImages] = useState<string[]>([])
    const [previewImageIndex, setPreviewImageIndex] = useState<number>(-1)
    const [previewScale, setPreviewScale] = useState(1)
    const [isMounted, setIsMounted] = useState(false)

    const fetchComments = useCallback(async (cursor?: string) => {
        try {
            const params = new URLSearchParams({ limit: "20" })
            if (cursor) params.append("cursor", cursor)

            const res = await fetch(`/api/problems/${problemId}/comments?${params}`)
            if (!res.ok) throw new Error("Failed to load comments")

            const data = await res.json()
            return data
        } catch (error) {
            console.error(error)
            return null
        }
    }, [problemId])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        let mounted = true
        fetchComments().then((data) => {
            if (mounted && data) {
                setComments(data.comments)
                setNextCursor(data.nextCursor)
                setHasMore(!!data.nextCursor)
                setIsLoading(false)
            }
        })
        return () => { mounted = false }
    }, [fetchComments])

    useEffect(() => {
        const channel = pusherClient.subscribe(`problem-${problemId}`)
        channel.bind("comment:created", (data: { comment: Comment }) => {
            setComments(prev => {
                if (prev.some(c => c.id === data.comment.id)) {
                    return prev
                }
                return [data.comment, ...prev]
            })
        })

        return () => {
            pusherClient.unsubscribe(`problem-${problemId}`)
        }
    }, [problemId])

    useEffect(() => {
        function handleBetaCommentCreated(event: Event) {
            const customEvent = event as CustomEvent<{ problemId: string; comment: Comment }>
            if (customEvent.detail.problemId !== problemId) return

            setComments(prev => {
                if (prev.some(c => c.id === customEvent.detail.comment.id)) {
                    return prev
                }
                return [customEvent.detail.comment, ...prev]
            })
        }

        window.addEventListener("beta-comment-created", handleBetaCommentCreated)
        return () => window.removeEventListener("beta-comment-created", handleBetaCommentCreated)
    }, [problemId])

    useEffect(() => {
        if (previewImageIndex === -1 || previewImages.length === 0) return

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setPreviewImageIndex(-1)
                setPreviewScale(1)
            } else if (event.key === "ArrowLeft" && previewImages.length > 1) {
                setPreviewImageIndex(prev => Math.max(0, prev - 1))
                setPreviewScale(1)
            } else if (event.key === "ArrowRight" && previewImages.length > 1) {
                setPreviewImageIndex(prev => Math.min(previewImages.length - 1, prev + 1))
                setPreviewScale(1)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [previewImageIndex, previewImages])

    useEffect(() => {
        if (previewImageIndex !== -1) {
            document.body.style.overflow = "hidden"
            document.documentElement.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
            document.documentElement.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
            document.documentElement.style.overflow = ""
        }
    }, [previewImageIndex])

    const loadMore = async () => {
        if (!nextCursor || isLoadingMore) return

        setIsLoadingMore(true)
        const data = await fetchComments(nextCursor)
        if (data) {
            setComments(prev => [...prev, ...data.comments])
            setNextCursor(data.nextCursor)
            setHasMore(!!data.nextCursor)
        }
        setIsLoadingMore(false)
    }

    const handleCommentAdded = (newComment: Comment) => {
        setComments(prev => {
            if (prev.some(c => c.id === newComment.id)) {
                return prev
            }
            return [newComment, ...prev]
        })
    }

    const handleDeleteClick = (commentId: string) => {
        setDeleteCandidateId(commentId)
    }

    const handleConfirmDelete = async () => {
        if (!deleteCandidateId) return
        
        const commentId = deleteCandidateId
        setComments(prev => prev.filter(c => c.id !== commentId)) // Optimistic delete
        
        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE"
            })
            
            if (!res.ok) {
                if (res.status === 404) {
                    // Already deleted, technically a success from UI perspective
                    return
                }
                throw new Error("Failed to delete")
            }
        } catch (error) {
            console.error("Delete failed:", error)
            toast.error("Failed to delete comment")
            // Revert state if needed, but for now we assume it stays deleted or refresh fixes it
        } finally {
            setDeleteCandidateId(null)
        }
    }

    const activeImageUrl = previewImageIndex !== -1 ? previewImages[previewImageIndex] : null
    const showLightboxNavigation = previewImageIndex !== -1 && previewImages.length > 1

    return (
        <div className="space-y-8">
            <ConfirmDialog 
                isOpen={!!deleteCandidateId}
                onClose={() => setDeleteCandidateId(null)}
                onConfirm={handleConfirmDelete}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />

            {isMounted && previewImageIndex !== -1 && activeImageUrl && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4 text-center text-sm text-white/70 flex flex-col items-center">
                        <span>
                            {previewImages.length > 1 ? `Step ${previewImageIndex + 1} of ${previewImages.length}` : "Annotated beta"}
                        </span>
                        <span className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider font-semibold">
                            Esc to close {previewImages.length > 1 ? "• Left/Right arrows to navigate" : ""}
                        </span>
                    </div>

                    {/* Left/Right Immersive Side Navigation Buttons */}
                    {showLightboxNavigation && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={previewImageIndex === 0}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPreviewImageIndex(prev => Math.max(0, prev - 1))
                                    setPreviewScale(1)
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-white/10 h-12 w-12 rounded-full disabled:opacity-20 disabled:hover:bg-transparent transition-all shrink-0"
                                aria-label="Previous image"
                            >
                                <ChevronLeft className="h-8 w-8" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={previewImageIndex === previewImages.length - 1}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setPreviewImageIndex(prev => Math.min(previewImages.length - 1, prev + 1))
                                    setPreviewScale(1)
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 text-white hover:bg-white/10 h-12 w-12 rounded-full disabled:opacity-20 disabled:hover:bg-transparent transition-all shrink-0"
                                aria-label="Next image"
                            >
                                <ChevronRight className="h-8 w-8" />
                            </Button>
                        </>
                    )}

                    {/* Image Area - Scrollable if zoomed */}
                    <div 
                        className="flex-1 overflow-auto flex items-center justify-center p-4 cursor-grab active:cursor-grabbing"
                        onClick={() => setPreviewScale(previewScale > 1 ? 1 : 2.5)}
                    >
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                         <img 
                            src={activeImageUrl} 
                            alt="Annotated beta" 
                            style={{ 
                                transform: `scale(${previewScale})`,
                                transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                transformOrigin: 'center center'
                            }}
                            className="max-w-full max-h-[75vh] object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()} 
                         />
                    </div>

                    <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-black/55 p-1.5 text-white shadow-2xl backdrop-blur-md">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-white hover:bg-white/10" 
                            onClick={(e) => { e.stopPropagation(); setPreviewScale(Math.max(0.5, previewScale - 0.5)); }}
                            aria-label="Zoom out"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </Button>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-white hover:bg-white/10" 
                            onClick={(e) => { e.stopPropagation(); setPreviewScale(1); }}
                            title="Reset Zoom"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-white hover:bg-white/10" 
                            onClick={(e) => { e.stopPropagation(); setPreviewScale(previewScale + 0.5); }}
                            aria-label="Zoom in"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-full text-white hover:bg-white/10" 
                            onClick={(e) => { e.stopPropagation(); setPreviewImageIndex(-1); setPreviewScale(1); }}
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>,
                document.body
            )}

            <div className="space-y-1">
                <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Beta & Comments ({comments.length}{hasMore ? "+" : ""})
                </h3>
                <p className="text-xs md:text-sm text-slate-500">
                    Ask questions, share sequence advice, or draw beta on the route image.
                </p>
            </div>

            <CommentInput problemId={problemId} onCommentAdded={handleCommentAdded} />

            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-slate-500 text-center py-8 italic">
                        No comments yet. Be the first to share beta!
                    </p>
                ) : (
                    <>
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4 group">
                                <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-slate-100 shrink-0">
                                    <AvatarImage src={comment.user.image || undefined} />
                                    <AvatarFallback>{comment.user.username?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1 justify-between">
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-semibold text-slate-900 text-sm md:text-base">
                                                {comment.user.username || "Unknown User"}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {timeAgo(comment.createdAt)}
                                            </span>
                                        </div>
                                        
                                        {user?.id === comment.user.id && (
                                            <button 
                                                onClick={() => handleDeleteClick(comment.id)}
                                                className="text-slate-400 hover:text-red-500 text-xs transition-colors p-1"
                                                title="Delete comment"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                    
                                    {comment.mediaType === "gallery" ? (
                                        (() => {
                                            let galleryUrls: string[] = []
                                            let galleryContents: string[] = []
                                            try {
                                                if (comment.mediaUrl) {
                                                    galleryUrls = JSON.parse(comment.mediaUrl)
                                                }
                                            } catch (e) {
                                                console.error("Failed to parse gallery mediaUrl:", e)
                                            }
                                            try {
                                                if (comment.content) {
                                                    galleryContents = JSON.parse(comment.content)
                                                }
                                            } catch (e) {
                                                console.error("Failed to parse gallery content:", e)
                                            }

                                            return (
                                                <GalleryCardStack 
                                                    urls={galleryUrls}
                                                    contents={galleryContents}
                                                    onImageClick={(idx) => {
                                                        setPreviewImages(galleryUrls)
                                                        setPreviewImageIndex(idx)
                                                    }}
                                                />
                                            )
                                        })()
                                    ) : (
                                        <>
                                            <p className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                                {comment.content}
                                            </p>
                                            {comment.mediaUrl && (
                                                <div className="mt-3">
                                                    {comment.mediaType === "video" ? (
                                                        <video 
                                                            src={comment.mediaUrl} 
                                                            controls 
                                                            className="max-w-full md:max-w-md rounded-lg border border-slate-200 max-h-[400px]"
                                                        />
                                                    ) : (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => {
                                                                if (comment.mediaUrl) {
                                                                    setPreviewImages([comment.mediaUrl])
                                                                    setPreviewImageIndex(0)
                                                                }
                                                            }}
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img 
                                                                src={comment.mediaUrl} 
                                                                alt="Comment attachment" 
                                                                className="max-w-full md:max-w-md rounded-lg border border-slate-200 max-h-[400px] object-contain" 
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <Button 
                                variant="ghost" 
                                className="w-full text-slate-500 hover:bg-slate-100/50" 
                                onClick={loadMore}
                                disabled={isLoadingMore}
                            >
                                {isLoadingMore ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : null}
                                Load more comments
                            </Button>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
