"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Megaphone, Users, BarChart3 } from "lucide-react"
import { ACCOUNT_MANAGER_BENEFITS } from "../types"

const iconMap = {
    Megaphone,
    Users,
    BarChart3,
} as const

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut" as const,
        },
    },
}

const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: (index: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.5,
            delay: 0.3 + index * 0.15,
            ease: "easeOut" as const,
        },
    }),
}

export function WelcomeStep() {
    return (
        <motion.div
            className="text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.h1
                className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                variants={itemVariants}
            >
                Welcome to Account Manager
            </motion.h1>
            <motion.p
                className="text-muted-foreground mb-12 text-lg"
                variants={itemVariants}
            >
                Unlock powerful tools to grow your business on the platform
            </motion.p>

            <div className="flex flex-col gap-6">
                {/* Top row - 2 cards */}
                <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
                    {ACCOUNT_MANAGER_BENEFITS.slice(0, 2).map((benefit, index) => {
                        const Icon = iconMap[benefit.icon]
                        return (
                            <motion.div
                                key={benefit.title}
                                variants={cardVariants}
                                custom={index}
                                initial="hidden"
                                animate="visible"
                            >
                                <Card className="text-left h-full hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="pt-6">
                                        <motion.div
                                            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <Icon className="w-6 h-6 text-primary" />
                                        </motion.div>
                                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
                {/* Bottom row - 1 card centered */}
                <div className="flex justify-center">
                    {ACCOUNT_MANAGER_BENEFITS.slice(2, 3).map((benefit, index) => {
                        const Icon = iconMap[benefit.icon]
                        return (
                            <motion.div
                                key={benefit.title}
                                variants={cardVariants}
                                custom={index + 2}
                                initial="hidden"
                                animate="visible"
                                className="w-full max-w-sm"
                            >
                                <Card className="text-left h-full hover:shadow-lg transition-shadow duration-300">
                                    <CardContent className="pt-6">
                                        <motion.div
                                            className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <Icon className="w-6 h-6 text-primary" />
                                        </motion.div>
                                        <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </motion.div>
    )
}
