"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "Is WorkspacePro free to use?",
        answer: "Yes, we offer a generous free tier for small teams and individuals. You can experience all premium features for 14 days without a credit card."
    },
    {
        question: "Can I manage multiple projects at once?",
        answer: "Absolutely. Our platform is built for complex workflows, allowing you to manage unlimited projects across multiple workspaces with distinct teams."
    },
    {
        question: "How secure is my data?",
        answer: "We use enterprise-grade encryption and secure authentication via Auth.js. Your data is isolated per workspace to ensure maximum privacy."
    },
    {
        question: "Does it support PDF invoicing?",
        answer: "Yes, you can generate professional PDF invoices, customize tax rates, and email them directly to your clients from within the platform."
    }
];

export const FAQ = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section id="faq" className="py-24 bg-zinc-50/50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-4"
                    >
                        Common Questions
                    </motion.h2>
                    <p className="text-zinc-600">Got questions? We've got answers.</p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-zinc-100 overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left transition-colors hover:bg-zinc-50"
                            >
                                <span className="font-semibold text-zinc-900">{faq.question}</span>
                                {openIndex === index ? (
                                    <Minus className="h-5 w-5 text-zinc-400" />
                                ) : (
                                    <Plus className="h-5 w-5 text-zinc-400" />
                                )}
                            </button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="px-6 pb-5 text-zinc-600 leading-relaxed text-sm">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
