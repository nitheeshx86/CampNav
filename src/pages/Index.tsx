import React, { useState, useCallback, useMemo } from 'react';
import { MapViewer } from '@/components/MapViewer';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useGraph } from '@/hooks/useGraph';
import { findShortestPath, PathResult, GraphNode } from '@/lib/pathfinding';
import { AlertCircle, Linkedin, Mail, Github, X } from 'lucide-react';

const Index = () => {
  const { graph, locations, loading, error } = useGraph();
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const [selectedStart, setSelectedStart] = useState<GraphNode | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<GraphNode | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ta' | 'fr' | 'cpf' | 'hi' | 'de' | 'es'>('en');

  const aboutTranslations = {
    en: {
      role: "Developer & Creator",
      p1: "Hi, I’m Nitheesh. Building this Campus Navigator app was a lot of fun. If you’d like to know more about how it works, check out the GitHub link below for the full source code—I believe strongly in open-source learning.",
      p2: "I’m interested in quantum computing, enjoy hackathons with my team, and love working on ideas across different domains. If you have any engineering or fun ideas to collaborate on, feel free to reach out via the email button below.",
      p3: "Thanks to Dr. Reena Ma'am, Assistant Director - International Relations at VIT Chennai, for this wonderful opportunity.",
      attribution: "Nitheesh, Know More"
    },
    ta: {
      role: "உருவாக்குநர்",
      p1: "வணக்கம், நான் நித்திஷ். இந்த கேம்பஸ் நேவிகேட்டர் செயலியை உருவாக்குவது மிகவும் சுவாரஸ்யமாக இருந்தது. இது எப்படி வேலை செய்கிறது என்பதைப் பற்றி மேலும் அறிய விரும்பினால், கீழே உள்ள GitHub இணைப்பைப் பாருங்கள் - நான் திறந்த மூலக் கற்றலை (open-source learning) ஆழமாக நம்புகிறேன்.",
      p2: "எனக்கு குவாண்டம் கம்ப்யூட்டிங்கில் ஆர்வம் உள்ளது, எனது குழுவுடன் ஹேக்கத்தான்களில் பங்கேற்பது பிடிக்கும். உங்களிடம் ஏதேனும் பொறியியல் அல்லது சுவாரஸ்யமான யோசனைகள் இருந்தால், கீழே உள்ள மின்னஞ்சல் பொத்தான் மூலம் என்னைத் தொடர்பு கொள்ளலாம்.",
      p3: "இந்த அற்புதமான வாய்ப்பை வழங்கிய விஐடி சென்னையின் சர்வதேச உறவுகள் உதவி இயக்குனர் டாக்டர் ரீனா மேம் அவர்களுக்கு நன்றி.",
      attribution: "நித்திஷ், மேலும் அறிய"
    },
    hi: {
      role: "डेवलपर और निर्माता",
      p1: "नमस्ते, मैं नितीश हूँ। इस कैंपस नेविगेटर ऐप को बनाना बहुत मजेदार था। यदि आप यह जानना चाहते हैं कि यह कैसे काम करता है, तो पूर्ण सोर्स कोड के लिए नीचे दिए गए गिटहब लिंक को देखें—मैं ओपन-सोर्स लर्निंग में दृढ़ता से विश्वास करता हूँ।",
      p2: "मुझे क्वांटम कंप्यूटिंग में रुचि है, अपनी टीम के साथ हैकथॉन का आनंद लेता हूँ, और विभिन्न डोमेन में विचारों पर काम करना पसंद करता हूँ। यदि आपके पास सहयोग करने के लिए कोई इंजीनियरिंग या मजेदार विचार हैं, तो बेझिझक नीचे दिए गए ईमेल बटन के माध्यम से संपर्क करें।",
      p3: "इस अद्भुत अवसर के लिए वीआईटी चेन्नई के अंतर्राष्ट्रीय संबंध सहायक निदेशक डॉ. रीना मैम का धन्यवाद।",
      attribution: "नितीश, और जानें"
    },
    fr: {
      role: "Développeur & Créateur",
      p1: "Salut, je suis Nitheesh. Construire cette application a été très amusant. Si vous souhaitez en savoir plus sur son fonctionnement, consultez le lien GitHub ci-dessous pour le code source complet — je crois fermement à l'apprentissage open source.",
      p2: "Je m'intéresse à l'informatique quantique, j'aime les hackathons avec mon équipe et j'adore travailler sur des idées dans différents domaines. Si vous avez des idées d'ingénierie ou amusantes pour collaborer, n'hésitez pas à me contacter via le bouton e-mail ci-dessous.",
      p3: "Merci au Dr Reena Ma'am, directrice adjointe des relations internationales au VIT Chennai, pour cette merveilleuse opportunité.",
      attribution: "Nitheesh, En savoir plus"
    },
    de: {
      role: "Entwickler & Schöpfer",
      p1: "Hallo, ich bin Nitheesh. Es hat viel Spaß gemacht, diese App zu entwickeln. Wenn Sie mehr darüber erfahren möchten, wie sie funktioniert, schauen Sie sich den GitHub-Link unten für den vollständigen Quellcode an – ich glaube fest an Open-Source-Lernen.",
      p2: "Ich interessiere mich für Quantencomputing, genieße Hackathons mit meinem Team und liebe es, an Ideen in verschiedenen Bereichen zu arbeiten. Wenn Sie technische oder unterhaltsame Ideen für eine Zusammenarbeit haben, können Sie mich gerne über den E-Mail-Button unten kontaktieren.",
      p3: "Vielen Dank an Dr. Reena Ma'am, stellvertretende Direktorin für internationale Beziehungen am VIT Chennai, für diese wunderbare Gelegenheit.",
      attribution: "Nitheesh, Mehr erfahren"
    },
    es: {
      role: "Desarrollador y Creador",
      p1: "Hola, soy Nitheesh. Crear esta aplicación fue muy divertido. Si deseas saber más sobre cómo funciona, consulta el enlace de GitHub a continuación para ver el código fuente completo; creo firmemente en el aprendizaje de código abierto.",
      p2: "Me interesa la computación cuántica, disfruto de los hackathons con mi equipo y me encanta trabajar en ideas de diferentes dominios. Si tienes alguna idea de ingeniería o divertida para colaborar, no dudes en contactarme a través del botón de correo electrónico a continuación.",
      p3: "Gracias a la Dra. Reena Ma'am, Subdirectora de Relaciones Internacionales de VIT Chennai, por esta maravillosa oportunidad.",
      attribution: "Nitheesh, Saber más"
    },
    cpf: {
      role: "Developèr & Kreater",
      p1: "Mo apel Nitheesh. Fer sa aplikasion Campus Navigator la ti bien serye. Si ou anvi koner kuma li marse, get lien GitHub anba pou so kod - mo krwar dan partaz konensans.",
      p2: "Mo kontan konputing kwantik, bann hackathon avek mo lekip, ek travay lor bann lide dan diferan domenn. Si ou ena bann lide interesan pou colaboré, ou kapav kontak mwa lor email anba.",
      p3: "Mersi Dr. Reena Ma'am, Asistan Direkter - Relasion Internasional VIT Chennai, pou sa bel loportunite la.",
      attribution: "Nitheesh, Konn plis"
    }
  };

  const tAbout = aboutTranslations[language];

  const handleNavigate = useCallback((startId: string, endId: string) => {
    if (!graph) return;

    setIsCalculating(true);
    setNavigationError(null);

    // Small delay for UI feedback
    setTimeout(() => {
      const startNode = graph.nodes.find(n => n.id === startId);
      const endNode = graph.nodes.find(n => n.id === endId);

      if (!startNode || !endNode) return;

      // Fun alerts for "weird" navigation
      if (startId === endId) {
        setNavigationError(`Bruh, you're already at ${startNode.name}`);
        setIsCalculating(false);
        return;
      }

      // Check if they are in the same block
      const isStartInBlock = startNode.blockId === endId;
      const isEndInBlock = endNode.blockId === startId;
      const areInSameBlock = startNode.blockId && endNode.blockId && startNode.blockId === endNode.blockId;

      if (isStartInBlock || isEndInBlock || areInSameBlock) {
        const floorInfo = endNode.floor ? `just in the ${endNode.floor}` : "it's just on a different floor";
        setNavigationError(`Hey, it's in the same building that you're in, ${floorInfo}`);
        setIsCalculating(false);

        // Still select the nodes so they show up on map/facts but don't show a path
        setPathResult(null);
        setSelectedStart(startNode);
        setSelectedEnd(endNode);
        return;
      }

      const result = findShortestPath(graph, startId, endId);

      if (result) {
        setPathResult(result);
        setSelectedStart(startNode);
        setSelectedEnd(endNode);
      } else {
        setNavigationError('No path found between these locations');
      }

      setIsCalculating(false);
    }, 300);
  }, [graph]);

  const handleReset = useCallback(() => {
    setPathResult(null);
    setNavigationError(null);
    setSelectedStart(null);
    setSelectedEnd(null);
  }, []);

  const allNodes = useMemo(() => graph?.nodes || [], [graph]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-lg text-muted-foreground">Loading campus data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="glass-panel p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen bg-background overflow-hidden relative">
      {/* Full-screen Map */}
      <MapViewer
        pathResult={pathResult}
        startNode={selectedStart}
        endNode={selectedEnd}
        nodes={allNodes}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Mobile Navigation UI */}
      <MobileNavigation
        locations={locations}
        onNavigate={handleNavigate}
        onReset={handleReset}
        isCalculating={isCalculating}
        selectedStart={selectedStart}
        selectedEnd={selectedEnd}
        onSearchOpenChange={setIsSearchOpen}
        pathResult={pathResult}
        graph={graph}
        language={language}
      />

      {/* Permanent Attribution */}
      <div className={`fixed bottom-6 left-6 z-[100] pointer-events-auto transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button
          onClick={() => setIsAboutOpen(true)}
          className="glass-panel px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all group"
        >
          <p className="text-[10px] font-bold text-muted-foreground leading-none group-hover:text-primary transition-colors flex items-center gap-2">
            <span className="text-base">👨‍💻</span> {tAbout.attribution}
          </p>
        </button>
      </div>

      {/* About Me Popup */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-[#1E1E1E]/90 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsAboutOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Profile Content */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#1E1E1E] flex items-center justify-center overflow-hidden">
                  <div className="text-4xl">👨‍💻</div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">Nitheesh Karthikeyan (24BEC1459)</h2>
                <p className="text-primary font-medium">{tAbout.role}</p>
              </div>

              <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>{tAbout.p1}</p>
                <p>{tAbout.p2}</p>
                <p>{tAbout.p3}</p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <a
                  href="mailto:nitheesh.k2024@vitstudent.ac.in"
                  className="p-4 bg-white/5 hover:bg-white/10 hover:scale-110 border border-white/5 rounded-2xl transition-all group"
                  title="Email Me"
                >
                  <Mail className="w-6 h-6 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="https://linkedin.com/in/nitheeshx86"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-[#0077b5]/10 hover:bg-[#0077b5]/20 hover:scale-110 border border-[#0077b5]/20 rounded-2xl transition-all group"
                  title="LinkedIn"
                >
                  <Linkedin className="w-6 h-6 text-[#0077b5] group-hover:text-[#00a0dc]" />
                </a>
                <a
                  href="https://github.com/nitheeshx86"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-white/5 hover:bg-white/10 hover:scale-110 border border-white/5 rounded-2xl transition-all group"
                  title="GitHub"
                >
                  <Github className="w-6 h-6 text-gray-300 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Backdrop click to close */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsAboutOpen(false)} />
        </div>
      )}

      {/* Error Toast */}
      {navigationError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-[calc(100%-2rem)] max-w-sm">
          <div className="glass-panel px-4 py-3 flex items-center gap-3 border-destructive/50 bg-destructive/10">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-foreground flex-1">{navigationError}</p>
            <button
              onClick={() => setNavigationError(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
