export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center">
            {children}
        </div>
    )
}
