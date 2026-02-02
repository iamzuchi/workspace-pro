"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const About = () => {
    return (
        <section id="about" className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-6">
                            Built for the next generation of <span className="text-zinc-400 italic">makers</span>
                        </h2>
                        <div className="space-y-6 text-lg text-zinc-600 leading-relaxed">
                            <p>
                                At WorkspacePro, we believe that complexity shouldn't be a hurdle to productivity. Our mission is to build tools that feel invisible—allowing you to focus on your creative work while we handle the operational overhead.
                            </p>
                            <p>
                                We started as a small team frustrated by fragmented tools. Today, we're building a unified ecosystem where project management, inventory, and finance live in perfect harmony.
                            </p>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-8 border-t border-zinc-100 pt-8">
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">10k+</p>
                                <p className="text-sm text-zinc-500 font-medium mt-1">Active Projects</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-zinc-900">99.9%</p>
                                <p className="text-sm text-zinc-500 font-medium mt-1">Platform Uptime</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="relative space-y-6"
                    >
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <Image
                                src="/feature-tasks.png"
                                alt="Task Management"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="rounded-2xl overflow-hidden shadow-2xl border border-zinc-100 transform -rotate-1 hover:rotate-0 transition-transform duration-500 max-w-[80%] ml-auto">
                            <Image
                                src="/feature-finance.png"
                                alt="Finance Tracking"
                                className="w-full h-auto"
                            />
                        </div>

                        {/* Abstract decoration */}
                        <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-zinc-100 rounded-full -z-10 blur-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
