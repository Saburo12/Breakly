import { useState } from 'react';
import { Check, Info, ChevronDown } from 'lucide-react';

export function PricingCards() {
  const [proAnnual] = useState(false);
  const [businessAnnual] = useState(false);
  const [proCredits, setProCredits] = useState(100);
  const [businessCredits, setBusinessCredits] = useState(100);

  // Pricing tiers based on credits
  const getPricing = (credits: number, isAnnual: boolean, tier: 'pro' | 'business') => {
    const baseMultiplier = tier === 'pro' ? 1 : 2;
    let monthlyPrice = 0;

    if (credits === 100) {
      monthlyPrice = 25 * baseMultiplier;
    } else if (credits === 200) {
      monthlyPrice = 50 * baseMultiplier;
    } else if (credits === 300) {
      monthlyPrice = 75 * baseMultiplier;
    }

    // Apply 20% discount for annual
    return isAnnual ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pro Plan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Pro</h2>
            <p className="text-neutral-400 text-sm">
              Designed for fast-moving teams building together in real time.
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-white">${getPricing(proCredits, proAnnual, 'pro')}</span>
              <span className="text-neutral-400 text-sm">per month</span>
            </div>
            <p className="text-neutral-500 text-sm">shared across unlimited users</p>
          </div>

          <button className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors mb-4 font-medium">
            Upgrade
          </button>

          <div className="relative mb-6">
            <select
              value={proCredits}
              onChange={(e) => setProCredits(Number(e.target.value))}
              className="w-full px-4 py-3 bg-neutral-800 text-white rounded-lg appearance-none cursor-pointer border border-neutral-700 hover:border-neutral-600 transition-colors text-sm"
            >
              <option value={100}>100 credits / month</option>
              <option value={200}>200 credits / month</option>
              <option value={300}>300 credits / month</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <div className="space-y-4">
            <p className="text-white text-sm font-medium">All features in Free, plus:</p>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 text-sm">{proCredits} monthly credits</span>
                <Info className="w-4 h-4 text-neutral-500" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">5 daily credits (up to 150/month)</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 text-sm">Supabase, Github Integration</span>
                <Info className="w-4 h-4 text-neutral-500" />
                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">New</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 text-sm">Credit rollovers</span>
                <Info className="w-4 h-4 text-neutral-500" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Unlimited breakly.app domains</span>
            </div>
          </div>
        </div>

        {/* Business Plan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Business</h2>
            <p className="text-neutral-400 text-sm">
              Advanced controls and power features for growing departments
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-white">${getPricing(businessCredits, businessAnnual, 'business')}</span>
              <span className="text-neutral-400 text-sm">per month</span>
            </div>
            <p className="text-neutral-500 text-sm">shared across unlimited users</p>
          </div>

          <button className="w-full py-3 px-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors mb-4 border border-neutral-700 font-medium">
            Upgrade
          </button>

          <div className="relative mb-6">
            <select
              value={businessCredits}
              onChange={(e) => setBusinessCredits(Number(e.target.value))}
              className="w-full px-4 py-3 bg-neutral-800 text-white rounded-lg appearance-none cursor-pointer border border-neutral-700 hover:border-neutral-600 transition-colors text-sm"
            >
              <option value={100}>100 credits / month</option>
              <option value={200}>200 credits / month</option>
              <option value={300}>300 credits / month</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <div className="space-y-4">
            <p className="text-white text-sm font-medium">All features in Pro, plus:</p>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 text-sm">{businessCredits} monthly credits</span>
                <Info className="w-4 h-4 text-neutral-500" />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-300 text-sm">Custom Personalized Domains</span>
                <Info className="w-4 h-4 text-neutral-500" />
                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">New</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">SSO</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Personal Projects</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Opt out of data training</span>
            </div>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">Enterprise</h2>
            <p className="text-neutral-400 text-sm">
              Built for large orgs needing flexibility, scale, and governance.
            </p>
          </div>

          <div className="mb-6">
            <div className="mb-2">
              <span className="text-4xl font-bold text-white">Custom</span>
            </div>
            <p className="text-neutral-500 text-sm">Flexible plans</p>
          </div>

          <button className="w-full py-3 px-6 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors mb-10 border border-neutral-700 font-medium">
            Book a demo
          </button>

          <div className="space-y-4">
            <p className="text-white text-sm font-medium">All features in Business, plus:</p>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Dedicated support</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Onboarding services</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Custom connections</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Group-based access control</span>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-neutral-300 text-sm">Custom design systems</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
