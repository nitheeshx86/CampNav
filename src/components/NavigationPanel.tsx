import React, { useState, useMemo } from 'react';
import { GraphNode, getNodeTypeInfo, PathResult } from '@/lib/pathfinding';
import { MapPin, Navigation, RotateCcw, Search } from 'lucide-react';

interface NavigationPanelProps {
  locations: GraphNode[];
  onNavigate: (startId: string, endId: string) => void;
  onReset: () => void;
  isCalculating: boolean;
}

export function NavigationPanel({
  locations,
  onNavigate,
  onReset,
  isCalculating
}: NavigationPanelProps) {
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [startSearch, setStartSearch] = useState('');
  const [endSearch, setEndSearch] = useState('');

  // Filter locations based on search
  const filteredStartLocations = useMemo(() => {
    if (!startSearch) return locations;
    const search = startSearch.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(search) ||
      loc.type.toLowerCase().includes(search)
    );
  }, [locations, startSearch]);

  const filteredEndLocations = useMemo(() => {
    if (!endSearch) return locations;
    const search = endSearch.toLowerCase();
    return locations.filter(loc =>
      loc.name.toLowerCase().includes(search) ||
      loc.type.toLowerCase().includes(search)
    );
  }, [locations, endSearch]);

  const handleNavigate = () => {
    if (startLocation && endLocation && startLocation !== endLocation) {
      onNavigate(startLocation, endLocation);
    }
  };

  const handleReset = () => {
    setStartLocation('');
    setEndLocation('');
    setStartSearch('');
    setEndSearch('');
    onReset();
  };

  const swapLocations = () => {
    setStartLocation(endLocation);
    setEndLocation(startLocation);
  };

  const canNavigate = startLocation && endLocation && startLocation !== endLocation && !isCalculating;

  return (
    <div className="glass-panel p-5 w-full max-w-sm animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Navigation className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Campus Navigator</h1>
          <p className="text-xs text-muted-foreground">Find your way around</p>
        </div>
      </div>

      {/* Location Inputs */}
      <div className="space-y-3">
        {/* Start Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Starting Point
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search start location..."
              value={startSearch}
              onChange={(e) => setStartSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <select
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="select-navigation text-sm"
          >
            <option value="">Select start location</option>
            {filteredStartLocations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({getNodeTypeInfo(loc.type).label})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapLocations}
            className="btn-ghost p-2 rounded-full hover:bg-muted"
            title="Swap locations"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* End Location */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Destination
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search destination..."
              value={endSearch}
              onChange={(e) => setEndSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>
          <select
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="select-navigation text-sm"
          >
            <option value="">Select destination</option>
            {filteredEndLocations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({getNodeTypeInfo(loc.type).label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mt-5">
        <button
          onClick={handleNavigate}
          disabled={!canNavigate}
          className="btn-navigation flex-1 flex items-center justify-center gap-2"
        >
          {isCalculating ? (
            <>
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4" />
              Navigate
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="btn-secondary px-4"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Instructions */}
      <p className="mt-4 text-xs text-muted-foreground text-center">
        🖱️ Scroll to zoom • Drag to pan
      </p>
    </div>
  );
}
