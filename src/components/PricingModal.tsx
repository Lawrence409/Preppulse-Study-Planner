import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  CreditCard,
  GraduationCap,
  Shield,
  Zap,
  Lock,
} from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userTier: 'free' | 'pro';
  onUpgradeToPro: (isEdu: boolean) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  userTier,
  onUpgradeToPro,
}) => {
  const [eduEmail, setEduEmail] = useState('student@berkeley.edu');
  const [isEduChecked, setIsEduChecked] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  if (!isOpen) return null;

  const standardPrice = 7;
  const studentPrice = 4;
  const activePrice = isEduChecked ? studentPrice : standardPrice;

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onUpgradeToPro(isEduChecked);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-stone-100 p-6 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PREPPULSE PRO</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-white">
              Ace Exam Week with Unlimited Prep
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              College students waste 6+ hours creating flashcards. Cut it down to 60 seconds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Selection */}
        <div className="p-6 space-y-5">
          {/* Student Discount Toggle Box */}
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEduChecked}
                  onChange={(e) => setIsEduChecked(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-700"
                />
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>College Student Discount (.edu)</span>
                </span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                Save 43%
              </span>
            </div>

            {isEduChecked && (
              <div className="pt-2 border-t border-emerald-200/60">
                <label className="text-[11px] font-medium text-emerald-900 block mb-1">
                  University / College Email
                </label>
                <input
                  type="email"
                  value={eduEmail}
                  onChange={(e) => setEduEmail(e.target.value)}
                  placeholder="yourname@university.edu"
                  className="w-full text-xs p-2 rounded-md border border-emerald-300 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-stone-800"
                />
                <span className="text-[10px] text-emerald-800 mt-1 block">
                  Automatic student verification applied.
                </span>
              </div>
            )}
          </div>

          {/* Pricing Display */}
          <div className="flex items-baseline justify-between border-b border-stone-200 pb-4">
            <div>
              <span className="text-3xl font-serif font-bold text-stone-900">${activePrice}</span>
              <span className="text-xs text-stone-500 font-sans"> / month</span>
              {isEduChecked && (
                <span className="text-xs text-stone-400 line-through ml-2">$7/mo</span>
              )}
            </div>
            <span className="text-xs text-stone-500">Cancel anytime · No contracts</span>
          </div>

          {/* Features list */}
          <ul className="space-y-2 text-xs text-stone-700">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Unlimited Study Sets</strong> (Free tier is capped at 3/mo)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Weakness Tracker &amp; Cram Drills</strong> (AI isolates weak concepts)
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Ground-truth note verification</strong> on every card
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Google/Apple Calendar export</strong> for daily study plan
              </span>
            </li>
          </ul>

          {/* Simulated Stripe Checkout Form */}
          <form onSubmit={handleCheckout} className="space-y-3 pt-2">
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-stone-400" />
                  <span>Stripe Secure Checkout</span>
                </span>
                <span className="font-mono text-[10px]">256-BIT SSL</span>
              </div>

              <div>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card Number"
                  className="w-full text-xs p-2 rounded border border-stone-300 bg-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="text-xs p-2 rounded border border-stone-300 bg-white font-mono"
                />
                <input
                  type="text"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value)}
                  placeholder="CVC"
                  className="text-xs p-2 rounded border border-stone-300 bg-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-950 text-stone-100 font-medium text-xs rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Activating Pro Plan...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Pay ${activePrice}/mo &amp; Unlock Unlimited Sets</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
