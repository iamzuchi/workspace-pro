"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
    {
        name: "Sarah Jenkins",
        role: "Project Director",
        content: "WorkspacePro transformed how we track our hardware projects. The inventory-to-project allocation is a game-changer.",
        avatar: "SJ"
    },
    {
        name: "Michael Chen",
        role: "Tech Lead",
        content: "Clean, fast, and secure. The RBAC system is exactly what we needed to maintain compliance across our team.",
        avatar: "MC"
    },
    {
        name: "Elena Rodriguez",
        role: "Freelance Designer",
        content: "I used to struggle with invoicing and payments. Now it's all automated and professional. Highly recommended!",
        avatar: "ER"
    }
];

export const Reviews = () => {
    return (
        <section id="reviews" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-4"
                    >
                        Loved by professionals
                    </motion.h2>
                    <p className="text-zinc-600">Don't just take our word for it—listen to our active members.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {reviews.map((review, index) => (
                        <motion.div
                            key={review.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col relative overflow-hidden"
                        >
                            <Quote className="absolute top-4 right-4 h-12 w-12 text-zinc-100 z-0" />
                            <div className="flex gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} className="h-4 w-4 fill-zinc-900 text-zinc-900" />
                                ))}
                            </div>
                            <p className="text-zinc-700 leading-relaxed mb-6 font-medium relative z-10 italic">
                                "{review.content}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold text-xs">
                                    {review.avatar}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-zinc-900">{review.name}</h4>
                                    <p className="text-xs text-zinc-500">{review.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
