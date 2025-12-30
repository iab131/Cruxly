import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function SignUpPage() {
    return (
        <div className="flex items-center justify-center min-h-[80vh] p-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-blue-950">Cruxly</CardTitle>
                    <CardDescription>Join the community.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" type="text" placeholder="climber_123" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                    </div>
                    <Button className="w-full bg-blue-950 hover:bg-blue-900 font-bold">Create Account</Button>

                    <div className="text-center text-sm text-slate-500 pt-2">
                        Already have an account?{" "}
                        <Link href="/auth/sign-in" className="text-blue-600 hover:underline font-medium">Sign in</Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
