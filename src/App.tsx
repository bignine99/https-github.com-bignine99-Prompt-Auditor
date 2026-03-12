import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  ClipboardCheck, 
  Send, 
  Tag, 
  FileText, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Upload, 
  File, 
  X,
  CheckCircle2,
  Info,
  Download,
  Sparkles,
  ArrowRight,
  Check,
  BarChart3
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { evaluatePrompt, type EvaluationResult } from './services/evaluator';

export default function App() {
  const [topic, setTopic] = useState('연구과제 제안서 잘 쓰기');
  const [promptText, setPromptText] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cn = (...inputs: ClassValue[]) => {
    return twMerge(clsx(inputs));
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        setError('PDF 업로드 기능은 현재 점검 중입니다. 텍스트 파일을 이용해 주세요.');
        setFileName(null);
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        setPromptText(text);
      } else {
        setError('지원하지 않는 파일 형식입니다. .txt 또는 .pdf 파일을 업로드해주세요.');
        setFileName(null);
      }
    } catch (err) {
      console.error('File reading error:', err);
      setError('파일을 읽는 중 오류가 발생했습니다.');
      setFileName(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const clearFile = () => {
    setFileName(null);
    setPromptText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !promptText.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    const statuses = [
      '데이터 엔진 초기화 중...',
      '문맥적 정렬 분석 중...',
      '논리적 구조 무결성 검사 중...',
      '페르소나 일관성 측정 중...',
      '제약 조건 정밀 검증 중...',
      '최적화 프롬프트 설계 중...',
      '최종 리포트 생성 중...'
    ];

    let statusIdx = 0;
    const statusInterval = setInterval(() => {
      setLoadingStatus(statuses[statusIdx]);
      statusIdx = (statusIdx + 1) % statuses.length;
    }, 1200);

    try {
      const evaluation = await evaluatePrompt(topic, promptText);
      if (evaluation) {
        setResult(evaluation);
      } else {
        setError("평가 결과를 생성하지 못했습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("평가 중 오류가 발생했습니다. API 키 설정을 확인해주세요.");
    } finally {
      clearInterval(statusInterval);
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const handleReset = () => {
    setTopic('연구과제 제안서 잘 쓰기');
    setPromptText('');
    setResult(null);
    setError(null);
    setFileName(null);
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [copied, setCopied] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);

  const copyImprovedToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.improvedPrompt);
      setCopiedImproved(true);
      setTimeout(() => setCopiedImproved(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation_report_${topic.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const FloatingBackground = () => {
    const items = useMemo(() => Array.from({ length: 12 }).map(() => ({
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      pathX: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
      pathY: [Math.random() * 100, Math.random() * 100, Math.random() * 100],
      duration: 40 + Math.random() * 60,
      size: 0.7 + Math.random() * 0.7,
    })), []);

    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-grid opacity-[0.4]" />
        <div className="absolute inset-0 bg-glow" />
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ 
              left: `${item.initialX}%`, 
              top: `${item.initialY}%`,
              opacity: 0 
            }}
            animate={{ 
              left: item.pathX.map(v => `${v}%`),
              top: item.pathY.map(v => `${v}%`),
              opacity: [0.1, 0.25, 0.1],
              rotate: [0, 20, -20, 0]
            }}
            transition={{ 
              duration: item.duration, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute whitespace-nowrap text-zinc-400 font-bold select-none tracking-tight"
            style={{ fontSize: `${item.size}rem` }}
          >
            Prompt Engineering
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 relative">
      <FloatingBackground />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="nn-cube-wrapper">
              <div className="nn-cube">
                <div className="front">WHO</div>
                <div className="back">WHEN</div>
                <div className="right">WHERE</div>
                <div className="left">WHAT</div>
                <div className="top">HOW</div>
                <div className="bottom">WHY</div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight leading-none">Prompt Auditor</span>
              <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-1">Ninetynine Inc LAB</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 rounded-full border border-zinc-200">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-20 relative z-10">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20"
            >
              {/* Sidebar Info */}
              <div className="lg:col-span-5 space-y-10 bg-zinc-50/50 backdrop-blur-sm p-6 rounded-3xl">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <span className="badge bg-blue-50 text-blue-600 border-blue-100 mb-4 inline-block">Professional Grade</span>
                    <h1 className="font-black leading-[1.1] text-zinc-900 text-left">
                      <span className="block whitespace-nowrap text-[2.15rem] sm:text-[2.9rem] lg:text-[3.6rem] tracking-[-0.05em]">Prove Your Prompt</span>
                      <span className="text-zinc-400 text-xl sm:text-2xl lg:text-3xl block whitespace-nowrap mt-3 tracking-wider">구조로 설계하고, 데이터로 증명하라</span>
                    </h1>
                  </motion.div>
                  <p className="text-lg text-zinc-500 leading-relaxed max-w-md">
                    단순한 텍스트를 넘어, AI가 이해하는 최적의 구조와 논리를 정밀하게 측정하고 개선안을 제시합니다.
                  </p>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Evaluation Framework</h3>
                  <div className="grid gap-4">
                    {[
                      { step: '01', title: 'Contextual Alignment', desc: '목적과 주제에 대한 명확한 맥락 설정 여부' },
                      { step: '02', title: 'Structural Integrity', desc: 'AI가 해석하기 용이한 논리적 구조 분석' },
                      { step: '03', title: 'Technical Precision', desc: '제약 조건 및 출력 형식의 구체성 평가' },
                    ].map((item, idx) => (
                      <motion.div 
                        key={item.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (idx * 0.1) }}
                        className="flex gap-5 p-5 glass-card group hover:border-zinc-300 transition-colors"
                      >
                        <span className="text-zinc-200 font-mono text-2xl font-black group-hover:text-zinc-300 transition-colors">{item.step}</span>
                        <div>
                          <h4 className="font-bold text-sm text-zinc-900">{item.title}</h4>
                          <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Form */}
              <div className="lg:col-span-7">
                <form onSubmit={handleEvaluate} className="glass-card p-6 sm:p-10 space-y-8 bg-white/50 backdrop-blur-sm">
                  <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-500">
                      <Tag className="w-3.5 h-3.5" /> 프롬프트 주제
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="예: 연구과제 제안서 잘 쓰기"
                      className="input-field text-lg font-medium"
                      required
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-zinc-500">
                        <FileText className="w-3.5 h-3.5" /> 프롬프트 내용
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          accept=".txt,.pdf"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-[10px] font-black uppercase tracking-wider text-zinc-400 hover:text-brand flex items-center gap-1.5 transition-colors"
                        >
                          <Upload className="w-3 h-3" /> Upload File
                        </button>
                      </div>
                    </div>

                    {fileName ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200 rounded-2xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg border border-zinc-200 flex items-center justify-center shadow-sm">
                            <File className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold truncate max-w-[200px]">{fileName}</span>
                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Ready for Analysis</span>
                          </div>
                        </div>
                        <button onClick={clearFile} className="p-2 hover:bg-zinc-200 rounded-xl transition-colors">
                          <X className="w-4 h-4 text-zinc-500" />
                        </button>
                      </motion.div>
                    ) : (
                      <div 
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={cn(
                          "relative group transition-all duration-300",
                          isDragging && "scale-[1.01]"
                        )}
                      >
                        <textarea
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          placeholder="평가할 프롬프트를 입력하거나 파일을 업로드하세요..."
                          className={cn(
                            "w-full h-80 input-field font-mono text-sm resize-none leading-relaxed transition-all duration-300",
                            isDragging && "border-brand ring-4 ring-brand/5 bg-brand/[0.02]",
                            isLoading && "opacity-20 select-none pointer-events-none"
                          )}
                          required
                        />
                        
                        {/* Scanning Animation Overlay */}
                        <AnimatePresence>
                          {isLoading && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-2xl overflow-hidden"
                            >
                              <motion.div 
                                initial={{ top: '0%' }}
                                animate={{ top: '100%' }}
                                transition={{ 
                                  duration: 2, 
                                  repeat: Infinity, 
                                  ease: "linear" 
                                }}
                                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent shadow-[0_0_15px_rgba(37,99,235,0.5)] z-30"
                              />
                              <div className="relative z-40 flex flex-col items-center gap-6">
                                <div className="relative">
                                  <div className="w-20 h-20 border-4 border-brand/20 rounded-full animate-spin border-t-brand" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <RefreshCw className="w-8 h-8 text-brand animate-pulse" />
                                  </div>
                                </div>
                                <div className="text-center space-y-2">
                                  <p className="text-lg font-black text-zinc-900 tracking-tight">{loadingStatus}</p>
                                  <div className="flex items-center justify-center gap-1">
                                    <div className="w-1 h-1 bg-brand rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1 h-1 bg-brand rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1 h-1 bg-brand rounded-full animate-bounce" />
                                  </div>
                                </div>
                                <div className="flex flex-col items-center gap-1 opacity-40">
                                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Neural Engine Active</span>
                                  <div className="w-32 h-0.5 bg-zinc-200 rounded-full overflow-hidden">
                                    <motion.div 
                                      animate={{ x: [-128, 128] }}
                                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                      className="w-full h-full bg-brand"
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {!promptText && (
                          <div className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300",
                            isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}>
                            <div className={cn(
                              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500",
                              isDragging ? "bg-brand text-white scale-110 shadow-xl shadow-brand/20" : "bg-zinc-100 text-zinc-400"
                            )}>
                              <Upload className={cn("w-8 h-8", isDragging && "animate-bounce")} />
                            </div>
                            <p className={cn(
                              "text-sm font-bold transition-colors duration-300",
                              isDragging ? "text-brand" : "text-zinc-400"
                            )}>
                              {isDragging ? "여기에 파일을 놓으세요" : "파일을 이쪽으로 끌어다 놓으세요"}
                            </p>
                            <p className="text-[10px] text-zinc-400 mt-2 uppercase tracking-widest font-bold">.txt or .pdf only</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p className="text-sm font-semibold">{error}</p>
                    </motion.div>
                  )}

                  <button type="submit" disabled={isLoading} className="btn-primary w-full py-5 text-lg group">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="font-bold">분석 엔진 가동 중...</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">분석 및 평가 시작</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            /* Results View */
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-emerald-50 text-emerald-600 border-emerald-100">Analysis Complete</span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Report ID: #PA-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">평가 결과 리포트</h2>
                  <p className="text-zinc-500 font-medium">주제: <span className="text-zinc-900">{topic}</span></p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={handleDownload} className="btn-secondary py-2.5 px-5 text-xs font-bold">
                    <Download className="w-4 h-4" /> 다운로드
                  </button>
                  <button onClick={copyToClipboard} className="btn-secondary py-2.5 px-5 text-xs font-bold min-w-[100px]">
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" /> 복사됨
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="w-4 h-4" /> 결과 복사
                      </>
                    )}
                  </button>
                  <button onClick={handleReset} className="btn-primary py-2.5 px-5 text-xs font-bold">
                    <RefreshCw className="w-4 h-4" /> 다시 시작
                  </button>
                </div>
              </div>

              {/* Radar Chart Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-8"
              >
                <div className="md:col-span-5 glass-card p-8 bg-white flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-full h-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                        { subject: '명확성', A: result.scores.clarity, fullMark: 100 },
                        { subject: '맥락', A: result.scores.context, fullMark: 100 },
                        { subject: '제약조건', A: result.scores.constraints, fullMark: 100 },
                        { subject: '페르소나', A: result.scores.persona, fullMark: 100 },
                        { subject: '구조화', A: result.scores.structure, fullMark: 100 },
                      ]}>
                        <PolarGrid stroke="#e4e4e7" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Prompt Score"
                          dataKey="A"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.15}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 text-center">
                    <div className="text-4xl font-black text-zinc-900">
                      {Math.round((result.scores.clarity + result.scores.context + result.scores.constraints + result.scores.persona + result.scores.structure) / 5)}
                      <span className="text-lg text-zinc-400 ml-1">/ 100</span>
                    </div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Overall Quality Score</p>
                  </div>
                </div>

                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: '명확성', score: result.scores.clarity, color: 'bg-blue-500' },
                    { label: '맥락', score: result.scores.context, color: 'bg-indigo-500' },
                    { label: '제약조건', score: result.scores.constraints, color: 'bg-violet-500' },
                    { label: '페르소나', score: result.scores.persona, color: 'bg-purple-500' },
                    { label: '구조화', score: result.scores.structure, color: 'bg-fuchsia-500' },
                  ].map((item) => (
                    <div key={item.label} className="glass-card p-5 bg-white/50">
                      <div className="flex justify-between items-end mb-3">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-400">{item.label}</span>
                        <span className="text-xl font-black text-zinc-900">{item.score}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn("h-full rounded-full", item.color)}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="sm:col-span-2 glass-card p-5 bg-zinc-900 text-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-zinc-300" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">데이터 기반 정밀 진단</h4>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">AI-Powered Multi-Dimensional Evaluation</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Original Prompt */}
                <div className="glass-card p-6 bg-zinc-50/50 border-dashed border-zinc-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Original Prompt
                    </h3>
                    <span className="text-[10px] font-bold text-zinc-400">사용자 입력</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-zinc-200 min-h-[200px] max-h-[300px] overflow-y-auto">
                    <pre className="text-xs text-zinc-600 font-mono whitespace-pre-wrap leading-relaxed">
                      {promptText}
                    </pre>
                  </div>
                </div>

                {/* Improved Prompt */}
                <div className="glass-card p-6 bg-brand/[0.02] border-brand/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-2">
                    <Sparkles className="w-12 h-12 text-brand/5 rotate-12" />
                  </div>
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Optimized Prompt
                    </h3>
                    <button 
                      onClick={copyImprovedToClipboard}
                      className="text-[10px] font-black uppercase tracking-wider text-brand hover:underline flex items-center gap-1"
                    >
                      {copiedImproved ? <Check className="w-3 h-3" /> : <ClipboardCheck className="w-3 h-3" />}
                      {copiedImproved ? 'Copied' : 'Copy Optimized'}
                    </button>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-brand/10 min-h-[200px] max-h-[300px] overflow-y-auto shadow-sm shadow-brand/5 relative z-10">
                    <pre className="text-xs text-zinc-800 font-mono whitespace-pre-wrap leading-relaxed">
                      {result.improvedPrompt}
                    </pre>
                  </div>
                </div>
              </motion.div>

              <div className="glass-card p-6 sm:p-12 relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand" />
                <div className="overflow-x-auto">
                  <div className="prose prose-zinc max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight prose-headings:text-zinc-900
                    prose-p:text-zinc-600 prose-p:leading-relaxed prose-p:text-lg
                    prose-table:w-full prose-table:border-collapse prose-table:my-8
                    prose-th:bg-zinc-50 prose-th:text-zinc-900 prose-th:p-5 prose-th:text-left prose-th:font-black prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:border-b prose-th:border-zinc-200
                    prose-td:p-5 prose-td:border-b prose-td:border-zinc-100 prose-td:text-zinc-600
                    prose-strong:text-zinc-900 prose-strong:font-bold
                    prose-li:text-zinc-600 prose-li:text-lg
                    prose-blockquote:border-l-4 prose-blockquote:border-zinc-200 prose-blockquote:italic prose-blockquote:text-zinc-500">
                    <ReactMarkdown>{result.report}</ReactMarkdown>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-8 sm:p-12 bg-zinc-900 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl shadow-zinc-900/20"
              >
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                    <Sparkles className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Next Steps</span>
                  </div>
                  <h3 className="text-2xl font-bold">분석이 완료되었습니다.</h3>
                  <p className="text-zinc-400 text-base max-w-md">제시된 개선 사항을 반영하여 프롬프트의 품질을 더 높여보세요. 정밀한 튜닝이 더 나은 결과를 만듭니다.</p>
                </div>
                <button onClick={handleReset} className="w-full md:w-auto px-8 py-4 bg-white text-zinc-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl shadow-white/5 active:scale-95">
                  새로운 분석 시작
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-border py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-50">
            <ClipboardCheck className="w-5 h-5" />
            <span className="font-bold text-sm tracking-tight">Prompt Auditor</span>
          </div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-widest">
            &copy; 2026 Ninetynine Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
