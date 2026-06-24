import React, { useState, useEffect } from "react";
import { MapPin, Navigation, Compass, ShieldAlert, Sparkles, Building, Utensils } from "lucide-react";
import { Trip } from "../types";

interface MapMockProps {
  trip: Trip;
}

export default function MapMock({ trip }: MapMockProps) {
  const [selectedPin, setSelectedPin] = useState<{ name: string; type: "attraction" | "hotel" | "start"; x: number; y: number } | null>(null);
  const [pins, setPins] = useState<{ id: string; name: string; type: "attraction" | "hotel" | "start"; x: number; y: number; info?: string }[]>([]);

  useEffect(() => {
    // Generate deterministic coordinate offsets based on attraction/hotel names for visual positioning
    const points: typeof pins = [];
    
    // Starting node (approx center)
    points.push({
      id: "start",
      name: `Departure Hub (${trip.destination})`,
      type: "start",
      x: 180,
      y: 150,
      info: "Core base for routing"
    });

    // Plot hotels
    if (trip.hotels && trip.hotels.length > 0) {
      trip.hotels.forEach((hotel, idx) => {
        const hash = hotel.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const x = 100 + (hash % 200) + (idx * 20);
        const y = 80 + (hash % 140) + (idx * 20);
        points.push({
          id: `hotel-${idx}`,
          name: hotel.name,
          type: "hotel",
          x,
          y,
          info: `${hotel.price} | ${hotel.rating}`
        });
      });
    }

    // Plot attractions
    if (trip.attractions && trip.attractions.length > 0) {
      trip.attractions.forEach((attr, idx) => {
        const hash = attr.name.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const x = 80 + (hash % 240) + (idx * 30);
        const y = 60 + (hash % 160) + (idx * 30);
        points.push({
          id: `attr-${idx}`,
          name: attr.name,
          type: "attraction",
          x,
          y,
          info: attr.description
        });
      });
    }

    setPins(points);
  }, [trip]);

  return (
    <div id="interactive-map-panel" className="bg-slate-900/65 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-teal-400 animate-spin-slow" />
          <h3 className="font-display font-semibold text-lg text-white">Interactive Route Map</h3>
        </div>
        <span className="text-xs font-mono bg-teal-500/10 text-teal-400 px-2.5 py-1 rounded-full border border-teal-500/20">
          {trip.destination} Vector Overlay
        </span>
      </div>

      <div className="relative bg-slate-950 rounded-xl h-[320px] overflow-hidden border border-slate-800/50 flex items-center justify-center">
        {/* Background Grid Pattern to feel tactical */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />
        
        {/* Radar Ping Effect */}
        <div className="absolute w-44 h-44 rounded-full border border-teal-500/10 bg-teal-500/2 animate-ping opacity-25" />

        {/* Dynamic Route Polyline */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {pins.length > 1 && (
            <path
              d={`M ${pins.map(p => `${p.x} ${p.y}`).join(" L ")}`}
              fill="none"
              stroke="#14b8a6"
              strokeWidth="2"
              strokeDasharray="6,4"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Plotting Pins */}
        {pins.map((pin) => (
          <button
            key={pin.id}
            id={`map-pin-${pin.id}`}
            onClick={() => setSelectedPin(pin)}
            style={{ left: `${pin.x}px`, top: `${pin.y}px` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all group duration-300 ${
              selectedPin?.name === pin.name
                ? "bg-teal-500 text-slate-950 scale-125 z-20 shadow-[0_0_15px_rgba(20,184,166,0.6)]"
                : pin.type === "hotel"
                ? "bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500 hover:text-white z-10"
                : pin.type === "start"
                ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white z-10"
                : "bg-teal-500/20 text-teal-400 hover:bg-teal-500 hover:text-slate-950 z-10"
            }`}
          >
            {pin.type === "hotel" ? (
              <Building className="w-4 h-4" />
            ) : pin.type === "start" ? (
              <Navigation className="w-4 h-4 rotate-45" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}

            {/* Hover Tooltip */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[11px] font-medium bg-slate-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none border border-slate-800 z-30">
              {pin.name}
            </span>
          </button>
        ))}

        {/* Interactive Popup Box */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-teal-500/30 p-3.5 rounded-xl flex items-start gap-3 shadow-2xl animate-fade-in z-30 backdrop-blur-md">
            <div className={`p-2 rounded-lg ${
              selectedPin.type === "hotel" ? "bg-indigo-500/10 text-indigo-400" : "bg-teal-500/10 text-teal-400"
            }`}>
              {selectedPin.type === "hotel" ? <Building className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white truncate">{selectedPin.name}</h4>
              <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{selectedPin.info || "Plan spot loaded securely."}</p>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="text-xs font-mono text-slate-500 hover:text-white bg-slate-850 px-2 py-0.5 rounded border border-slate-800"
            >
              Close
            </button>
          </div>
        )}

        <div className="absolute top-3 right-3 text-[10px] text-slate-500 font-mono bg-slate-900/40 px-2 py-1 rounded border border-slate-800/20 backdrop-blur-sm pointer-events-none">
          Click pins to explore locations
        </div>
      </div>

      {/* Map Legend */}
      <div className="grid grid-cols-3 gap-2 mt-3.5">
        <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40 justify-center">
          <Navigation className="w-3.5 h-3.5 text-amber-400 rotate-45" />
          <span className="text-xs text-slate-300">Transit Center</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40 justify-center">
          <Building className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs text-slate-300">Lodging Node</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded-xl border border-slate-800/40 justify-center">
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-xs text-slate-300">Attractions</span>
        </div>
      </div>
    </div>
  );
}
