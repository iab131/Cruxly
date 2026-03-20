"use client"

import { useUser, UserButton, SignInButton, SignOutButton, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, MapPin, Settings, Pencil, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ProblemCard } from "@/components/problem-card"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getGradeBadgeStyle } from "@/lib/climbing-utils"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface Problem {
    id: string
    name: string
    grade: string
    gym: string
    image: string | null
    type: string
    tags: string[]
    createdAt: string
    user?: { username: string | null }
    _count?: { likes: number, comments: number }
    hasLiked?: boolean
    hasSaved?: boolean
}

interface UserData {
    id: string
    username: string | null
    image: string | null
    bio: string | null
    problems: Problem[]
    likes: { problem: Problem }[]
    saves: { problem: Problem }[]
}

type Tab = "problems" | "likes" | "saves"

export default function MePage() {
    const { user, isLoaded, isSignedIn } = useUser()
    const { openUserProfile } = useClerk()
    const [data, setData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditingBio, setIsEditingBio] = useState(false)
    const [bioInput, setBioInput] = useState("")
    const [activeTab, setActiveTab] = useState<Tab>("problems")

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return
        
        // Don't set full page loading for subsequent fetches to avoid flash
        if (!data) setLoading(true)

        fetch('/api/me')
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch user data")
                return res.json()
            })
            .then(setData)
            .catch(err => {
                console.error(err)
            })
            .finally(() => setLoading(false))
    }, [isLoaded, isSignedIn, activeTab])

    const [problemToDelete, setProblemToDelete] = useState<string | null>(null)

    const handleDelete = (id: string) => {
        setProblemToDelete(id)
    }

    const confirmDelete = async () => {
        if (!problemToDelete) return

        try {
            const res = await fetch(`/api/problems/${problemToDelete}`, { method: 'DELETE' })
            if (res.ok) {
                setData(prev => prev ? {
                    ...prev,
                    problems: prev.problems?.filter(p => p.id !== problemToDelete) || []
                } : null)
            } else {
                alert("Failed to delete")
            }
        } catch (e) {
            console.error(e)
            alert("Error deleting")
        }
    }

    const handleSaveBio = async () => {
        try {
            const res = await fetch('/api/me', {
                method: 'PATCH',
                body: JSON.stringify({ bio: bioInput }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                const updatedUser = await res.json()
                setData(prev => prev ? { ...prev, bio: updatedUser.bio } : null)
                setIsEditingBio(false)
            } else {
                alert("Failed to update bio")
            }
        } catch (e) {
            console.error(e)
            alert("Error updating bio")
        }
    }

    if (!isLoaded || loading) return <div className="p-8 text-center">Loading...</div>

    if (!isSignedIn) {
        return (
            <div className="p-8 text-center space-y-4">
                <h1 className="text-2xl font-bold">Please Sign In</h1>
                <p>You need to be signed in to view your profile.</p>
                <div className="flex justify-center">
                    <SignInButton mode="modal">
                        <Button>Sign In</Button>
                    </SignInButton>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full shadow-xl">
                    {user?.imageUrl ? (
                        <img 
                            src={user.imageUrl} 
                            alt="Profile"
                            className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover border-4 border-white bg-white"
                        />
                    ) : (
                        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center">
                            <span className="text-4xl">?</span>
                        </div>
                    )}
                </div>
                <div className="space-y-4 flex-1">
                    <div>
                        <h1 className="text-3xl font-bold">{user?.username || user?.firstName || "Climber"}</h1>
                        <p className="text-slate-500">{data?.problems?.length || 0} Problems Posted</p>
                    </div>

                    <div className="relative group">
                        {isEditingBio ? (
                            <div className="space-y-2 max-w-lg">
                                <Textarea 
                                    value={bioInput} 
                                    onChange={(e) => setBioInput(e.target.value)}
                                    placeholder="Tell us about yourself..."
                                    className="resize-none"
                                />
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={handleSaveBio}>
                                        <Check className="w-4 h-4 mr-1" />
                                        Save
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => setIsEditingBio(false)}>
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-2 group/bio max-w-lg">
                                <p className="text-slate-700">
                                    {data?.bio || "This guy is too lazy to write a bio."}
                                </p>
                                <button 
                                    onClick={() => {
                                        setBioInput(data?.bio || "")
                                        setIsEditingBio(true)
                                    }}
                                    className="opacity-0 group-hover/bio:opacity-100 transition-opacity text-slate-400 hover:text-blue-500 pt-1"
                                    title="Edit Bio"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                         <Button onClick={() => openUserProfile()} variant="outline" size="sm" className="border-slate-200">
                             <Settings className="w-4 h-4 mr-2" />
                             Manage Account
                         </Button>
                         <SignOutButton>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                                Log Out
                            </Button>
                         </SignOutButton>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl">
                        {(["problems", "likes", "saves"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
                                    activeTab === tab 
                                        ? "bg-white text-slate-900 shadow-sm" 
                                        : "text-slate-500 hover:text-slate-900"
                                )}
                            >
                                {tab === "problems" ? "Posted" : tab}
                            </button>
                        ))}
                    </div>
                </div>

                {(!data || !(activeTab === "problems" ? data.problems : activeTab === "likes" ? data.likes : data.saves)?.length) ? (
                    <div className="text-center p-12 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <p className="text-slate-500 mb-4">No {activeTab} yet.</p>
                        {activeTab === "problems" && (
                            <Button asChild>
                                <Link href="/new">Post a Climb</Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(activeTab === "problems" 
                            ? data?.problems 
                            : activeTab === "likes" 
                                ? data?.likes?.map(l => l.problem) 
                                : data?.saves?.map(s => s.problem)
                        )?.map(problem => (
                            <div key={problem.id} className="relative group">
                                <ProblemCard
                                    id={problem.id}
                                    name={problem.name}
                                    grade={problem.grade}
                                    gym={problem.gym}
                                    image={problem.image}
                                    builder={problem.user?.username || "Unknown"}
                                    tags={problem.tags}
                                    initialLikesCount={problem._count?.likes || 0}
                                    initialHasLiked={problem.hasLiked}
                                    initialHasSaved={problem.hasSaved}
                                    isLoggedIn={true}
                                />
                                {activeTab === "problems" && (
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleDelete(problem.id)
                                        }}
                                        className="absolute top-4 left-4 z-30 p-2 bg-black/50 hover:bg-black/80 hover:text-red-400 text-white backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                        title="Delete Problem"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            
            <ConfirmDialog
                isOpen={!!problemToDelete}
                onClose={() => setProblemToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Problem"
                description="Are you sure you want to delete this problem? This action cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    )
}
