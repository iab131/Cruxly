"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { CommentInput } from "./comment-input"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, MessageSquare } from "lucide-react"

interface CommentUser {
    id: string
    username: string | null
    image: string | null
}

interface Comment {
    id: string
    content: string | null
    mediaUrl: string | null
    mediaType: "image" | "video" | null
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
        setComments(prev => [newComment, ...prev])
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
                throw new Error("Failed to delete")
            }
        } catch (error) {
            console.error("Delete failed:", error)
            // Ideally revert state here on error
        } finally {
            setDeleteCandidateId(null)
        }
    }

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

            <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-500" />
                <h3 className="text-xl font-bold text-slate-900">
                    Comments ({comments.length}{hasMore ? "+" : ""})
                </h3>
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
                                <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-slate-100">
                                    <AvatarImage src={comment.user.image || undefined} />
                                    <AvatarFallback>{comment.user.username?.slice(0, 2).toUpperCase() || "??"}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
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
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img 
                                                    src={comment.mediaUrl} 
                                                    alt="Comment attachment" 
                                                    className="max-w-full md:max-w-md rounded-lg border border-slate-200 max-h-[400px] object-contain" 
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {hasMore && (
                            <Button 
                                variant="ghost" 
                                className="w-full text-slate-500" 
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
