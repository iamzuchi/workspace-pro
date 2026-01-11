"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <Layers className="h-6 w-6 text-zinc-900" />
                        <span className="text-xl font-bold tracking-tight text-zinc-900">WorkspacePro</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Features</Link>
                        <Link href="#reviews" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">Reviews</Link>
                        <Link href="#faq" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">FAQ</Link>
                        <Link href="#about" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">About</Link>
                        <Link href="/login">
                            <Button variant="ghost" className="text-sm font-medium">Log in</Button>
                        </Link>
                        <Link href="/register">
                            <Button className="text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-full px-6">Get Started</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
