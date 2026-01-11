"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, Plus, Package, FileText, Settings } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

export function OnboardingGuide() {
    const params = useParams();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem("onboarding_dismissed");
        if (!dismissed) {
            setIsVisible(true);
        }
    }, []);

    const dismiss = () => {
        localStorage.setItem("onboarding_dismissed", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    const steps = [
        {
            title: "Create a Project",
            description: "Set up your first project to track tasks and milestones.",
            href: `/${params.workspaceId}/projects`,
            icon: Plus,
            color: "text-blue-500"
        },
        {
            title: "Manage Inventory",
            description: "Add items to your inventory to track stock levels.",
            href: `/${params.workspaceId}/inventory`,
            icon: Package,
            color: "text-amber-500"
        },
        {
            title: "Generate Invoice",
            description: "Bill your clients and track outgoing payments.",
            href: `/${params.workspaceId}/finance`,
            icon: FileText,
            color: "text-emerald-500"
        },
        {
            title: "Workspace Settings",
            description: "Invite team members and configure your workspace.",
            href: `/${params.workspaceId}/settings`,
            icon: Settings,
            color: "text-zinc-500"
        }
    ];

    return (
        <Card className="mb-8 border-dashed border-2 bg-zinc-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        Welcome to WorkspacePro!
                    </CardTitle>
                    <CardDescription>
                        Complete these steps to get your workspace fully operational.
                    </CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={dismiss}>
                    <X className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-2">
                    {steps.map((step) => (
                        <Link
                            key={step.title}
                            href={step.href}
                            className="group block p-4 bg-white rounded-lg border hover:border-zinc-300 hover:shadow-sm transition-all"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-2 rounded-md bg-zinc-100 group-hover:bg-white transition-colors ${step.color}`}>
                                    <step.icon className="h-4 w-4" />
                                </div>
                                <h4 className="font-semibold text-sm">{step.title}</h4>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {step.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
