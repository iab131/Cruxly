"use client"

import { useUser, UserButton, SignInButton, SignOutButton, useClerk } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, MapPin, Settings } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Problem {
    id: string
    name: string
    grade: string
    gym: string
    image: string | null
    type: string
    createdAt: string
}

interface UserData {
    id: string
    username: string | null
    image: string | null
    bio: string | null
    problems: Problem[]
}

export default function MePage() {
    const { user, isLoaded, isSignedIn } = useUser()
    const { openUserProfile } = useClerk()
    const [data, setData] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetch('/api/me')
                .then(res => res.json())
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false))
        } else if (isLoaded && !isSignedIn) {
            setLoading(false)
        }
    }, [isLoaded, isSignedIn])

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this problem?")) return

        try {
            const res = await fetch(`/api/problems/${id}`, { method: 'DELETE' })
            if (res.ok) {
                setData(prev => prev ? {
                    ...prev,
                    problems: prev.problems.filter(p => p.id !== id)
                } : null)
            } else {
                alert("Failed to delete")
            }
        } catch (e) {
            console.error(e)
            alert("Error deleting")
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
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
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
                        <p className="text-slate-500">{data?.problems.length || 0} Problems Posted</p>
                    </div>

                    <p className="text-slate-700 max-w-lg">
                        {data?.bio || "This guy is too lazy to write a bio."}
                    </p>

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
                <h2 className="text-2xl font-bold mb-4">Your Problems</h2>
                {data?.problems.length === 0 ? (
                    <div className="text-center p-8 bg-slate-50 rounded-xl">
                        <p className="text-slate-500 mb-4">You haven't posted any problems yet.</p>
                        <Button asChild>
                            <Link href="/new">Post a Climb</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data?.problems.map(problem => (
                            <div key={problem.id} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <Link href={`/p/${problem.id}`} className="block aspect-video bg-slate-100 relative overflow-hidden">
                                     {problem.image ? (
                                         <img src={problem.image} alt={problem.name} className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                                     )}
                                     <div className="absolute top-2 right-2">
                                         <Badge className="bg-white/90 text-slate-900 border-none">{problem.grade}</Badge>
                                     </div>
                                </Link>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg truncate flex-1">{problem.name}</h3>
                                        <button 
                                            onClick={() => handleDelete(problem.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            title="Delete Problem"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin className="w-4 h-4" />
                                        <span>{problem.gym}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
