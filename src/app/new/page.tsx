"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud, Loader2, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CreateProblemPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            setPreview(URL.createObjectURL(selectedFile))
            setFile(selectedFile)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        // Mock submission
        setUploading(true)
        setTimeout(() => {
            setUploading(false)
            router.push("/")
        }, 1500)
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-blue-950 mb-2">Post a New Climb</h1>
            <p className="text-slate-500 mb-8">Share your latest send or project with the community.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Image Upload Zone */}
                <div className="space-y-2">
                    <Label className="text-base font-semibold">Photo</Label>
                    <div className="relative group cursor-pointer">
                        <div className={`
                            border-2 border-dashed rounded-xl p-8 text-center transition-all
                            ${preview ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}
                         `}>
                            <Input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                                onChange={handleFileChange}
                                required={!preview} // Only required if no preview
                            />

                            {preview ? (
                                <div className="relative h-64 w-full">
                                    <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-sm" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <p className="text-white font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Change Photo</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-8">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-slate-900">Click to upload photo</p>
                                    <p className="text-sm text-slate-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Problem Name</Label>
                        <Input id="name" name="name" placeholder="e.g. The Pink One" required className="bg-white" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade</Label>
                            <Input id="grade" name="grade" placeholder="e.g. V4" required className="bg-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gym">Location / Gym</Label>
                            <Input id="gym" name="gym" placeholder="Search gym..." required className="bg-white" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description & Beta</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Share some beta or thoughts about the climb..."
                            className="bg-white min-h-[120px]"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <Button size="lg" className="w-full bg-blue-950 hover:bg-blue-900 font-bold" disabled={uploading}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Publishing...
                            </>
                        ) : "Publish Problem"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
