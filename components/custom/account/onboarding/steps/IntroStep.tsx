"use client"

import { motion } from "framer-motion"
import { Building2, Check } from "lucide-react"

const REQUIREMENTS = [
    "Your business name",
    "A category that best describes your business",
    "A brief description of what you do",
    "Contact information for your customers",
]

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
}

const checklistVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.4,
            ease: "easeOut" as const,
        },
    },
}

const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring" as const,
            stiffness: 200,
            damping: 15,
        },
    },
}

export function IntroStep() {
    return (
        <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8"
                variants={iconVariants}
            >
                <Building2 className="w-10 h-10 text-primary" />
            </motion.div>

            <motion.h2
                className="text-2xl md:text-3xl font-semibold mb-3"
                variants={itemVariants}
            >
                Let&apos;s set up your business profile
            </motion.h2>
            <motion.p
                className="text-muted-foreground mb-10 text-lg"
                variants={itemVariants}
            >
                We&apos;ll need a few details to get your account ready
            </motion.p>

            <motion.div
                className="text-left bg-muted/50 rounded-xl p-8 max-w-lg mx-auto"
                variants={itemVariants}
            >
                <h3 className="font-medium mb-6 text-lg">What you&apos;ll need:</h3>
                <motion.ul
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {REQUIREMENTS.map((requirement, index) => (
                        <motion.li
                            key={requirement}
                            className="flex items-center gap-4"
                            variants={checklistVariants}
                            custom={index}
                        >
                            <motion.div
                                className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + index * 0.15, type: "spring", stiffness: 300 }}
                            >
                                <Check className="w-3.5 h-3.5 text-primary" />
                            </motion.div>
                            <span className="text-base">{requirement}</span>
                        </motion.li>
                    ))}
                </motion.ul>
            </motion.div>
        </motion.div>
    )
}
