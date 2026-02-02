"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 text-slate-900 selection:bg-blue-200">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/50 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 opacity-60" />

      {/* Navbar (Absolute) */}
      <nav className="absolute top-0 w-full z-50 p-6 md:p-8 flex justify-between items-center max-w-7xl left-1/2 -translate-x-1/2">
        <div className="flex items-center gap-2">
             {/* <Image src="/logo-blue.png" alt="Cruxly" width={32} height={32} className="w-8 h-8 object-contain" /> */}
             <span className="text-2xl font-bold text-blue-950 tracking-tight">Cruxly</span>
        </div>
        <div className="flex gap-4">
             {/* Hid Sign In / Launch App for 'Coming Soon' mode */}
        </div>
      </nav>

      {/* Main Content Split */}
      <main className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            {/* Left: Text Content */}
            <div className="space-y-8 md:pr-12 animate-in slide-in-from-left-8 fade-in duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-semibold text-sm">
                    <Clock className="w-4 h-4 text-blue-700" />
                    <span>Launching soon</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-blue-950 leading-[1.1]">
                    Climbing tracking,<br/>
                    <span className="text-blue-600">reimagined.</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-600 max-w-lg leading-relaxed">
                    Cruxly is building the ultimate tool for indoor climbers. Track sessions, unlock beta, and connect with your local gym community.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                     <div className="flex w-full max-w-sm items-center space-x-2">
                        {/* Placeholder for email capture if needed later, or just a button */}
                        <Button size="lg" className="h-14 px-8 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-lg shadow-xl shadow-blue-950/20 w-full md:w-auto" disabled>
                            Join Waitlist
                        </Button>
                     </div>
                </div>
                
                 <p className="text-sm text-slate-500 font-medium">
                    Be the first to know when we launch.
                </p>
            </div>

            {/* Right: Visual Image Card */}
            <div className="hidden md:block relative h-[600px] w-full animate-in slide-in-from-right-8 fade-in duration-1000 delay-200">
                 {/* Floating Cards / UI Mockup feel */}
                 <div className="absolute inset-0 bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
                     <Image 
                        src="/hero-bg.png" 
                        alt="Climbing Gym" 
                        fill 
                        className="object-cover grayscale overlay opacity-50 contrast-125"
                        priority
                     />
                     {/* Overlay Gradient */}
                     <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/20 to-transparent" />
                     
                     {/* Floating UI Elements Mockup inside the image */}
                     <div className="absolute bottom-8 left-8 right-8 text-center text-white/80 font-mono text-sm tracking-widest uppercase">
                         Constructing Routes...
                     </div>
                 </div>
            </div>
      </main>
    </div>
  )
}
