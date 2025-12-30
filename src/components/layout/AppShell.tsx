"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Compass, PlusSquare, User, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    // Don't show shell on auth pages
    const isAuthPage = pathname?.startsWith("/auth")

    if (isAuthPage) {
        return <div className="min-h-screen bg-slate-50">{children}</div>
    }

    const navItems = [
        { label: "Home", href: "/", icon: Home },
        { label: "Explore", href: "/", icon: Search }, // Re-using Feed for now
        { label: "Create", href: "/new", icon: PlusSquare },
        { label: "Profile", href: "/me", icon: User },
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
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group hover:bg-slate-50",
                                    isActive && "font-bold text-blue-950 bg-slate-50"
                                )}
                            >
                                <item.icon className={cn(
                                    "w-6 h-6 transition-colors",
                                    isActive ? "stroke-[2.5px] text-blue-950" : "text-slate-500 group-hover:text-slate-900"
                                )} />
                                <span className={cn("text-base", isActive ? "text-blue-950" : "text-slate-600 group-hover:text-slate-900")}>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100">
                    <Link href="/me" className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                            ME
                        </div>
                        <div className="text-sm font-medium text-slate-700">My Account</div>
                    </Link>
                </div>
            </aside>

            {/* Mobile Header (Top) */}
            <header className="md:hidden fixed top-0 w-full z-40 bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-blue-950 tracking-tight">
                    <Image src="/logo-blue.png" alt="Cruxly" width={24} height={24} />
                    Cruxly
                </Link>
                <div className="flex gap-4">
                    {/* Placeholder for future mobile header actions */}
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
                <div className="grid grid-cols-4 h-full items-center justify-items-center">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="flex items-center justify-center h-full w-full active:scale-95 transition-transform"
                            >
                                <item.icon className={cn(
                                    "w-6 h-6 transition-all",
                                    isActive ? "text-blue-950 stroke-[2.5px]" : "text-slate-400"
                                )} />
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    )
}
