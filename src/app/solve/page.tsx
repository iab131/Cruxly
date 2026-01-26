"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Upload } from "lucide-react"

export default function AISolvePage() {
    return (
        <div className="max-w-2xl mx-auto p-8 space-y-8">
            <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                    <Sparkles className="w-8 h-8 text-white" />
                 </div>
                 <h1 className="text-3xl font-bold text-slate-900">AI Beta Solver</h1>
                 <p className="text-slate-500 max-w-md mx-auto">Upload a photo of a boulder problem, and our AI will attempt to analyze the holds and suggest a beta.</p>
            </div>

            <Card className="border-slate-200 border-dashed border-2 shadow-none bg-slate-50/50">
                <CardHeader>
                    <CardTitle className="text-center">Upload Climbing Route</CardTitle>
                    <CardDescription className="text-center">Supports .jpg, .png (Max 10MB)</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <Button disabled className="w-full max-w-xs">
                        Select Image (Coming Soon)
                    </Button>
                </CardContent>
            </Card>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100">
                <strong>coming soon:</strong> This feature is currently under development. Soon you&apos;ll be able to get instant feedback on route reading and move sequences.
            </div>
        </div>
    )
}
