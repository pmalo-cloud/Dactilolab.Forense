import React, { useState, useEffect } from 'react';
import { GameState, Question } from './types';
import { generateQuiz } from './services/geminiService';
import { Button } from './components/Button';
import { 
  Fingerprint, 
  ChevronRight, 
  RotateCcw, 
  ShieldCheck,
  Zap,
  Microscope,
  Share2,
  Copy,
  AlertCircle,
  Dna,
  Terminal,
  Activity,
  Award,
  FileText,
  Search,
  UserCheck,
  Info
} from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [topic, setTopic] = useState('Sistema Dactiloscópico Argentino');
  const [grade, setGrade] = useState('Universitario');
  const [quizData, setQuizData] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    let interval: any;
    if (gameState === GameState.LOADING) {
      setScanProgress(0);
      interval = setInterval(() => {
        setScanProgress(prev => (prev >= 100 ? 100 : prev + 5));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const startQuiz = async () => {
    setError(null);
    setGameState(GameState.LOADING);
    
    try {
      const questions = await generateQuiz(topic, grade);
      setQuizData(questions);
      setGameState(GameState.PLAYING);
      setCurrentQuestionIndex(0);
      setScore(0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error inesperado de red.");
      setGameState(GameState.SETUP);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowExplanation(true);
    if (index === quizData[currentQuestionIndex].correctIndex) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState(GameState.RESULTS);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#020617] text-slate-200">
      <div className="scanline"></div>

      <div className="max-w-2xl w-full bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md relative">
        
        {gameState === GameState.SETUP && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center">
              <Fingerprint className="w-20 h-20 text-cyan-400 mx-auto animate-pulse" />
              <h1 className="text-4xl font-black text-white mt-4 font-mono italic">DACTILOLAB</h1>
              <p className="text-cyan-500/50 text-[10px] tracking-[0.4em] uppercase">Módulo Forense</p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] text-cyan-500 font-bold block mb-2 uppercase">Tema</label>
                <select 
                  className="w-full bg-transparent text-white outline-none font-bold"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="Sistema Dactiloscópico Argentino">Sistema Vucetich</option>
                  <option value="Puntos Característicos Avanzados">Puntos Característicos</option>
                </select>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] text-cyan-500 font-bold block mb-2 uppercase">Nivel</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Cadete', 'Perito'].map(l => (
                    <button 
                      key={l}
                      onClick={() => setGrade(l)}
                      className={`py-2 text-[10px] font-bold border rounded ${grade === l ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800'}`}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={startQuiz} fullWidth className="h-16 text-lg">
              INICIAR EXAMEN <Zap className="w-5 h-5 fill-current" />
            </Button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase">
                  <AlertCircle className="w-4 h-4" /> Error Técnico Detectado
                </div>
                <p className="text-red-300 text-[11px] font-mono bg-slate-950 p-2 rounded">{error}</p>
                <p className="text-slate-500 text-[9px] leading-tight">
                  TIP: Si dice "API_KEY_MISSING", asegúrate de que en Vercel la variable se llame exactamente <span className="text-white">API_KEY</span> y hayas guardado los cambios.
                </p>
              </div>
            )}
          </div>
        )}

        {gameState === GameState.LOADING && (
          <div className="py-20 text-center space-y-6">
            <Activity className="w-16 h-16 text-cyan-500 mx-auto animate-spin" />
            <div className="text-cyan-400 font-mono text-sm animate-pulse uppercase tracking-widest">Consultando Archivos Vucetich...</div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-cyan-500 h-full transition-all duration-300" style={{width: `${scanProgress}%`}}></div>
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && quizData.length > 0 && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between text-[10px] font-bold text-cyan-500 uppercase tracking-widest">
              <span>Analizando Evidencia</span>
              <span>{currentQuestionIndex + 1} / {quizData.length}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border-l-4 border-cyan-500">
              <h2 className="text-xl font-bold text-white">{quizData[currentQuestionIndex].question}</h2>
            </div>
            <div className="grid gap-3">
              {quizData[currentQuestionIndex].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={selectedOption !== null}
                  onClick={() => handleOptionSelect(i)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedOption === null ? 'border-slate-800 bg-slate-950/50 hover:border-cyan-500' :
                    i === quizData[currentQuestionIndex].correctIndex ? 'border-green-500 bg-green-500/10 text-green-400' :
                    i === selectedOption ? 'border-red-500 bg-red-500/10 text-red-400' : 'opacity-40 border-slate-900'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {showExplanation && (
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl animate-in fade-in">
                <p className="text-slate-400 text-xs italic">"{quizData[currentQuestionIndex].explanation}"</p>
                <div className="flex justify-end mt-4">
                  <Button onClick={nextQuestion}>Continuar <ChevronRight className="w-4 h-4" /></Button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === GameState.RESULTS && (
          <div className="text-center space-y-6 py-10 animate-in zoom-in">
            <Award className="w-20 h-20 text-cyan-400 mx-auto" />
            <h2 className="text-3xl font-black text-white uppercase italic">Informe Finalizado</h2>
            <div className="text-5xl font-black text-cyan-500">{score} / {quizData.length}</div>
            <Button onClick={() => setGameState(GameState.SETUP)} variant="secondary" fullWidth className="h-14">
              Nuevo Peritaje <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
