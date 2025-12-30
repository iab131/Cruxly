import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut } from "lucide-react"

export default function MyProfilePage() {
    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-3xl font-bold text-blue-950">Settings & Profile</h1>

            {/* Profile Preview */}
            <Card className="border-slate-200">
                <CardHeader>
                    <CardTitle className="text-lg">Profile Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>ME</AvatarFallback>
                    </Avatar>
                    <div>
                        <div className="font-bold text-lg">@current_user</div>
                        <div className="text-slate-500 text-sm">V5 Climber • 12 Problems</div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Profile Form */}
            <div className="space-y-6">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2 text-slate-800">Edit Profile</h2>

                    <div className="space-y-2">
                        <Label>Avatar</Label>
                        <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <Button variant="outline" size="sm">Change Avatar</Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" placeholder="Tell the community about yourself..." className="h-24 bg-white" />
                    </div>
                </div>

                {/* Account Section */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-semibold border-b pb-2 text-slate-800">Account</h2>

                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value="user@example.com" disabled className="bg-slate-50 text-slate-500" />
                        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>

                    <div className="pt-4">
                        <Button variant="destructive" className="w-full sm:w-auto gap-2">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
