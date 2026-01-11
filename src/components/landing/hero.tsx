"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export const Hero = () => {
    return (
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-2xl"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse" />
                            Next-gen Project Management
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-zinc-900 leading-[1.1] mb-6">
                            Smart Workspace for <span className="text-zinc-400 italic font-medium">Modern Teams</span>
                        </h1>
                        <p className="text-xl text-zinc-600 mb-8 leading-relaxed">
                            WorkspacePro seamlessly integrates project tracking, inventory management, and financial reporting into one powerful platform. Solve fragmentation, eliminate chaos, and scale with confidence.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link href="/register" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full h-14 px-8 bg-zinc-900 text-white hover:bg-zinc-800 text-base font-medium rounded-2xl group">
                                    Start for free
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="#features" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full h-14 px-8 text-base font-medium rounded-2xl border-zinc-200">
                                    View Features
                                </Button>
                            </Link>
                        </div>
                        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                "No card required",
                                "14-day free trial",
                                "Team collaboration"
                            ].map((item) => (
                                <div key={item} className="flex items-center gap-2 text-zinc-500 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="relative lg:h-auto flex items-center justify-center"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-zinc-100 to-transparent rounded-3xl -rotate-2" />
                        <div className="relative w-full rounded-3xl shadow-2xl overflow-hidden border border-zinc-100">
                            <img
                                src="/hero-dashboard.png"
                                alt="WorkspacePro Dashboard"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 -z-10 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,var(--color-zinc-100)_0%,transparent_50%)]" />
        </section>
    );
};
