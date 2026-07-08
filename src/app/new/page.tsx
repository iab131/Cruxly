"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud, Loader2, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner" 

import { GradeSelector } from "@/components/GradeSelector"
import { DisciplineSelector } from "@/components/DisciplineSelector"
import { LocationPicker } from "@/components/map/LocationPicker"

export default function CreateProblemPage() {
    const [file, setFile] = useState<File | null>(null)
    const [grade, setGrade] = useState("")
    const [showGradeError, setShowGradeError] = useState(false)
    const [discipline, setDiscipline] = useState("boulder")
    const [boulderStyles, setBoulderStyles] = useState<string[]>([])
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error("File is too large. Maximum size is 5MB.")
                e.target.value = "" // Reset input
                return
            }

            setPreview(URL.createObjectURL(selectedFile))
            setFile(selectedFile)
        }
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!file) {
            toast.error("Please upload an image")
            return
        }
        if (!grade) {
            setShowGradeError(true)
            return
        }

        setUploading(true)
        
        const form = event.currentTarget
        const formData = new FormData(form)
        formData.set('image', file) // Ensure file is set correctly
        formData.set('type', discipline)

        if (discipline === 'boulder') {
            formData.set('tags', JSON.stringify(boulderStyles))
        } else {
            formData.set('tags', JSON.stringify([]))
        }
        
        try {
            const res = await fetch('/api/problems', {
                method: 'POST',
                body: formData,
            })

            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || 'Failed to create problem')
                return
            }

            const problem = await res.json()
            router.push(`/p/${problem.id}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-blue-950 tracking-tight mb-8">New climb</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload Zone */}
                <div className="relative group cursor-pointer">
                    <div className={`
                        border border-dashed rounded-3xl transition-colors
                        ${preview ? 'border-slate-200' : 'border-slate-300 hover:border-blue-400'}
                     `}>
                        <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer z-20 w-full h-full"
                            onChange={handleFileChange}
                            required={!preview} // Only required if no preview
                        />

                        {preview ? (
                            <div className="relative h-72 w-full p-2">
                                <img src={preview} alt="Preview" className="w-full h-full object-contain rounded-2xl" />
                                <div className="absolute inset-2 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                                    <p className="text-white font-medium flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Change photo</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 py-16 text-slate-500 group-hover:text-blue-700 transition-colors">
                                <UploadCloud className="w-5 h-5" />
                                <span className="text-sm font-medium">Add a route photo</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="sr-only">Problem name</Label>
                        <Input id="name" name="name" placeholder="Name your climb" required className="rounded-full bg-white" />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-slate-500">Difficulty</Label>
                        <GradeSelector
                            value={grade} 
                            onChange={(val) => {
                                setGrade(val)
                                if (val) setShowGradeError(false)
                            }} 
                        />
                        {showGradeError && (
                            <p className="text-red-500 text-xs mt-1 font-semibold animate-in fade-in duration-200">
                                Please select a grade
                            </p>
                        )}
                    </div>
                    
                    <div>
                        <DisciplineSelector
                            discipline={discipline} 
                            onDisciplineChange={setDiscipline}
                            boulderStyles={boulderStyles}
                            onBoulderStylesChange={setBoulderStyles}
                        />
                    </div>

                    <LocationPicker />

                    <div className="space-y-2">
                        <Label htmlFor="description" className="sr-only">Description and beta</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Share some beta or thoughts about the climb..."
                            className="rounded-2xl bg-white min-h-[120px]"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <Button size="lg" className="w-full rounded-full bg-blue-950 hover:bg-blue-900 font-bold shadow-md shadow-blue-950/25" disabled={uploading}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Publishing...
                            </>
                        ) : "Publish"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
