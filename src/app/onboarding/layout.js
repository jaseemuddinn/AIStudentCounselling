export default function OnboardingLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    );
}
