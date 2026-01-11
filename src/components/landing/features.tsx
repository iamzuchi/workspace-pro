"use client";

import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Package,
    FileText,
    ShieldCheck,
    Zap,
    TrendingUp
} from "lucide-react";

const features = [
    {
        title: "Project Management",
        description: "Track tasks, milestones, and team progress with intuitive boards and real-time updates.",
        icon: LayoutDashboard,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        title: "Inventory Tracking",
        description: "Manage stock levels, allocate resources to specific projects, and never run out of supplies.",
        icon: Package,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    },
    {
        title: "Smart Invoicing",
        description: "Generate professional PDFs, send them via email, and track payments automatically.",
        icon: FileText,
        color: "text-violet-600",
        bg: "bg-violet-50"
    },
    {
        title: "RBAC Security",
        description: "Granular role-based access control ensures every member has the right level of access.",
        icon: ShieldCheck,
        color: "text-zinc-600",
        bg: "bg-zinc-50"
    },
    {
        title: "Performance Insights",
        description: "Visual dashboards and revenue charts to help you make data-driven decisions.",
        icon: TrendingUp,
        color: "text-amber-600",
        bg: "bg-amber-50"
    },
    {
        title: "Fast & Responsive",
        description: "Optimized for speed with skeleton loading and a mobile-first design philosophy.",
        icon: Zap,
        color: "text-rose-600",
        bg: "bg-rose-50"
    }
];

export const Features = () => {
    return (
        <section id="features" className="py-24 bg-zinc-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-4"
                    >
                        Everything you need to scale
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-zinc-600 max-w-2xl mx-auto"
                    >
                        WorkspacePro provides a unified toolset for modern organizations. No more jumping between tools—manage everything from one place.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-3xl border border-zinc-100 hover:shadow-xl hover:shadow-zinc-200/50 transition-all group"
                        >
                            <div className={`h-12 w-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-3">{feature.title}</h3>
                            <p className="text-zinc-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
