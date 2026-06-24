import React, { useState, useEffect } from "react";
import { Plus, Trash2, PieChart, Wallet, CreditCard, Users, RefreshCw } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Trip, Expense } from "../types";

interface ExpenseTrackerProps {
  trip: Trip;
  token: string;
}

export default function ExpenseTracker({ trip, token }: ExpenseTrackerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<"food" | "lodging" | "transport" | "activity" | "other">("food");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchExpenses = () => {
    try {
      const stored = localStorage.getItem(`expenses-${trip.id}`);
      if (stored) {
        setExpenses(JSON.parse(stored));
      } else {
        // Seed default expenses if empty and is Goa trip
        let defaultSeeds: Expense[] = [];
        if (trip.id === "trip-goa") {
          defaultSeeds = [
            {
              id: "exp-1",
              tripId: "trip-goa",
              userId: "user-standard",
              description: "Scooter rental 3 days",
              amount: 1200,
              category: "transport",
              date: new Date().toISOString().split("T")[0],
              paidBy: "Explorer"
            },
            {
              id: "exp-2",
              tripId: "trip-goa",
              userId: "user-standard",
              description: "Infantaria breakfast",
              amount: 600,
              category: "food",
              date: new Date().toISOString().split("T")[0],
              paidBy: "Explorer"
            }
          ];
        }
        localStorage.setItem(`expenses-${trip.id}`, JSON.stringify(defaultSeeds));
        setExpenses(defaultSeeds);
      }
    } catch (err) {
      console.error("Failed to load expenses", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [trip.id]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    setLoading(true);
    setError("");

    try {
      const newExpense: Expense = {
        id: "exp-" + Math.random().toString(36).substring(2, 11),
        tripId: trip.id,
        userId: "user-standard",
        description,
        amount: parseFloat(amount),
        category,
        date: new Date().toISOString().split("T")[0],
        paidBy: "Explorer",
      };

      const updated = [...expenses, newExpense];
      localStorage.setItem(`expenses-${trip.id}`, JSON.stringify(updated));
      setExpenses(updated);
      setDescription("");
      setAmount("");
    } catch (err) {
      setError("Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      const updated = expenses.filter((e) => e.id !== id);
      localStorage.setItem(`expenses-${trip.id}`, JSON.stringify(updated));
      setExpenses(updated);
    } catch (err) {
      console.error("Failed to delete expense", err);
    }
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetRatio = Math.min((totalSpent / trip.budget) * 100, 100);

  // Group by category
  const categories = ["food", "lodging", "transport", "activity", "other"];
  const categoryData = categories.map((cat) => {
    const val = expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    return {
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: val,
    };
  });

  // Dynamic colors matching travel elements
  const COLORS = ["#14b8a6", "#6366f1", "#f59e0b", "#ec4899", "#64748b"];

  // Shared bill calculation
  const totalTravelers = trip.travelers || 1;
  const splitAmount = totalSpent / totalTravelers;

  return (
    <div id="expense-tracker-panel" className="bg-slate-900/65 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-teal-400" />
          <h3 className="font-display font-semibold text-lg text-white">Expense Tracker & Budget</h3>
        </div>
        <button
          onClick={fetchExpenses}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/55 text-slate-400 hover:text-white transition-colors"
          title="Refresh Ledger"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Budget Guard */}
      <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800/50 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400 font-mono">Budget Consumption Ledger</span>
          <span className={`text-xs font-mono font-bold ${totalSpent > trip.budget ? "text-rose-400 animate-pulse" : "text-teal-400"}`}>
            ₹{totalSpent.toLocaleString()} / ₹{trip.budget.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${budgetRatio}%` }}
            className={`h-full transition-all duration-500 rounded-full ${
              totalSpent > trip.budget ? "bg-rose-500" : budgetRatio > 85 ? "bg-amber-500" : "bg-teal-500"
            }`}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {totalSpent > trip.budget
            ? "⚠️ Over budget. Consider trimming activity costs."
            : `Remaining budget: ₹${(trip.budget - totalSpent).toLocaleString()} - You are in the safe zone!`}
        </p>
      </div>

      {/* Split Expenses among Travelers */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-slate-950/40 border border-slate-800/30 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Group Split</span>
            <h4 className="text-sm font-semibold text-white">₹{splitAmount.toFixed(0)} <span className="text-xs font-normal text-slate-400">each</span></h4>
            <p className="text-[10px] text-indigo-400 mt-0.5">{totalTravelers} Headcount</p>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/30 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Total Expenses</span>
            <h4 className="text-sm font-semibold text-white">₹{totalSpent.toLocaleString()}</h4>
            <p className="text-[10px] text-teal-400 mt-0.5">{expenses.length} Records</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Entry Form */}
        <form onSubmit={handleAddExpense} className="space-y-3.5">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Record New Expense</h4>
          
          <div>
            <label className="block text-xs text-slate-400 mb-1 font-medium">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Flight to Goa, Dinner Shack"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-teal-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-medium">Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-white focus:outline-none focus:border-teal-500 transition-colors"
              >
                <option value="food">🍔 Food</option>
                <option value="lodging">🏨 Lodging</option>
                <option value="transport">✈️ Transport</option>
                <option value="activity">🎭 Activity</option>
                <option value="other">📦 Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 text-slate-950 text-xs font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Saving..." : "Add Expense"}
          </button>
          {error && <p className="text-xs text-rose-400 font-mono mt-1">{error}</p>}
        </form>

        {/* Categories Chart */}
        <div className="bg-slate-950/30 border border-slate-800/40 rounded-xl p-3 flex flex-col justify-between h-[215px]">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">Category Breakdown</span>
          
          {totalSpent > 0 ? (
            <div className="w-full h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff", fontSize: 11 }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-3 text-slate-500">
              <PieChart className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs">No records available to render graph.</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense ledger list */}
      {expenses.length > 0 && (
        <div className="mt-5 border-t border-slate-800/60 pt-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-2.5">Ledger Entries</h4>
          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-1">
            {expenses.map((e) => (
              <div
                key={e.id}
                id={`expense-item-${e.id}`}
                className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/35 hover:border-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">
                    {e.category === "food"
                      ? "🍔"
                      : e.category === "lodging"
                      ? "🏨"
                      : e.category === "transport"
                      ? "✈️"
                      : e.category === "activity"
                      ? "🎭"
                      : "📦"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{e.description}</p>
                    <p className="text-[10px] text-slate-500">
                      Paid by {e.paidBy} on {e.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-white">₹{e.amount}</span>
                  <button
                    onClick={() => handleDeleteExpense(e.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                    title="Remove record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
