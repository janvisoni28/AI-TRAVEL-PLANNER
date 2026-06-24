import React, { useState } from "react";
import { RefreshCw, Coins, ArrowRightLeft } from "lucide-react";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("INR");
  
  // Real standard currency rates (approx current values for reliable sandboxed offline functioning)
  const rates: { [key: string]: { [key: string]: number } } = {
    USD: { USD: 1, INR: 83.45, EUR: 0.93, GBP: 0.79, JPY: 159.20, AUD: 1.50, CAD: 1.37 },
    INR: { USD: 0.012, INR: 1, EUR: 0.011, GBP: 0.0095, JPY: 1.91, AUD: 0.018, CAD: 0.016 },
    EUR: { USD: 1.07, INR: 89.65, EUR: 1, GBP: 0.85, JPY: 171.10, AUD: 1.61, CAD: 1.47 },
    GBP: { USD: 1.26, INR: 105.40, EUR: 1.18, GBP: 1, JPY: 201.30, AUD: 1.89, CAD: 1.73 },
    JPY: { USD: 0.0063, INR: 0.52, EUR: 0.0058, GBP: 0.0050, JPY: 1, AUD: 0.0094, CAD: 0.0086 },
    AUD: { USD: 0.67, INR: 55.60, EUR: 0.62, GBP: 0.53, JPY: 106.10, AUD: 1, CAD: 0.91 },
    CAD: { USD: 0.73, INR: 61.10, EUR: 0.68, GBP: 0.58, JPY: 116.50, AUD: 1.10, CAD: 1 }
  };

  const currencyNames: { [key: string]: { name: string; flag: string } } = {
    USD: { name: "United States Dollar", flag: "🇺🇸" },
    INR: { name: "Indian Rupee", flag: "🇮🇳" },
    EUR: { name: "Euro", flag: "🇪🇺" },
    GBP: { name: "British Pound", flag: "🇬🇧" },
    JPY: { name: "Japanese Yen", flag: "🇯🇵" },
    AUD: { name: "Australian Dollar", flag: "🇦🇺" },
    CAD: { name: "Canadian Dollar", flag: "🇨🇦" }
  };

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const currentRate = rates[fromCurrency]?.[toCurrency] || 1;
  const convertedAmount = (parseFloat(amount) || 0) * currentRate;

  return (
    <div id="currency-converter-panel" className="bg-slate-900/65 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Coins className="w-5 h-5 text-teal-400" />
        <h3 className="font-display font-semibold text-lg text-white">Smart Currency Converter</h3>
      </div>

      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-xs text-slate-400 mb-1 font-medium">Exchange Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-slate-500 font-medium text-xs">
              {currencyNames[fromCurrency]?.flag}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount..."
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-white focus:outline-none focus:border-teal-500 transition-colors font-mono"
            />
          </div>
        </div>

        {/* Currency Selects */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">From</label>
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              {Object.keys(currencyNames).map((key) => (
                <option key={key} value={key}>
                  {currencyNames[key].flag} {key}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            type="button"
            className="mt-5 p-2 bg-slate-800 hover:bg-slate-700 hover:text-teal-400 text-slate-300 rounded-xl transition-colors border border-slate-700/60"
            title="Swap Currencies"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>

          <div className="flex-1">
            <label className="block text-xs text-slate-500 mb-1">To</label>
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-teal-500"
            >
              {Object.keys(currencyNames).map((key) => (
                <option key={key} value={key}>
                  {currencyNames[key].flag} {key}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result Area */}
        <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 text-center mt-3 relative overflow-hidden">
          {/* subtle glow */}
          <div className="absolute inset-0 bg-teal-500/1 pointer-events-none" />
          
          <span className="text-[10px] text-slate-500 font-mono block uppercase">Conversion Result</span>
          
          <h4 className="text-xl font-mono font-bold text-teal-400 mt-1 truncate">
            {currencyNames[toCurrency]?.flag} {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
          </h4>
          
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            1 {fromCurrency} = {currentRate.toFixed(4)} {toCurrency}
          </p>
        </div>
      </div>
    </div>
  );
}
