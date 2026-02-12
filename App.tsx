import React, { useState } from 'react';
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
  AlertCircle
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
  const [retrying, setRetrying] = useState(false);

  const startQuiz = async (retryCount = 0) => {
    setError(null);
    setGameState(GameState.LOADING);
    setRetrying(retryCount > 0);
    
    try {
      const questions = await generateQuiz(topic, grade);
      if (!questions || questions.length === 0) throw new Error("Datos vacíos");
      
      setQuizData(questions);
      setGameState(GameState.PLAYING);
      setCurrentQuestionIndex(0);
      setScore(0);
      setRetrying(false);
    } catch (err: any) {
      if (retryCount < 2) {
        setTimeout(() => startQuiz(retryCount + 1), 2000);
      } else {
        setError("El servidor forense está saturado. Por favor, espera 10 segundos e intenta de nuevo.");
        setGameState(GameState.SETUP);
        setRetrying(false);
      }
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

  const shareResults = () => {
    const text = `🕵️‍♂️ DactiloLab Informe Forense\nTema: ${topic}\nNivel: ${grade}\nPuntuación: ${score}/${quizData.length} (${Math.round((score/quizData.length)*100)}%)\n¡Desafío Vucetich completado!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Informe Forense DactiloLab',
        text: text,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#020617]">
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-10 left-10 border border-cyan-500 w-32 h-32 rounded-lg"></div>
        <div className="absolute bottom-10 right-10 border border-cyan-500 w-48 h-48 rounded-full"></div>
        <div className="scanline"></div>
      </div>

      <div className="max-w-3xl w-full bg-[#0f172a] border border-cyan-900/50 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 md:p-10 relative overflow-hidden">
        
        {gameState === GameState.SETUP && (
          <div className="space-y-8 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-cyan-500/10 p-5 rounded-full border border-cyan-500/30 mb-4 animate-pulse">
                <Fingerprint className="w-16 h-16 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-black text-cyan-500 font-mono tracking-tighter">DACTILOLAB v2.5</h1>
              <p className="text-cyan-400/60 font-mono text-sm mt-2 uppercase">SISTEMA DE ENTRENAMIENTO FORENSE - UNIDAD VUCETICH</p>
            </div>

            <div className="space-y-4 text-left font-mono">
              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <label className="block text-xs font-bold text-cyan-500 mb-2 uppercase tracking-widest">Módulo de Estudio</label>
                <select 
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-100 p-3 rounded focus:outline-none focus:border-cyan-500"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                >
                  <option value="Sistema Dactiloscópico Argentino">Sistema Dactiloscópico Argentino (Vucetich)</option>
                  <option value="Puntos Característicos">Identificación de Puntos Característicos</option>
                  <option value="Conteo de Líneas y Topografía">Conteo de Líneas y Topografía del Dactilograma</option>
                  <option value="Clasificación Decadactilar">Fichaje y Clasificación Decadactilar</option>
                </select>
              </div>

              <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                <label className="block text-xs font-bold text-cyan-500 mb-2 uppercase tracking-widest">Rango del Perito</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Principiante', 'Universitario', 'Perito', 'Maestro'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setGrade(lvl)}
                      className={`p-2 border text-xs font-bold uppercase transition-all ${
                        grade === lvl 
                          ? 'border-cyan-500 bg-cyan-500/20 text-cyan-300' 
                          : 'border-slate-800 text-slate-500 hover:border-slate-600'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <Button onClick={() => startQuiz(0)} fullWidth className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 py-4 font-mono">
              INICIAR PROTOCOLO <Zap className="w-5 h-5 fill-current" />
            </Button>
            
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-[10px] font-mono bg-red-500/10 p-2 rounded border border-red-900/50">
                <AlertCircle className="w-3 h-3" /> {error}
              </div>
            )}
          </div>
        )}

        {gameState === GameState.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
              {retrying && <Zap className="absolute inset-0 m-auto w-6 h-6 text-yellow-500 animate-bounce" />}
            </div>
            <div className="text-center">
              <div className="font-mono text-cyan-500 animate-pulse text-sm">
                {retrying ? 'REINTENTANDO CONEXIÓN POR SATURACIÓN...' : 'PROCESANDO BASE DE DATOS CRIMINALÍSTICA...'}
              </div>
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && quizData.length > 0 && (
          <div className="space-y-6 font-mono">
            <div className="flex justify-between items-end border-b border-cyan-900/50 pb-4">
              <div>
                <div className="text-[10px] text-cyan-500 uppercase tracking-widest">Caso Actual</div>
                <div className="text-sm font-bold text-cyan-100">{topic}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-cyan-500 uppercase">Progreso</div>
                <div className="text-xl font-black text-cyan-400">{currentQuestionIndex + 1} / {quizData.length}</div>
              </div>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-lg border border-slate-800 min-h-[100px] flex items-center">
              <h2 className="text-lg font-bold text-slate-100 leading-tight">
                <span className="text-cyan-500 mr-2">&gt;</span>
                {quizData[currentQuestionIndex].question}
              </h2>
            </div>

            <div className="grid gap-3">
              {quizData[currentQuestionIndex].options.map((option, idx) => {
                let btnClass = "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-cyan-700 hover:text-cyan-100";
                if (selectedOption !== null) {
                  if (idx === quizData[currentQuestionIndex].correctIndex) btnClass = "border-green-500 bg-green-500/10 text-green-400";
                  else if (idx === selectedOption) btnClass = "border-red-500 bg-red-500/10 text-red-400";
                  else btnClass = "border-slate-900 text-slate-600 opacity-50";
                }

                return (
                  <button
                    key={idx}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-4 rounded border transition-all text-sm flex items-center gap-3 ${btnClass}`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center border border-current rounded-sm text-[10px]">{String.fromCharCode(65 + idx)}</div>
                    {option}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="mt-4 p-4 bg-cyan-950/20 border border-cyan-900 rounded animate-in fade-in duration-500">
                <div className="flex items-center gap-2 mb-2 text-cyan-400 text-xs font-bold uppercase">
                  <Microscope className="w-4 h-4" /> Observación Técnica
                </div>
                <p className="text-cyan-100/80 text-xs leading-relaxed">
                  {quizData[currentQuestionIndex].explanation}
                </p>
                <div className="flex justify-end mt-4">
                  <Button onClick={nextQuestion} className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 py-2 px-4 text-xs">
                    CONTINUAR <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === GameState.RESULTS && (
          <div className="text-center space-y-8 py-4 font-mono">
            <div className="bg-cyan-500/10 p-8 rounded-full inline-block border border-cyan-500/30">
              <ShieldCheck className="w-20 h-20 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-3xl font-black text-cyan-500 uppercase italic">Informe Final</h2>
              <p className="text-slate-500 text-xs mt-2">Protocolo de Identificación de Identidad Humana Completo</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded">
                <div className="text-[10px] text-cyan-500 uppercase mb-1">Aciertos</div>
                <div className="text-4xl font-black text-white">{score}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-6 rounded">
                <div className="text-[10px] text-cyan-500 uppercase mb-1">Calificación</div>
                <div className="text-4xl font-black text-cyan-400">{quizData.length > 0 ? Math.round((score/quizData.length)*100) : 0}%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button onClick={() => setGameState(GameState.SETUP)} variant="secondary" fullWidth className="border-slate-700 text-slate-300">
                <RotateCcw className="w-4 h-4" /> REINICIAR
              </Button>
              <Button onClick={shareResults} variant="primary" fullWidth className="bg-cyan-600 text-slate-950">
                {copied ? 'COPIADO' : 'COMPARTIR'} {copied ? <Copy className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

      </div>

      <div className="mt-6 flex items-center gap-4 text-[10px] text-cyan-900 font-mono font-bold uppercase tracking-[0.2em]">
        <span>IDENTIFICACIÓN HUMANA</span>
        <span className="w-1 h-1 bg-cyan-900 rounded-full"></span>
        <span>SISTEMA VUCETICH</span>
      </div>
    </div>
  );
};

export default App;
