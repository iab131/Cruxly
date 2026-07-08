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
                    <Link href="/" className="text-2xl font-bold text-blue-950 tracking-tight">
                        Cruxly
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

            {/* Mobile has no top chrome — the page's glass island is the header,
                and the dock covers profile/sign-in. */}

            {/* Main Content */}
            <main className={cn(
                "flex-1 min-h-screen w-full",
                "md:ml-64", // Offset for sidebar
                "pb-24 md:pb-0" // Space for the floating mobile dock
            )}>
                {children}
            </main>

            {/* Mobile Bottom Dock — compact Apple-style capsule + split Create circle */}
            <nav className="md:hidden fixed bottom-4 inset-x-0 z-50 flex items-center justify-center gap-3 px-4 pb-safe pointer-events-none">
                <div className="glass-dock pointer-events-auto flex items-center rounded-full p-1">
                    {navItems.filter((item) => !item.primary).map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        const label = item.label === "AI Solver" ? "AI" : item.label
                        const classes = cn(
                            "flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 transition-all active:scale-95",
                            isActive && "bg-white/85 shadow-sm"
                        )
                        const inner = (
                            <>
                                <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-blue-950 stroke-[2.25px]" : "text-slate-500")} />
                                <span className={cn("text-[10px] font-semibold leading-none transition-colors", isActive ? "text-blue-950" : "text-slate-500")}>
                                    {label}
                                </span>
                            </>
                        )

                        if (item.protected) {
                            return (
                                <div key={item.label}>
                                    <SignedIn>
                                        <Link href={item.href} className={classes} aria-label={item.label}>{inner}</Link>
                                    </SignedIn>
                                    <SignedOut>
                                        <SignInButton mode="modal">
                                            <button className={classes} aria-label={item.label}>{inner}</button>
                                        </SignInButton>
                                    </SignedOut>
                                </div>
                            )
                        }

                        return (
                            <Link key={item.label} href={item.href} className={classes} aria-label={item.label}>
                                {inner}
                            </Link>
                        )
                    })}
                </div>

                {/* Create — its own circle beside the capsule, like Apple's split search */}
                <div className="pointer-events-auto">
                    <SignedIn>
                        <Link
                            href="/new"
                            aria-label="Create"
                            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-950 text-white shadow-lg shadow-blue-950/30 ring-1 ring-white/40 transition-transform active:scale-90"
                        >
                            <Plus className="w-6 h-6 stroke-[2.5px]" />
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button
                                aria-label="Create"
                                className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-950 text-white shadow-lg shadow-blue-950/30 ring-1 ring-white/40 transition-transform active:scale-90"
                            >
                                <Plus className="w-6 h-6 stroke-[2.5px]" />
                            </button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </nav>
            <Toaster richColors position="top-center" />
            <LiquidGlassFilter />
        </div>
    )
}
