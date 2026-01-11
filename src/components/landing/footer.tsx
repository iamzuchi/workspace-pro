"use client";

import { Layers, Github, Twitter, Linkedin } from "lucide-react";
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="bg-white border-t border-zinc-100 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-4 gap-12 lg:gap-24 mb-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <Layers className="h-8 w-8 text-zinc-900" />
                            <span className="text-2xl font-bold tracking-tight text-zinc-900">WorkspacePro</span>
                        </div>
                        <p className="text-zinc-500 max-w-sm leading-relaxed">
                            The intelligent workspace designed for teams who value clarity, speed, and precision in their execution.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Twitter, Github, Linkedin].map((Icon, i) => (
                                <Link key={i} href="#" className="p-2 rounded-full bg-zinc-50 border border-zinc-100 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all">
                                    <Icon className="h-5 w-5" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-zinc-900 mb-6">Product</h4>
                        <ul className="space-y-4">
                            {["Features", "Integrations", "Pricing", "Changelog"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-zinc-900 mb-6">Company</h4>
                        <ul className="space-y-4">
                            {["About", "Careers", "Privacy", "Terms"].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-medium">{item}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-zinc-400 font-medium">© 2024 WorkspacePro Inc. All rights reserved.</p>
                    <div className="flex items-center gap-8">
                        <Link href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">Twitter</Link>
                        <Link href="#" className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-900 transition-colors">Support</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
