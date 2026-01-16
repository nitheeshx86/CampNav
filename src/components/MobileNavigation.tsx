import React, { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft, Utensils, GraduationCap, Dribbble, MapPin, X, Navigation2, Music } from 'lucide-react';
import { GraphNode, getNodeTypeInfo, PathResult, Graph } from '@/lib/pathfinding';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
    locations: GraphNode[];
    onNavigate: (startId: string, endId: string) => void;
    onReset: () => void;
    isCalculating: boolean;
    selectedStart?: GraphNode | null;
    selectedEnd?: GraphNode | null;
    onSearchOpenChange?: (isOpen: boolean) => void;
    pathResult?: PathResult | null;
    graph?: Graph | null;
    language?: 'en' | 'ta' | 'fr' | 'cpf' | 'hi' | 'de' | 'es';
}

const translations = {
    en: {
        whereTo: "Where to?",
        to: "To",
        from: "From",
        currentLocation: "Current Location",
        searchPlaceholder: "Search campus buildings...",
        planRoute: "Plan your route",
        selectStartEnd: "Select start and destination",
        popularLocations: "Popular Locations",
        suggestions: "Suggestions",
        routeGuide: "Route Guide",
        followPath: "Follow the path shown on the map.",
        directPath: "Direct path to destination.",
        passBy: "Pass by",
        funFacts: "Fun Facts",
        noFacts: "No fun facts available for this building yet!",
        calculating: "Calculating...",
        getDirections: "Get Directions",
        auditorium: "Auditorium",
        food: "Food",
        academics: "Academics",
        play: "Play",
        study: "Study",
        eat: "Eat",
        searchBuildings: "Search Buildings",
        findDestination: "Find your destination on campus"
    },
    ta: {
        whereTo: "எங்கே செல்ல வேண்டும்?",
        to: "செல்லுமிடம்",
        from: "இருப்பிடம்",
        currentLocation: "தற்போதைய இடம்",
        searchPlaceholder: "வளாக கட்டிடங்களைத் தேடுக...",
        planRoute: "வழித்திட்டமிடல்",
        selectStartEnd: "தொடக்க மற்றும் இலக்கு இடத்தைத் தேர்ந்தெடுக்கவும்",
        popularLocations: "பிரபலமான இடங்கள்",
        suggestions: "பரிந்துரைகள்",
        routeGuide: "வழிகாட்டி",
        followPath: "வரைபடத்தில் காட்டப்பட்டுள்ள பாதையைப் பின்பற்றவும்.",
        directPath: "இலக்குக்கு நேரடி பாதை.",
        passBy: "இதன் வழியாக",
        funFacts: "சுவாரஸ்யமான தகவல்கள்",
        noFacts: "இந்த கட்டிடத்தைப் பற்றிய தகவல்கள் எதுவும் இல்லை!",
        calculating: "கணக்கிடுகிறது...",
        getDirections: "வழியைப் பெறுக",
        auditorium: "அரங்கம்",
        food: "உணவு",
        academics: "கல்வி",
        play: "விளையாட்டு",
        study: "படிப்பு",
        eat: "உணவு",
        searchBuildings: "கட்டிடங்களைத் தேடு",
        findDestination: "வளாகத்தில் உங்கள் இலக்கைக் கண்டறியவும்"
    },
    fr: {
        whereTo: "Où aller ?",
        to: "Vers",
        from: "De",
        currentLocation: "Position actuelle",
        searchPlaceholder: "Rechercher des bâtiments...",
        planRoute: "Planifier votre itinéraire",
        selectStartEnd: "Sélectionnez le départ et l'arrivée",
        popularLocations: "Lieux populaires",
        suggestions: "Suggestions",
        routeGuide: "Guide d'itinéraire",
        followPath: "Suivez le chemin indiqué.",
        directPath: "Chemin direct.",
        passBy: "Passer par",
        funFacts: "Faits amusants",
        noFacts: "Aucun fait amusant disponible !",
        calculating: "Calcul...",
        getDirections: "Obtenir l'itinéraire",
        auditorium: "Auditorium",
        food: "Nourriture",
        academics: "Académique",
        play: "Jouer",
        study: "Étudier",
        eat: "Manger",
        searchBuildings: "Rechercher",
        findDestination: "Trouvez votre destination"
    },
    cpf: {
        whereTo: "Kotsa ou pé ale?",
        to: "Ver",
        from: "Depi",
        currentLocation: "Plas aktuel",
        searchPlaceholder: "Rod bann batiman...",
        planRoute: "Planifye ou traze",
        selectStartEnd: "Swezi komansman ek finisyon",
        popularLocations: "Bann plas popiler",
        suggestions: "Sijeston",
        routeGuide: "Gid traze",
        followPath: "Swiv semin lor lap",
        directPath: "Semin direkt",
        passBy: "Pas par",
        funFacts: "Zistwar",
        noFacts: "Pena zistwar pou sa batima la!",
        calculating: "Pé kalkilé...",
        getDirections: "Gagn semin",
        auditorium: "Oditoryom",
        food: "Manzé",
        academics: "Lekol",
        play: "Zwe",
        study: "Aprann",
        eat: "Manzé",
        searchBuildings: "Rod Batiman",
        findDestination: "Trouv ou destinasyon"
    },
    hi: {
        whereTo: "कहाँ जाना है?",
        to: "को",
        from: "से",
        currentLocation: "वर्तमान स्थान",
        searchPlaceholder: "परिसर की इमारतें खोजें...",
        planRoute: "अपना मार्ग खोजें",
        selectStartEnd: "शुरुआत और गंतव्य चुनें",
        popularLocations: "लोकप्रिय स्थान",
        suggestions: "सुझाव",
        routeGuide: "मार्ग गाइड",
        followPath: "मानचित्र पर दिखाए गए मार्ग का पालन करें।",
        directPath: "गंतव्य के लिए सीधा रास्ता।",
        passBy: "के पास से गुजरें",
        funFacts: "रोचक तथ्य",
        noFacts: "इस इमारत के लिए कोई रोचक तथ्य उपलब्ध नहीं हैं!",
        calculating: "गणना हो रही है...",
        getDirections: "दिशाएं प्राप्त करें",
        auditorium: "अ सभागार",
        food: "भोजन",
        academics: "शिक्षा",
        play: "खेल",
        study: "पढाई",
        eat: "खाना",
        searchBuildings: "इमारतें खोजें",
        findDestination: "परिसर में अपना गंतव्य खोजें"
    },
    de: {
        whereTo: "Wohin?",
        to: "Nach",
        from: "Von",
        currentLocation: "Aktueller Standort",
        searchPlaceholder: "Gebäude suchen...",
        planRoute: "Route planen",
        selectStartEnd: "Start und Ziel wählen",
        popularLocations: "Beliebte Orte",
        suggestions: "Vorschläge",
        routeGuide: "Routenführung",
        followPath: "Folgen Sie dem Pfad auf der Karte.",
        directPath: "Direkter Weg zum Ziel.",
        passBy: "Vorbei an",
        funFacts: "Wissenswertes",
        noFacts: "Keine Fakten verfügbar!",
        calculating: "Berechne...",
        getDirections: "Route abrufen",
        auditorium: "Auditorium",
        food: "Essen",
        academics: "Akademik",
        play: "Spielen",
        study: "Lernen",
        eat: "Essen",
        searchBuildings: "Gebäude suchen",
        findDestination: "Finden Sie Ihr Ziel"
    },
    es: {
        whereTo: "¿A dónde vas?",
        to: "A",
        from: "De",
        currentLocation: "Ubicación actual",
        searchPlaceholder: "Buscar edificios...",
        planRoute: "Planifica tu ruta",
        selectStartEnd: "Selecciona inicio y destino",
        popularLocations: "Lugares populares",
        suggestions: "Sugerencias",
        routeGuide: "Guía de ruta",
        followPath: "Sigue el camino en el mapa.",
        directPath: "Camino directo al destino.",
        passBy: "Pasar por",
        funFacts: "Datos curiosos",
        noFacts: "¡No hay datos curiosos disponibles!",
        calculating: "Calculando...",
        getDirections: "Obtener indicaciones",
        auditorium: "Auditorio",
        food: "Comida",
        academics: "Académico",
        play: "Jugar",
        study: "Estudiar",
        eat: "Comer",
        searchBuildings: "Buscar edificios",
        findDestination: "Encuentra tu destino"
    }
};

export function MobileNavigation({
    locations,
    onNavigate,
    onReset,
    isCalculating,
    selectedStart,
    selectedEnd,
    onSearchOpenChange,
    pathResult,
    graph,
    language = 'en'
}: MobileNavigationProps) {
    const t = translations[language];
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [startQuery, setStartQuery] = useState('');
    const [endQuery, setEndQuery] = useState('');
    const [startLoc, setStartLoc] = useState<GraphNode | null>(null);
    const [endLoc, setEndLoc] = useState<GraphNode | null>(null);
    const [activeField, setActiveField] = useState<'start' | 'end'>('end');
    const [isFactsExpanded, setIsFactsExpanded] = useState(false);

    // Notify parent about search state
    useEffect(() => {
        onSearchOpenChange?.(isSearchOpen);
    }, [isSearchOpen, onSearchOpenChange]);

    // Categorized locations
    const { studyLocations, playLocations, eatLocations } = useMemo(() => {
        return {
            studyLocations: locations.filter(l => l.type === 'academic' || l.type === 'auditorium'),
            playLocations: locations.filter(l => l.type === 'sports'),
            eatLocations: locations.filter(l => l.type === 'food')
        };
    }, [locations]);

    // Filter suggestions
    const suggestions = useMemo(() => {
        const query = activeField === 'start' ? startQuery : endQuery;
        if (!query) return []; // Return empty if no query, we handle default view separately

        const lowerQuery = query.toLowerCase();
        return locations.filter(loc =>
            loc.name.toLowerCase().includes(lowerQuery) ||
            loc.type.toLowerCase().includes(lowerQuery)
        ).slice(0, 8);
    }, [locations, startQuery, endQuery, activeField]);

    const handleSelectLocation = (loc: GraphNode) => {
        if (activeField === 'start') {
            setStartLoc(loc);
            setStartQuery(loc.name);
            setActiveField('end');
        } else {
            setEndLoc(loc);
            setEndQuery(loc.name);
        }
    };

    const handleStartNavigation = () => {
        if (startLoc && endLoc) {
            onNavigate(startLoc.id, endLoc.id);
            setIsSearchOpen(false);
        }
    };

    const handleCategoryClick = (category: string) => {
        setIsSearchOpen(true);
        setActiveField('end');
        setEndQuery(category);
    };

    // Sync local state when selection is cleared globally
    useEffect(() => {
        if (!selectedStart && !selectedEnd) {
            setStartQuery('');
            setEndQuery('');
            setStartLoc(null);
            setEndLoc(null);
        }
    }, [selectedStart, selectedEnd]);

    // Close search on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsSearchOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <>
            {/* Home Screen Search Bar & Categories */}
            <div className={cn(
                "fixed top-0 left-0 right-0 z-40 p-4 pt-6 transition-all duration-500 ease-in-out bg-gradient-to-b from-background via-background/80 to-transparent",
                isSearchOpen ? "opacity-0 pointer-events-none -translate-y-10" : "opacity-100"
            )}>
                <div className="flex flex-col gap-6 max-w-sm mx-auto">
                    {/* Main Search Bar */}
                    <div className="relative group">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-full bg-card/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-card/80 transition-all text-left"
                        >
                            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                                {selectedEnd ? <Navigation2 className="w-5 h-5 text-primary" /> : <Search className="w-5 h-5 text-primary" />}
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden">
                                <span className="text-foreground font-bold tracking-tight truncate">
                                    {selectedEnd ? `${t.to} ${selectedEnd.name}` : t.whereTo}
                                </span>
                                <span className="text-xs text-muted-foreground truncate">
                                    {selectedStart ? `${t.from} ${selectedStart.name}` : t.searchPlaceholder}
                                </span>
                            </div>
                        </button>
                        {(selectedStart || selectedEnd) && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onReset();
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all z-10"
                                title="Clear route"
                            >
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>

                    {/* Category Shortcuts */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 mask-fade-right">
                        <CategoryCard
                            icon={<Music className="w-4 h-4" />}
                            label={t.auditorium}
                            emoji=""
                            onClick={() => handleCategoryClick('Auditorium')}
                        />
                        <CategoryCard
                            icon={<Utensils className="w-4 h-4" />}
                            label={t.food}
                            emoji=""
                            onClick={() => handleCategoryClick('Food')}
                        />
                        <CategoryCard
                            icon={<GraduationCap className="w-4 h-4" />}
                            label={t.academics}
                            emoji=""
                            onClick={() => handleCategoryClick('Academic')}
                        />
                        <CategoryCard
                            icon={<Dribbble className="w-4 h-4" />}
                            label={t.play}
                            emoji=""
                            onClick={() => handleCategoryClick('Sports')}
                        />
                    </div>
                </div>
            </div>

            {/* Full-screen Search Overlay */}
            <div className={cn(
                "fixed inset-0 z-50 bg-background transition-all duration-700 ease-out flex flex-col",
                isSearchOpen ? "translate-y-0" : "translate-y-full"
            )}>
                {/* Header with Inputs */}
                <div className="p-6 pt-12 bg-card/40 backdrop-blur-3xl border-b border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold">{t.planRoute}</h2>
                            <p className="text-xs text-muted-foreground">{t.selectStartEnd}</p>
                        </div>
                    </div>

                    <div className="space-y-3 relative px-1">
                        {/* Visual connector line */}
                        <div className="absolute left-[24px] top-[48px] bottom-[48px] w-[2px] bg-gradient-to-b from-green-500 via-primary to-red-500 opacity-20" />

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-green-500 bg-background z-10" />
                            <input
                                placeholder={`${t.from}: ${t.currentLocation}`}
                                value={startQuery}
                                onFocus={() => setActiveField('start')}
                                onChange={(e) => setStartQuery(e.target.value)}
                                className={cn(
                                    "w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50",
                                    activeField === 'start' && "bg-white/[0.08] border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                )}
                            />
                            {startQuery && (
                                <button
                                    onClick={() => { setStartQuery(''); setStartLoc(null); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>

                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-red-500 bg-background z-10" />
                            <input
                                autoFocus
                                placeholder={t.whereTo}
                                value={endQuery}
                                onFocus={() => setActiveField('end')}
                                onChange={(e) => setEndQuery(e.target.value)}
                                className={cn(
                                    "w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground/50",
                                    activeField === 'end' && "bg-white/[0.08] border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                )}
                            />
                            {endQuery && (
                                <button
                                    onClick={() => { setEndQuery(''); setEndLoc(null); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Suggestions List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-24">
                    {!activeField || (activeField === 'start' ? !startQuery : !endQuery) ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Study Section */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <span className="text-sm">📚</span> {t.study}
                                </p>
                                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 mask-fade-right">
                                    {studyLocations.map((loc) => (
                                        <button
                                            key={loc.id}
                                            onClick={() => handleSelectLocation(loc)}
                                            className="flex-shrink-0 w-48 p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all group text-left flex flex-col justify-center min-h-[80px]"
                                        >
                                            <p className="font-bold text-foreground truncate w-full">{loc.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1 truncate w-full">
                                                {loc.floor ? `${loc.floor} • ` : ''}{getNodeTypeInfo(loc.type).label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Play Section */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <span className="text-sm">⚽</span> {t.play}
                                </p>
                                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 mask-fade-right">
                                    {playLocations.map((loc) => (
                                        <button
                                            key={loc.id}
                                            onClick={() => handleSelectLocation(loc)}
                                            className="flex-shrink-0 w-48 p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all group text-left flex flex-col justify-center min-h-[80px]"
                                        >
                                            <p className="font-bold text-foreground truncate w-full">{loc.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1 truncate w-full">
                                                {loc.floor ? `${loc.floor} • ` : ''}{getNodeTypeInfo(loc.type).label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Eat Section */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                    <span className="text-sm">🍔</span> {t.eat}
                                </p>
                                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 mask-fade-right">
                                    {eatLocations.map((loc) => (
                                        <button
                                            key={loc.id}
                                            onClick={() => handleSelectLocation(loc)}
                                            className="flex-shrink-0 w-48 p-4 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all group text-left flex flex-col justify-center min-h-[80px]"
                                        >
                                            <p className="font-bold text-foreground truncate w-full">{loc.name}</p>
                                            <p className="text-xs text-muted-foreground mt-1 truncate w-full">
                                                {loc.floor ? `${loc.floor} • ` : ''}{getNodeTypeInfo(loc.type).label}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : suggestions.length > 0 ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <p className="text-[10px] font-bold text-muted-foreground mb-4 uppercase tracking-[0.2em] px-2">
                                {t.suggestions}
                            </p>
                            <div className="grid gap-2">
                                {suggestions.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => handleSelectLocation(loc)}
                                        className="w-full flex items-center gap-4 p-4 rounded-3xl hover:bg-white/[0.05] transition-all group relative overflow-hidden"
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:scale-105">
                                            <MapPin className="w-6 h-6 text-primary" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{loc.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {loc.floor ? `${loc.floor} • ` : ''}{getNodeTypeInfo(loc.type).label}
                                            </p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Navigation2 className="w-4 h-4 text-primary" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-6 opacity-40 animate-pulse">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                                <Search className="w-10 h-10" />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-lg">{t.searchBuildings}</p>
                                <p className="text-sm">{t.findDestination}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-white/5 bg-background/80 backdrop-blur-xl">
                    <button
                        onClick={handleStartNavigation}
                        disabled={!startLoc || !endLoc || isCalculating}
                        className="w-full bg-primary text-primary-foreground py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100 uppercase tracking-widest"
                    >
                        {isCalculating ? (
                            <div className="w-6 h-6 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <Navigation2 className="w-6 h-6 fill-current" />
                        )}
                        {isCalculating ? t.calculating : t.getDirections}
                    </button>
                </div>
            </div>

            {/* Fun Facts Pull-up Box */}
            {selectedEnd && !isSearchOpen && !pathResult && (
                <div
                    className={cn(
                        "fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm z-40 transition-all duration-500 ease-in-out px-4 pb-6",
                        isFactsExpanded ? "h-[60vh]" : "h-24"
                    )}
                >
                    <div
                        className="bg-card/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] h-full shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col pt-2"
                        onClick={() => setIsFactsExpanded(!isFactsExpanded)}
                    >
                        {/* Pull Tab */}
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4" />

                        <div className="px-6 flex-1 overflow-y-auto no-scrollbar">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col">
                                    <h3 className="text-lg font-bold text-foreground tracking-tight leading-none">
                                        {selectedEnd.name}
                                    </h3>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <Navigation2 className="w-5 h-5 text-primary fill-current" />
                                </div>
                            </div>

                            {pathResult ? (
                                <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t.routeGuide}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(() => {
                                            if (!pathResult || !graph) return (
                                                <span className="text-sm text-foreground/80">{t.followPath}</span>
                                            );

                                            const { nodes, edges } = graph;
                                            const pathSet = new Set(pathResult.path);
                                            const interestingPoints: string[] = [];

                                            // Helper to determine if a node is worth mentioning
                                            const isWorthy = (n: GraphNode) =>
                                                n.type !== 'junction' &&
                                                n.name &&
                                                !n.name.includes("Road Junction");

                                            pathResult.path.forEach((nodeId, index) => {
                                                // Skip start and end nodes
                                                if (index === 0 || index === pathResult.path.length - 1) return;

                                                // Check the node itself
                                                const node = nodes.find(n => n.id === nodeId);
                                                if (node && isWorthy(node)) {
                                                    interestingPoints.push(node.name);
                                                }

                                                // Check neighbors
                                                const connectedEdges = edges.filter(e => e.from === nodeId || e.to === nodeId);
                                                connectedEdges.forEach(edge => {
                                                    const neighborId = edge.from === nodeId ? edge.to : edge.from;
                                                    if (!pathSet.has(neighborId)) {
                                                        const neighbor = nodes.find(n => n.id === neighborId);
                                                        if (neighbor && isWorthy(neighbor)) {
                                                            interestingPoints.push(neighbor.name);
                                                        }
                                                    }
                                                });
                                            });

                                            const uniqueNames = [...new Set(interestingPoints)];

                                            if (uniqueNames.length === 0) return (
                                                <span className="text-sm text-foreground/80">{t.directPath}</span>
                                            );

                                            return uniqueNames.map((name, i) => (
                                                <div key={i} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/5 text-xs font-medium text-foreground/90 whitespace-nowrap">
                                                    {name}
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            ) : selectedEnd.facts && selectedEnd.facts.length > 0 ? (
                                <div className="space-y-4 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{t.funFacts}</p>
                                    <div className="grid gap-3">
                                        {selectedEnd.facts.map((fact, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                                <div className="text-xl">✨</div>
                                                <p className="text-sm text-foreground/80 leading-relaxed">{fact}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-8 text-center text-muted-foreground opacity-40">
                                    <p className="text-sm">{t.noFacts}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function CategoryCard({ icon, label, emoji, onClick }: { icon: React.ReactNode, label: string, emoji: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-3 bg-card/80 backdrop-blur-xl border border-white/10 rounded-2xl whitespace-nowrap hover:bg-card/90 transition-all shadow-lg active:scale-95"
        >
            <span className="text-primary">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs opacity-60">{emoji}</span>
        </button>
    );
}
