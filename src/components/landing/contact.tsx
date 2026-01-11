"use client";

import { motion } from "framer-motion";
import { Mail, MessageSquare, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-6">Get in touch</h2>
                        <p className="text-zinc-600 text-lg mb-10 leading-relaxed">
                            Have questions about team plans or custom implementations? Our support team is here to help you get the most out of WorkspacePro.
                        </p>

                        <div className="space-y-6">
                            {[
                                { icon: Mail, label: "Email us", value: "hello@workspacepro.com" },
                                { icon: MessageSquare, label: "Live Chat", value: "Available 24/7" },
                                { icon: MapPin, label: "Office", value: "Innovation Dr, San Francisco, CA" }
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
                                        <item.icon className="h-5 w-5 text-zinc-900" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{item.label}</p>
                                        <p className="text-base font-medium text-zinc-900">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 shadow-sm"
                    >
                        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-zinc-900">Email</label>
                                    <input
                                        type="email"
                                        placeholder="name@company.com"
                                        className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-zinc-900">Message</label>
                                <textarea
                                    rows={4}
                                    placeholder="How can we help?"
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
                                />
                            </div>
                            <Button className="w-full h-14 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl font-medium">
                                Send Message
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
