import React, { useState, useEffect } from 'react';

interface SmartRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRoster: () => void;
}

export const SmartRosterModal: React.FC<SmartRosterModalProps> = ({
  isOpen,
  onClose,
  onApplyRoster,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setIsProcessing(false);
      setIsComplete(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartOptimization = () => {
    setIsProcessing(true);
    setStep(1);

    setTimeout(() => {
      setStep(2);
    }, 900);

    setTimeout(() => {
      setStep(3);
    }, 1800);

    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
    }, 2600);
  };

  const handleConfirm = () => {
    onApplyRoster();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">AI Smart Roster Optimizer</h3>
              <p className="text-xs text-slate-500">Autonomous workforce allocation & demand balancing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!isComplete ? (
            <>
              {/* Parameters Summary */}
              <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Target Range</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">Apr 21 – Apr 27</div>
                </div>
                <div className="border-x border-slate-200 px-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Staff</div>
                  <div className="text-xs font-bold text-slate-800 mt-0.5">142 Active</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Open Gaps</div>
                  <div className="text-xs font-bold text-rose-600 mt-0.5">5 Vacancies</div>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="space-y-3">
                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${step >= 1 ? 'border-teal-500/40 bg-teal-50/50' : 'border-slate-200 bg-white'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${step > 1 ? 'text-teal-600' : step === 1 ? 'text-teal-600 animate-spin' : 'text-slate-300'}`}>
                    {step > 1 ? 'check_circle' : step === 1 ? 'sync' : 'radio_button_unchecked'}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-800">1. Historical Occupancy & Surge Modeling</div>
                    <div className="text-[11px] text-slate-500">Evaluating 1,240 projected guest arrivals & Friday banquet</div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${step >= 2 ? 'border-teal-500/40 bg-teal-50/50' : 'border-slate-200 bg-white'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${step > 2 ? 'text-teal-600' : step === 2 ? 'text-teal-600 animate-spin' : 'text-slate-300'}`}>
                    {step > 2 ? 'check_circle' : step === 2 ? 'sync' : 'radio_button_unchecked'}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-800">2. Staff Rest & Overtime Compliance Checks</div>
                    <div className="text-[11px] text-slate-500">Enforcing 12-hour rest rule & max 48-hour weekly limits</div>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${step >= 3 ? 'border-teal-500/40 bg-teal-50/50' : 'border-slate-200 bg-white'}`}>
                  <span className={`material-symbols-outlined text-[20px] ${step === 3 ? 'text-teal-600 animate-spin' : 'text-slate-300'}`}>
                    {step === 3 ? 'sync' : 'radio_button_unchecked'}
                  </span>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-800">3. Talent Pool Gap Filling & Dispatch Staging</div>
                    <div className="text-[11px] text-slate-500">Matching top verified floaters (Priya Sharma, Amit Sharma)</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Completed Screen */
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center ring-8 ring-emerald-50">
                <span className="material-symbols-outlined text-[32px]">check</span>
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Optimization Plan Ready!</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Smart Roster successfully filled 5 open vacancies, balanced Friday peak dining rush, and maintained zero overtime violations.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-left">
                <div>
                  <span className="text-[10px] text-emerald-800 font-semibold uppercase">Schedule Coverage</span>
                  <div className="text-sm font-bold text-emerald-950">63 / 63 Shifts (100%)</div>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 font-semibold uppercase">Estimated Labor Savings</span>
                  <div className="text-sm font-bold text-emerald-950">₹34,800 (-14.2%)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors"
          >
            Cancel
          </button>

          {!isComplete ? (
            <button
              disabled={isProcessing}
              onClick={handleStartOptimization}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Optimizing Roster...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span>Run Optimization</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              <span>Apply to Live Roster</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
