import React, { useState, useEffect } from 'react';
import { GameState, Question } from './types';
import { generateQuiz } from './geminiService';
import { Button } from './Button';
import { Fingerprint, ChevronRight, RotateCcw, Zap, Activity, Award } from 'lucide-react';

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
      setError(err.message);
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#020617] text-slate-200 font-sans">
      <div className="scanline"></div>
      <div className="max-w-2xl w-full bg-slate-900/90 border border-cyan-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md">
        {gameState === GameState.SETUP && (
          <div className="text-center space-y-8">
            <Fingerprint className="w-20 h-20 text-cyan-400 mx-auto animate-pulse" />
            <h1 className="text-4xl font-black text-white italic tracking-tighter">DACTILOLAB</h1>
            <p className="text-slate-400 text-sm uppercase tracking-widest font-mono">Simulador Forense V1.0</p>
            
            <div className="space-y-4 text-left">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <label className="text-[10px] text-cyan-500 font-bold block mb-2 uppercase tracking-widest">Módulo de Estudio</label>
                <select className="w-full bg-transparent text-white outline-none font-bold cursor-pointer" value={topic} onChange={(e) => setTopic(e.target.value)}>
                  <option value="Sistema Dactiloscópico Argentino">Sistema Vucetich (Básico)</option>
                  <option value="Puntos Característicos Avanzados">Puntos Característicos</option>
                  <option value="Anomalías Dactiloscópicas">Anomalías y Deformaciones</option>
                </select>
              </div>
            </div>

            <Button onClick={startQuiz} fullWidth className="h-16 text-lg shadow-[0_0_20px_rgba(8,145,178,0.3)]">
              INICIAR PERITAJE <Zap className="w-5 h-5 fill-current" />
            </Button>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl text-red-400 text-sm font-mono">
                <p className="font-bold mb-1">ALERTA DE SISTEMA:</p>
                {error}
              </div>
            )}
          </div>
        )}

        {gameState === GameState.LOADING && (
          <div className="py-20 text-center space-y-6">
            <Activity className="w-16 h-16 text-cyan-500 mx-auto animate-spin" />
            <p className="text-cyan-400 font-mono text-sm tracking-widest animate-pulse">CARGANDO ARCHIVOS FORENSES... {scanProgress}%</p>
            <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-slate-800">
              <div className="bg-cyan-500 h-full transition-all duration-300" style={{width: `${scanProgress}%`}}></div>
            </div>
          </div>
        )}

        {gameState === GameState.PLAYING && quizData.length > 0 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center text-[10px] text-cyan-500 font-bold uppercase tracking-tighter">
              <span className="bg-cyan-500/10 px-2 py-1 rounded">EVIDENCIA #{currentQuestionIndex + 1}</span>
              <span className="text-slate-500">PUNTUACIÓN: {score}</span>
            </div>
            <h2 className="text-xl font-bold text-white bg-slate-950/50 p-6 rounded-2xl border-l-4 border-cyan-500 leading-relaxed font-mono">
              {quizData[currentQuestionIndex].question}
            </h2>
            <div className="grid gap-3">
              {quizData[currentQuestionIndex].options.map((opt, i) => (
                <button 
                  key={i} 
                  disabled={selectedOption !== null} 
                  onClick={() => handleOptionSelect(i)}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 group flex justify-between items-center ${
                    selectedOption === null 
                      ? 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/50' 
                      : i === quizData[currentQuestionIndex].correctIndex 
                        ? 'border-green-500 bg-green-500/10 text-green-400' 
                        : i === selectedOption 
                          ? 'border-red-500 bg-red-500/10 text-red-400' 
                          : 'opacity-30 border-slate-900'
                  }`}
                >
                  <span className="font-medium">{opt}</span>
                  {selectedOption !== null && i === quizData[currentQuestionIndex].correctIndex && <Award className="w-5 h-5" />}
                </button>
              ))}
            </div>
            {showExplanation && (
              <div className="bg-cyan-500/5 p-5 rounded-xl border border-cyan-500/20 animate-in slide-in-from-bottom-2">
                <p className="text-slate-300 text-sm leading-relaxed"><span className="text-cyan-400 font-bold underline font-mono">DICTAMEN:</span> {quizData[currentQuestionIndex].explanation}</p>
                <Button onClick={nextQuestion} className="mt-4 ml-auto">SIGUIENTE CASO <ChevronRight className="w-4 h-4" /></Button>
              </div>
            )}
          </div>
        )}

        {gameState === GameState.RESULTS && (
          <div className="text-center space-y-8 py-10 animate-in zoom-in duration-300">
            <Award className="w-24 h-24 text-cyan-400 mx-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
            <h2 className="text-3xl font-black text-white tracking-tight">PERITAJE FINALIZADO</h2>
            <div className="text-6xl font-black text-cyan-500 font-mono">
              {score}<span className="text-slate-700 text-3xl">/</span>{quizData.length}
            </div>
            <p className="text-slate-400 italic text-sm">
              {score === quizData.length ? "Excelente. Aptitud profesional demostrada." : "Nivel insuficiente. Se requiere mayor estudio del Sistema Vucetich."}
            </p>
            <Button onClick={() => setGameState(GameState.SETUP)} variant="secondary" fullWidth className="h-14">
              REINICIAR SIMULACIÓN <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
