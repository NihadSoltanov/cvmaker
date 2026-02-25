import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignupPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="glass-card w-full max-w-md p-8 rounded-3xl z-10">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-neutral-500 hover:text-indigo-500 mb-8 transition">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back home
                </Link>

                <h1 className="text-2xl font-bold mb-2">Create an account</h1>
                <p className="text-neutral-500 text-sm mb-8">Start optimizing your CV for free.</p>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input type="text" placeholder="John Doe" className="input-styled" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input type="email" placeholder="you@example.com" className="input-styled" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input type="password" placeholder="••••••••" className="input-styled" />
                    </div>
                    <button className="btn-primary w-full mt-2">Sign Up</button>
                </form>

                <p className="mt-8 text-center text-sm text-neutral-500">
                    Already have an account? <Link href="/login" className="text-indigo-600 hover:underline">Log in</Link>
                </p>
            </div>
        </div>
    );
}
