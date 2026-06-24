import React, { useState, useEffect } from "react";
import { ChecklistItem, Trip } from "../types";
import { CheckSquare, Square, Plus, Trash2, ShieldCheck, RefreshCw } from "lucide-react";

interface PackingChecklistProps {
  trip: Trip;
  token: string;
}

export default function PackingChecklist({ trip, token }: PackingChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Clothing");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Clothing");

  const categories = ["Clothing", "Documents", "Electronics", "Toiletries", "Other"];

  const fetchChecklist = () => {
    try {
      const stored = localStorage.getItem(`checklist-${trip.id}`);
      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        // Seed default checklist items if empty
        const defaultSeeds: ChecklistItem[] = [
          { id: `chk-1-${trip.id}`, tripId: trip.id, userId: "user-standard", category: "Documents", text: "Flight Tickets & ID", completed: false },
          { id: `chk-2-${trip.id}`, tripId: trip.id, userId: "user-standard", category: "Documents", text: "Hotel Bookings & Itinerary", completed: false },
          { id: `chk-3-${trip.id}`, tripId: trip.id, userId: "user-standard", category: "Clothing", text: `${trip.style || "Adventure"} Style Outfits`, completed: false },
          { id: `chk-4-${trip.id}`, tripId: trip.id, userId: "user-standard", category: "Electronics", text: "Chargers & Power Bank", completed: false },
          { id: `chk-5-${trip.id}`, tripId: trip.id, userId: "user-standard", category: "Toiletries", text: "Sunscreen & Personal Kit", completed: false },
        ];
        // If it's the default seeded Goa trip, match the initial seeds exactly
        if (trip.id === "trip-goa") {
          defaultSeeds[0].completed = true;
          defaultSeeds[1].completed = true;
          defaultSeeds[2].text = "Swimwear and shorts";
          defaultSeeds[2].completed = true;
          defaultSeeds[3].text = "Power bank";
          defaultSeeds[3].completed = false;
        }
        localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(defaultSeeds));
        setItems(defaultSeeds);
      }
    } catch (err) {
      console.error("Failed to load checklist", err);
    }
  };

  useEffect(() => {
    fetchChecklist();
  }, [trip.id]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);

    try {
      const newItem: ChecklistItem = {
        id: "chk-" + Math.random().toString(36).substring(2, 11),
        tripId: trip.id,
        userId: "user-standard",
        category,
        text: text.trim(),
        completed: false,
      };

      const updated = [...items, newItem];
      localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(updated));
      setItems(updated);
      setText("");
      setActiveTab(category);
    } catch (err) {
      console.error("Failed to add checklist item", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (id: string, currentStatus: boolean) => {
    try {
      const updated = items.map((item) =>
        item.id === id ? { ...item, completed: !currentStatus } : item
      );
      localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(updated));
      setItems(updated);
    } catch (err) {
      console.error("Failed to toggle checklist item", err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const updated = items.filter((item) => item.id !== id);
      localStorage.setItem(`checklist-${trip.id}`, JSON.stringify(updated));
      setItems(updated);
    } catch (err) {
      console.error("Failed to delete checklist item", err);
    }
  };

  // Filter items by category
  const filteredItems = items.filter((item) => item.category === activeTab);
  const totalCompleted = items.filter((item) => item.completed).length;
  const progressPercent = items.length > 0 ? Math.round((totalCompleted / items.length) * 100) : 0;

  return (
    <div id="packing-checklist-panel" className="bg-slate-900/65 rounded-2xl border border-slate-800/80 p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-400" />
          <h3 className="font-display font-semibold text-lg text-white">Smart Packing Assistant</h3>
        </div>
        <button
          onClick={fetchChecklist}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/55 text-slate-400 hover:text-white transition-colors"
          title="Refresh Checklist"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Progress metrics */}
      <div className="bg-slate-950/40 border border-slate-800/50 p-3 rounded-xl flex justify-between items-center mb-5">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Ready to Go?</span>
          <h4 className="text-sm font-semibold text-white">Packing Progress</h4>
        </div>
        <div className="text-right">
          <span className="text-lg font-mono font-bold text-teal-400">{progressPercent}%</span>
          <p className="text-[10px] text-slate-500">
            {totalCompleted}/{items.length} items ready
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 border-b border-slate-800/60 pb-2 mb-4 overflow-x-auto">
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          const readyCount = items.filter((i) => i.category === cat && i.completed).length;
          const isDone = count > 0 && count === readyCount;

          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all whitespace-nowrap border flex items-center gap-1.5 ${
                activeTab === cat
                  ? "bg-teal-500 text-slate-950 border-teal-400 shadow-[0_0_12px_rgba(20,184,166,0.3)] font-semibold"
                  : "bg-slate-950/40 border-slate-800/50 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
              {count > 0 && (
                <span
                  className={`text-[9px] font-mono rounded-full px-1.5 py-0.25 ${
                    activeTab === cat ? "bg-slate-950 text-teal-400" : isDone ? "bg-teal-500/20 text-teal-400" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {readyCount}/{count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Checklist items list */}
      <div className="space-y-2 max-h-[190px] overflow-y-auto mb-5 pr-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              id={`checklist-item-${item.id}`}
              className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-850 hover:border-slate-800 transition-colors group"
            >
              <button
                onClick={() => handleToggleItem(item.id, item.completed)}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0"
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-teal-400 flex-shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500 flex-shrink-0 hover:text-slate-400" />
                )}
                <span className={`text-xs truncate ${item.completed ? "text-slate-500 line-through" : "text-slate-200"}`}>
                  {item.text}
                </span>
              </button>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="text-slate-600 hover:text-rose-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove Item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/20 rounded-xl border border-dashed border-slate-800/60">
            No items in {activeTab}. Add some below!
          </div>
        )}
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-950 text-slate-300 text-xs border border-slate-800 rounded-xl px-2.5 focus:outline-none focus:border-teal-500 transition-colors"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            type="text"
            required
            placeholder="e.g. Travel adaptor, passport copy"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-white focus:outline-none focus:border-teal-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-1.5 top-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 p-1.5 rounded-lg transition-colors flex items-center justify-center"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
