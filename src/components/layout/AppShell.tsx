"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, PlusSquare, User, Search, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SignInButton, SignedOut, SignedIn, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Toaster } from "sonner"

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useUser()
    // Don't show shell on auth pages
    const isAuthPage = pathname?.startsWith("/auth")
    // Check for Landing Page
    const isLandingPage = pathname === "/landing"

    if (isAuthPage || isLandingPage) {
        return <div className="min-h-screen bg-slate-50">{children}</div>
    }

    const navItems = [
        { label: "Home", href: "/", icon: Home, protected: false },
        { label: "Explore", href: "/search", icon: Search, protected: false },
        { label: "Create", href: "/new", icon: PlusSquare, protected: true },
        { label: "AI Solver", href: "/solve", icon: Sparkles, protected: true },
        { label: "Profile", href: "/me", icon: User, protected: true },
    ]

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Desktop Sidebar (Left) */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r bg-white z-50">
                <div className="p-6 h-20 flex items-center">
                    <Link href="/" className="flex flex-col items-center gap-2 text-2xl font-bold text-blue-950 tracking-tight">
                        <span>Cruxly</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-2 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const commonClasses = cn(
                            "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group hover:bg-slate-50 w-full",
                            isActive && "font-bold text-blue-950 bg-slate-50"
                        )
                        const Icon = item.icon
                        const iconClasses = cn(
                            "w-6 h-6 transition-colors",
                            isActive ? "stroke-[2.5px] text-blue-950" : "text-slate-500 group-hover:text-slate-900"
                        )
                        const textClasses = cn("text-base", isActive ? "text-blue-950" : "text-slate-600 group-hover:text-slate-900")

                        const content = (
                            <>
                                <Icon className={iconClasses} />
                                <span className={textClasses}>{item.label}</span>
                            </>
                        )

                        if (item.protected) {
                             return (
                                <div key={item.label}>
                                    <SignedIn>
                                        <Link href={item.href} className={commonClasses}>
                                            {content}
                                        </Link>
                                    </SignedIn>
                                    <SignedOut>
                                         <SignInButton mode="modal">
                                            <button className={commonClasses + " text-left"}>
                                                {content}
                                            </button>
                                         </SignInButton>
                                    </SignedOut>
                                </div>
                             )
                        }

                        return (
                            <Link key={item.label} href={item.href} className={commonClasses}>
                                {content}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100">
                    <SignedIn>
                        <Link href="/me" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                            {user?.imageUrl ? (
                                <Image 
                                    src={user.imageUrl} 
                                    alt={user.fullName || "User"} 
                                    width={32} 
                                    height={32} 
                                    className="w-8 h-8 rounded-full bg-slate-200 object-cover" 
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                    {user?.firstName?.[0] || "ME"}
                                </div>
                            )}
                            <div className="text-sm font-medium text-slate-700">My Account</div>
                        </Link>
                    </SignedIn>
                    <SignedOut>
                         <SignInButton mode="modal">
                            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors w-full text-left">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-medium text-slate-700">Sign In</div>
                            </button>
                         </SignInButton>
                    </SignedOut>
                </div>
            </aside>

            {/* Mobile Header (Top) */}
            <header className="md:hidden fixed top-0 w-full z-40 bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-950 tracking-tight">
                    <Image src="/logo-blue.png" alt="Cruxly" width={24} height={24} />
                    Cruxly
                </Link>
                <div className="flex gap-4 items-center">
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    <SignedOut>
                         <SignInButton mode="modal">
                            <Button variant="ghost" size="icon" className="text-blue-950">
                                <User className="w-5 h-5" />
                            </Button>
                         </SignInButton>
                    </SignedOut>
                </div>
            </header>

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen w-full",
                "md:ml-64", // Offset for sidebar
                "pb-16 md:pb-0", // Space for mobile nav
                "pt-14 md:pt-0" // Space for mobile header
            )}>
                <div className="max-w-4xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 z-50 h-16 px-6 pb-safe">
                <div className="grid grid-cols-5 h-full items-center justify-items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const commonClasses = "flex items-center justify-center h-full w-full active:scale-95 transition-transform"
                        const Icon = item.icon
                        const iconClasses = cn(
                                    "w-6 h-6 transition-all",
                                    isActive ? "text-blue-950 stroke-[2.5px]" : "text-slate-400"
                                )

                        if (item.protected) {
                            return (
                                <div key={item.label} className="w-full h-full flex items-center justify-center fae">
                                    <SignedIn>
                                        <Link href={item.href} className={commonClasses}>
                                            <Icon className={iconClasses} />
                                        </Link>
                                    </SignedIn>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className={commonClasses}>
                                                <Icon className={iconClasses} />
                                            </button>
                                        </SignInButton>
                                    </SignedOut>
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={commonClasses}
                            >
                                <Icon className={iconClasses} />
                            </Link>
                        )
                    })}
                </div>
            </nav>
            <Toaster richColors position="top-center" />
        </div>
    )
}
