import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/auth/profile-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = async () => {
    const user = await currentUser();
    if (!user) redirect("/login");

    return (
        <div className="max-w-4xl mx-auto p-8 pt-20">
            <h2 className="text-3xl font-bold tracking-tight mb-8">User Profile Settings</h2>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your profile details and management your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm user={user} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
