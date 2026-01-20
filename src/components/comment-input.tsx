"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"

interface CommentInputProps {
    problemId: string
    onCommentAdded: (comment: any) => void
}

export function CommentInput({ problemId, onCommentAdded }: CommentInputProps) {
    const { user, isLoaded, isSignedIn } = useUser()
    const [content, setContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mediaFile, setMediaFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Basic validation
        if (file.type.startsWith("image/") && file.size > 10 * 1024 * 1024) {
            toast.error("Image must be under 10MB")
            return
        }
        if (file.type.startsWith("video/") && file.size > 50 * 1024 * 1024) {
            toast.error("Video must be under 50MB")
            return
        }

        setMediaFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const clearMedia = () => {
        setMediaFile(null)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
    }

    const handleSubmit = async () => {
        if (!content.trim() && !mediaFile) return

        setIsSubmitting(true)
        try {
            let mediaUrl = null
            let mediaType = null

            // 1. Upload Media if present
            if (mediaFile) {
                const presignRes = await fetch("/api/upload/presign", {
                    method: "POST",
                    body: JSON.stringify({
                        filename: mediaFile.name,
                        contentType: mediaFile.type,
                        size: mediaFile.size,
                    }),
                })

                if (!presignRes.ok) throw new Error("Failed to get upload URL")
                const { uploadUrl, publicUrl } = await presignRes.json()
                console.log("Upload URL:", uploadUrl)

                const uploadRes = await fetch(uploadUrl, {
                    method: "PUT",
                    body: mediaFile,
                    headers: {
                        "Content-Type": mediaFile.type,
                        "Access-Control-Allow-Origin": "*", // Attempting to help, though server must allow it
                    },
                })

                if (!uploadRes.ok) {
                    console.error("Upload failed:", uploadRes.status, uploadRes.statusText)
                    throw new Error("Failed to upload file")
                }
                
                mediaUrl = publicUrl
                mediaType = mediaFile.type.startsWith("image/") ? "image" : "video"
            }

            // 2. Create Comment
            const response = await fetch(`/api/problems/${problemId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    content,
                    mediaUrl,
                    mediaType
                }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || "Failed to post comment")
            }

            const newComment = await response.json()
            onCommentAdded(newComment)
            setContent("")
            clearMedia()
            toast.success("Comment posted!")
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isLoaded) {
        return <div className="h-24 bg-slate-50 rounded-lg animate-pulse" />
    }

    if (!isSignedIn) {
        return (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <p className="text-slate-600 mb-2">Log in to join the conversation</p>
            </div>
        )
    }

    return (
        <div className="flex gap-4 items-start">
            <Avatar className="w-8 h-8 md:w-10 md:h-10 border border-slate-200">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div className="relative">
                    <Textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Ask a question or share beta..."
                        className="min-h-[100px] resize-none bg-white focus-visible:ring-slate-400 pb-10"
                        maxLength={500}
                    />
                    
                    {/* Media Preview */}
                    {previewUrl && (
                        <div className="absolute bottom-12 left-2 z-10">
                            <div className="relative inline-block">
                                {mediaFile?.type.startsWith("image/") ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={previewUrl} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-slate-200" />
                                ) : (
                                    <video src={previewUrl} className="h-16 w-16 object-cover rounded-md border border-slate-200" />
                                )}
                                <button 
                                    onClick={clearMedia}
                                    className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                >
                                    <span className="sr-only">Remove</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-2 left-2 flex gap-2">
                        <label className="cursor-pointer p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                                onChange={handleFileSelect}
                            />
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        </label>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">
                        {content.length}/500
                    </span>
                    <Button 
                        onClick={handleSubmit} 
                        disabled={(!content.trim() && !mediaFile) || isSubmitting}
                        size="sm"
                        className="gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Post Comment
                    </Button>
                </div>
            </div>
        </div>
    )
}
