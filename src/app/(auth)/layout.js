export default function AuthLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
}
