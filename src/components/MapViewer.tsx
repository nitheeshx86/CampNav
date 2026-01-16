import React, { useEffect, useRef, useState, useCallback } from 'react';
import panzoom, { PanZoom } from 'panzoom';
import { PathResult, GraphNode } from '@/lib/pathfinding';
import { ZoomIn, ZoomOut, Globe } from 'lucide-react';

interface MapViewerProps {
  pathResult: PathResult | null;
  startNode: GraphNode | null;
  endNode: GraphNode | null;
  nodes: GraphNode[];
  language: 'en' | 'ta' | 'fr' | 'cpf' | 'hi' | 'de' | 'es';
  onLanguageChange: (lang: 'en' | 'ta' | 'fr' | 'cpf' | 'hi' | 'de' | 'es') => void;
}

export function MapViewer({ pathResult, startNode, endNode, nodes, language, onLanguageChange }: MapViewerProps) {
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const panzoomInstance = useRef<PanZoom | null>(null);

  // Load SVG
  useEffect(() => {
    async function loadSvg() {
      try {
        const response = await fetch('/map.svg');
        const text = await response.text();
        // Clean up namespace prefixes for browser compatibility
        const cleanedSvg = text
          .replace(/ns0:/g, '')
          .replace(/xmlns:ns0/g, 'xmlns');

        // Parse SVG and color buildings
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanedSvg, 'image/svg+xml');
        const paths = doc.querySelectorAll('path');

        paths.forEach((path) => {
          const id = path.id.toLowerCase();
          const isBuilding =
            id.includes('block') ||
            id.includes('hostel') ||
            id.includes('food') ||
            id.includes('bank') ||
            id.includes('mart') ||
            id.includes('guesthouse') ||
            id.includes('library');

          if (isBuilding) {
            // Generate deterministic pastel color based on ID to keep it stable across re-renders
            // simple hash of the string
            let hash = 0;
            for (let i = 0; i < id.length; i++) {
              hash = id.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash % 360);
            path.setAttribute('fill', `hsl(${hue}, 25%, 94%)`);
            path.style.transition = 'fill 0.3s ease';

            // Calculate centroid for label placement
            const d = path.getAttribute('d') || '';
            const nums = d.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number) || [];
            if (nums.length >= 2) {
              let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
              for (let i = 0; i < nums.length; i += 2) {
                const x = nums[i];
                const y = nums[i + 1];
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
              }
              const width = maxX - minX;
              const height = maxY - minY;
              const cx = (minX + maxX) / 2;
              const cy = (minY + maxY) / 2;

              // Determine Label and Icon
              let label = '';
              let icon = '';
              const lowerId = id;

              if (lowerId.includes('hostel')) {
                icon = '🛏️';
                const match = lowerId.match(/^([a-z0-9]+)_hostel/);
                if (match) label = match[1].toUpperCase();
              } else if (lowerId.includes('block')) {
                icon = '🏢';
                const match = lowerId.match(/^([a-z0-9]+)_block/);
                if (match) label = match[1].toUpperCase();
                if (lowerId.includes('admin')) { icon = '🏛️'; label = 'Admin'; }
                if (lowerId.includes('library')) { icon = '📚'; label = 'Library'; }
                if (lowerId.includes('health')) { icon = '🏥'; label = 'Health'; }
              } else if (lowerId.includes('food') || lowerId.includes('gazibo') || lowerId.includes('aavin')) {
                icon = '🍔';
                label = 'Food';
                if (lowerId.includes('dominos')) label = 'Dominos';
                if (lowerId.includes('northsquare')) label = 'North Sq';
                if (lowerId.includes('gymkhana')) { icon = '🏋️'; label = 'Gym'; }
              } else if (lowerId.includes('bank')) {
                icon = '🏦';
                label = 'Bank';
              } else if (lowerId.includes('mart')) {
                icon = '🛒';
                label = 'Mart';
              } else if (lowerId.includes('guesthouse')) {
                icon = '🏨';
                label = 'Guest';
              } else if (lowerId.includes('ground')) {
                icon = '⛳';
                const match = lowerId.match(/^([a-z0-9]+)_ground/);
                if (match) label = match[1].charAt(0).toUpperCase() + match[1].slice(1);
              }

              if (icon) {
                // Create label group
                const labelGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
                labelGroup.setAttribute('transform', `translate(${cx}, ${cy})`);
                labelGroup.setAttribute('class', 'building-label');
                labelGroup.style.pointerEvents = 'none';

                const isSmall = width < 200 || height < 200;

                // Icon Text
                const iconText = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
                iconText.textContent = icon;
                iconText.setAttribute('text-anchor', 'middle');
                iconText.setAttribute('dominant-baseline', isSmall ? 'central' : 'auto');
                iconText.setAttribute('font-size', isSmall ? '28' : '36');
                iconText.setAttribute('y', isSmall ? '0' : '-10');
                iconText.style.filter = 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))';
                labelGroup.appendChild(iconText);

                // Label Text (only if not small)
                if (!isSmall && label) {
                  const textElement = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
                  textElement.textContent = label;
                  textElement.setAttribute('text-anchor', 'middle');
                  textElement.setAttribute('dominant-baseline', 'hanging');
                  textElement.setAttribute('font-size', '24');
                  textElement.setAttribute('font-weight', 'bold');
                  textElement.setAttribute('fill', 'white');
                  textElement.setAttribute('y', '15');
                  textElement.style.textShadow = '0 2px 4px rgba(0,0,0,0.6)';
                  textElement.style.fontFamily = 'var(--font-sans)';
                  labelGroup.appendChild(textElement);
                }

                // Append to root (at the end for z-index)
                doc.documentElement.appendChild(labelGroup);
              }
            }
          }
        });

        setSvgContent(doc.documentElement.outerHTML);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load SVG:', err);
        setIsLoading(false);
      }
    }
    loadSvg();
  }, []);

  // Initialize panzoom
  useEffect(() => {
    if (!svgContainerRef.current || isLoading) return;

    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Initialize panzoom
    panzoomInstance.current = panzoom(svg, {
      maxZoom: 5,
      minZoom: 0.3,
      initialZoom: 0.4,
      bounds: true,
      boundsPadding: 0.1,
      smoothScroll: false
    });

    // Center the map initially
    const containerWidth = containerRef.current?.clientWidth || window.innerWidth;
    const containerHeight = containerRef.current?.clientHeight || window.innerHeight;

    setTimeout(() => {
      panzoomInstance.current?.moveTo(
        containerWidth / 2 - 2490 * 0.4,
        containerHeight / 2 - 2731 * 0.4
      );
    }, 100);

    return () => {
      panzoomInstance.current?.dispose();
    };
  }, [isLoading, svgContent]);

  // Draw path overlay
  useEffect(() => {
    if (!svgContainerRef.current || !pathResult) return;

    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;

    // Remove existing path overlay and any comet styles
    const existingOverlay = svg.querySelector('#path-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Clean up old comet styles
    document.querySelectorAll('[id^="comet-style-"]').forEach(el => el.remove());

    // Create path overlay group
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    overlay.id = 'path-overlay';

    // Create path string from coordinates
    const pathD = pathResult.coordinates
      .map((coord, i) => `${i === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`)
      .join(' ');

    const pathLength = 5000; // Large value for initial dasharray if needed, but we'll use actual length

    // Glow effect path (wider, blurred) - static background
    const glowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    glowPath.setAttribute('d', pathD);
    glowPath.setAttribute('fill', 'none');
    glowPath.setAttribute('stroke', 'hsl(190, 100%, 60%)');
    glowPath.setAttribute('stroke-width', '25');
    glowPath.setAttribute('stroke-linecap', 'round');
    glowPath.setAttribute('stroke-linejoin', 'round');
    glowPath.setAttribute('opacity', '0.2');
    glowPath.setAttribute('filter', 'blur(8px)');

    // Main path - static background
    const mainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mainPath.setAttribute('d', pathD);
    mainPath.setAttribute('fill', 'none');
    mainPath.setAttribute('stroke', 'hsl(190, 100%, 55%)');
    mainPath.setAttribute('stroke-width', '12');
    mainPath.setAttribute('stroke-linecap', 'round');
    mainPath.setAttribute('stroke-linejoin', 'round');
    mainPath.setAttribute('opacity', '0.4');

    // Add static paths
    overlay.appendChild(glowPath);
    overlay.appendChild(mainPath);

    // Get actual path length for comet animation
    // Temporarily add to SVG to measure
    svg.appendChild(overlay);
    const actualLength = mainPath.getTotalLength();

    // Create Comet effect
    const comet = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    comet.setAttribute('d', pathD);
    comet.setAttribute('fill', 'none');
    comet.setAttribute('stroke', 'white');
    comet.setAttribute('stroke-width', '14');
    comet.setAttribute('stroke-linecap', 'round');
    comet.setAttribute('stroke-linejoin', 'round');
    comet.style.filter = 'drop-shadow(0 0 12px hsl(190, 100%, 80%))';

    const cometHeadLength = Math.min(actualLength * 0.1, 80);
    comet.style.strokeDasharray = `${cometHeadLength} ${actualLength}`;

    // Create unique animation
    const animId = `comet-anim-${Math.random().toString(36).substr(2, 9)}`;
    const styleId = `comet-style-${animId}`;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes ${animId} {
        0% { stroke-dashoffset: ${actualLength + cometHeadLength}; }
        100% { stroke-dashoffset: 0; }
      }
    `;
    document.head.appendChild(style);

    comet.style.animation = `${animId} 3s linear infinite`;
    overlay.appendChild(comet);

    // Start marker
    if (pathResult.coordinates.length > 0) {
      const startCoord = pathResult.coordinates[0];
      const startMarker = createMarker(startCoord.x, startCoord.y, 'hsl(145, 80%, 45%)', '🚶');
      overlay.appendChild(startMarker);
    }

    // End marker
    if (pathResult.coordinates.length > 1) {
      const endCoord = pathResult.coordinates[pathResult.coordinates.length - 1];
      const endMarker = createMarker(endCoord.x, endCoord.y, 'hsl(0, 85%, 55%)', '📍');
      overlay.appendChild(endMarker);
    }

  }, [pathResult]);

  // Create SVG marker element
  function createMarker(x: number, y: number, color: string, emoji: string): SVGGElement {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${x}, ${y})`);

    // Pulsing ring
    const pulseRing = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pulseRing.setAttribute('r', '35');
    pulseRing.setAttribute('fill', color);
    pulseRing.setAttribute('opacity', '0.3');
    pulseRing.innerHTML = `<animate attributeName="r" values="30;45;30" dur="2s" repeatCount="indefinite"/>
                            <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>`;

    // Main circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '25');
    circle.setAttribute('fill', color);
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '4');

    // Emoji text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('font-size', '24');
    text.textContent = emoji;

    g.appendChild(pulseRing);
    g.appendChild(circle);
    g.appendChild(text);

    return g;
  }

  // Clear path overlay
  useEffect(() => {
    if (!pathResult && svgContainerRef.current) {
      const svg = svgContainerRef.current.querySelector('svg');
      if (svg) {
        const overlay = svg.querySelector('#path-overlay');
        if (overlay) {
          overlay.remove();
        }
      }
    }
  }, [pathResult]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (panzoomInstance.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      panzoomInstance.current.smoothZoom(cx, cy, 1.5);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (panzoomInstance.current && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      panzoomInstance.current.smoothZoom(cx, cy, 0.67);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (panzoomInstance.current && containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      panzoomInstance.current.zoomAbs(0, 0, 0.4);
      panzoomInstance.current.moveTo(
        containerWidth / 2 - 2490 * 0.4,
        containerHeight / 2 - 2731 * 0.4
      );
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading campus map...</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-[#1E1E1E] overflow-hidden">
      {/* Map Container */}
      <div
        ref={svgContainerRef}
        className="map-container w-full h-full"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-muted transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-foreground" />
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 glass-panel flex items-center justify-center hover:bg-muted transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-foreground" />
        </button>
        <div className="relative">
          {isLangMenuOpen && (
            <div className="absolute bottom-full right-0 mb-2 bg-card/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl min-w-[140px] animate-in fade-in slide-in-from-bottom-2">
              <div className="p-1 max-h-48 overflow-y-auto no-scrollbar">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ta', label: 'தமிழ்' },
                  { code: 'fr', label: 'Français' },
                  { code: 'cpf', label: 'Creole' },
                  { code: 'hi', label: 'हिन्दी' },
                  { code: 'de', label: 'Deutsch' },
                  { code: 'es', label: 'Español' }
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code as any);
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${language === lang.code
                      ? 'bg-primary/20 text-primary'
                      : 'hover:bg-white/5 text-foreground/80'
                      }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className={`w-10 h-10 glass-panel flex items-center justify-center transition-all ${isLangMenuOpen ? 'bg-primary/20 text-primary' : 'hover:bg-muted text-foreground'}`}
            title="Change Language"
          >
            <Globe className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
