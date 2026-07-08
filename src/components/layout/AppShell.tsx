"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusSquare, User, Search, Sparkles, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { SignInButton, SignedOut, SignedIn, UserButton, useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Toaster } from "sonner"
import { LiquidGlassFilter } from "@/components/liquid-glass-filter"

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
        { label: "Home", href: "/", icon: Home, protected: false, primary: false },
        { label: "Explore", href: "/search", icon: Search, protected: false, primary: false },
        { label: "Create", href: "/new", icon: PlusSquare, protected: true, primary: true },
        { label: "AI Solver", href: "/solve", icon: Sparkles, protected: true, primary: false },
        { label: "Profile", href: "/me", icon: User, protected: true, primary: false },
    ]

    return (
        <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Desktop Sidebar (Left) */}
            <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 border-r border-slate-200 bg-white z-50">
                <div className="p-6 h-20 flex items-center">
                    <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-blue-950 tracking-tight">
                        <Image src="/logo-blue.png" alt="Cruxly" width={28} height={28} className="rounded-md" />
                        <span>Cruxly</span>
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-2 space-y-1.5">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        const commonClasses = item.primary
                            ? "flex items-center gap-3 px-4 py-3 rounded-xl w-full bg-blue-950 text-white font-semibold shadow-lg shadow-blue-950/20 transition-all hover:bg-blue-900 hover:-translate-y-0.5 active:translate-y-0"
                            : cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group w-full",
                                isActive
                                    ? "bg-blue-50 text-blue-950 font-semibold"
                                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                            )

                        const iconClasses = item.primary
                            ? "w-5 h-5 text-white"
                            : cn(
                                "w-6 h-6 transition-colors",
                                isActive ? "text-blue-950 stroke-[2.25px]" : "text-slate-500 group-hover:text-slate-900"
                            )

                        const content = (
                            <>
                                <Icon className={iconClasses} />
                                <span className={cn("text-base", item.primary && "text-white")}>{item.label}</span>
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

                <div className="p-4 mt-auto border-t border-slate-100">
                    <SignedIn>
                        <Link href="/me" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/70 transition-colors">
                            {user?.imageUrl ? (
                                <Image
                                    src={user.imageUrl}
                                    alt={user.fullName || "User"}
                                    width={36}
                                    height={36}
                                    className="w-9 h-9 rounded-full bg-slate-200 object-cover ring-2 ring-slate-100"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                                    {user?.firstName?.[0] || "ME"}
                                </div>
                            )}
                            <div className="min-w-0">
                                <div className="text-sm font-semibold text-slate-800 truncate">{user?.username || user?.firstName || "My Account"}</div>
                                <div className="text-xs text-slate-400">View profile</div>
                            </div>
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/70 transition-colors w-full text-left">
                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="text-sm font-medium text-slate-700">Sign In</div>
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </aside>

            {/* Mobile Header (Top) */}
            <header className="md:hidden fixed top-0 w-full z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 h-14 px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-950 tracking-tight">
                    <Image src="/logo-blue.png" alt="Cruxly" width={24} height={24} />
                    Cruxly
                </Link>
                <div className="flex gap-4 items-center">
                    <Link href="/search" className="text-slate-600 hover:text-blue-950 transition-colors" aria-label="Explore">
                        <Search className="w-5 h-5" />
                    </Link>
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
                "pb-20 md:pb-0", // Space for mobile nav
                "pt-14 md:pt-0" // Space for mobile header
            )}>
                <div className="max-w-4xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Tab Bar */}
            <nav className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 z-50 h-16 px-2 pb-safe">
                <div className="grid grid-cols-5 h-full items-center justify-items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        // Elevated primary "Create" button, social-app style
                        if (item.primary) {
                            const primaryButton = (
                                <span className="flex h-12 w-12 -mt-5 items-center justify-center rounded-full bg-blue-950 text-white shadow-lg shadow-blue-950/30 ring-4 ring-slate-50 transition-transform active:scale-90">
                                    <Plus className="w-6 h-6 stroke-[2.5px]" />
                                </span>
                            )
                            return (
                                <div key={item.label} className="w-full h-full flex items-center justify-center">
                                    <SignedIn>
                                        <Link href={item.href} aria-label={item.label}>{primaryButton}</Link>
                                    </SignedIn>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button aria-label={item.label}>{primaryButton}</button>
                                        </SignInButton>
                                    </SignedOut>
                                </div>
                            )
                        }

                        const commonClasses = "flex flex-col items-center justify-center gap-1 h-full w-full active:scale-95 transition-transform"
                        const iconClasses = cn(
                            "w-6 h-6 transition-all",
                            isActive ? "text-blue-950 stroke-[2.5px]" : "text-slate-400"
                        )
                        const inner = (
                            <>
                                <Icon className={iconClasses} />
                                <span className={cn(
                                    "h-1 w-1 rounded-full transition-all",
                                    isActive ? "bg-blue-950" : "bg-transparent"
                                )} />
                            </>
                        )

                        if (item.protected) {
                            return (
                                <div key={item.label} className="w-full h-full flex items-center justify-center">
                                    <SignedIn>
                                        <Link href={item.href} className={commonClasses} aria-label={item.label}>
                                            {inner}
                                        </Link>
                                    </SignedIn>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className={commonClasses} aria-label={item.label}>
                                                {inner}
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
                                aria-label={item.label}
                            >
                                {inner}
                            </Link>
                        )
                    })}
                </div>
            </nav>
            <Toaster richColors position="top-center" />
            <LiquidGlassFilter />
        </div>
    )
}
