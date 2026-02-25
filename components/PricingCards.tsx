import { Check, Zap } from "lucide-react";
import { ShinyButton } from "./ui/shiny-button";
import { AnimatedGradientText } from "./ui/animated-gradient-text";

export function PricingCards() {
    const plans = [
        {
            name: "Free",
            price: "$0",
            description: "Perfect for testing the waters and exploring the tailoring engine.",
            features: [
                "3 AI Optimizations Total",
                "1 PDF Export per day",
                "Watermarked Share Link",
                "Basic Templates"
            ],
            buttonText: "Start Free",
            featured: false
        },
        {
            name: "Pro",
            price: "$30",
            period: "/year",
            description: "Everything you need to land your dream job with zero friction.",
            features: [
                "Unlimited AI Optimizations",
                "Unlimited PDF Exports",
                "No Watermarks",
                "Share Link Analytics",
                "Priority Generation APIs"
            ],
            buttonText: "Upgrade to Pro",
            featured: true
        }
    ];

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto py-12 perspective-1000 relative z-10">
            {plans.map((plan) => (
                <div
                    key={plan.name}
                    className={`relative rounded-[2rem] p-8 flex flex-col transition-all duration-500 bg-white/60 dark:bg-black/40 backdrop-blur-2xl border ${plan.featured
                            ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/20 scale-105 z-10'
                            : 'border-neutral-200 dark:border-neutral-800 shadow-xl shadow-black/5 hover:border-indigo-400/30'
                        }`}
                >
                    {plan.featured && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold tracking-widest uppercase shadow-lg shadow-indigo-500/30 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Most Popular
                        </div>
                    )}

                    <h3 className="text-3xl font-extrabold mb-3">
                        {plan.featured ? <AnimatedGradientText>{plan.name}</AnimatedGradientText> : plan.name}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium text-sm mb-8 pb-8 border-b border-neutral-200 dark:border-neutral-800/80 min-h-[5rem]">
                        {plan.description}
                    </p>

                    <div className="mb-10 flex items-baseline">
                        <span className="text-6xl font-black tracking-tighter text-neutral-900 dark:text-white">{plan.price}</span>
                        {plan.period && <span className="text-xl font-medium text-neutral-500 ml-2">{plan.period}</span>}
                    </div>

                    <ul className="space-y-5 mb-10 flex-1">
                        {plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-4 text-base font-medium">
                                <div className={`p-1 rounded-full ${plan.featured ? 'bg-indigo-500/20 text-indigo-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                                    <Check className="w-4 h-4" />
                                </div>
                                <span className="text-neutral-700 dark:text-neutral-200">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {plan.featured ? (
                        <ShinyButton className="w-full h-14 text-lg">{plan.buttonText}</ShinyButton>
                    ) : (
                        <button className="w-full h-14 rounded-xl font-bold transition-all border-2 border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:border-neutral-300">
                            {plan.buttonText}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}
