import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Activity, 
  Map as MapIcon, 
  LineChart, 
  BarChart2, 
  ChevronLeft, 
  Send, 
  ShieldAlert,
  Sparkles,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  // Smooth scroll to specific sections
  const scrollToSection = (id) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Connect to Python Backend
  const handleAnalyze = async () => {
    // FIX 1: Changed basePrompt to prompt
    if (!prompt.trim()) return; 
    setIsAnalyzing(true);
    
    try {
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // FIX 2: Changed basePrompt to prompt
        body: JSON.stringify({ prompt: prompt }), 
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Success! Backend Data:", data);

      // FIX 3: Mapped keys exactly to what the HTML expects (score, status, summary)
      setResults({
        score: Math.round(data.metrics.final_score * 100), 
        status: data.metrics.final_interpretation || "Analyzed",
        summary: `Analysis complete. Overall stability is ${data.metrics.final_interpretation}. Graph score: ${data.metrics.graph_score}. Hallucination assessment: ${data.metrics.hallucination_interpretation}.`,
        matrixData: data.visualization_data.similarity_matrix 
      });

    } catch (error) {
      console.error("Failed to fetch:", error);
      // Fallback UI
      setResults({
        score: 0,
        status: "Error",
        summary: "Connection failed. Please ensure your FastAPI server is running on port 8000 and CORS is enabled."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setPrompt(''); // FIX 4: Changed setBasePrompt to setPrompt
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/10 bg-[#020617]/80 backdrop-blur-xl flex flex-col z-20">
        <div className="p-6 border-b border-white/10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Aegis</h1>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <p className="px-4 text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 mt-2">Navigation</p>
          
          <SidebarLink 
            icon={<LayoutDashboard />} label="Summary & Score" 
            isActive={activeTab === 'summary'} onClick={() => scrollToSection('summary')} 
          />
          <SidebarLink 
            icon={<Activity />} label="Similarity Heatmap" 
            isActive={activeTab === 'heatmap'} onClick={() => scrollToSection('heatmap')} 
          />
          <SidebarLink 
            icon={<MapIcon />} label="Stability Map" 
            isActive={activeTab === 'stability-map'} onClick={() => scrollToSection('stability-map')} 
          />
          <SidebarLink 
            icon={<LineChart />} label="Sensitivity Curve" 
            isActive={activeTab === 'sensitivity'} onClick={() => scrollToSection('sensitivity')} 
          />
          <SidebarLink 
            icon={<BarChart2 />} label="Stability Landscape" 
            isActive={activeTab === 'landscape'} onClick={() => scrollToSection('landscape')} 
          />
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        {/* Background Glows */}
        <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto p-8 lg:p-12 space-y-24">
          
          {/* SECTION 1: Prompt Input & Summary */}
          <section id="summary" className="space-y-8 pt-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Prompt Analysis</h2>
              <p className="text-slate-400">Enter your baseline prompt below to stress-test its logic and stability.</p>
            </div>

            {/* Input Box */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-md shadow-xl">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Explain the theory of relativity as if I were a 5-year-old..."
                className="w-full h-32 bg-transparent text-white placeholder-slate-500 p-4 focus:outline-none resize-none"
              />
              <div className="flex justify-between items-center p-2 border-t border-white/10 mt-2">
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs border border-purple-500/20">Semantic Tiers: 3</span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs border border-cyan-500/20">Emotions: 5</span>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !prompt.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Prompt'}
                </button>
              </div>
            </div>

            {/* Results Area (Shows after analysis) */}
            {results && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} 
                className="grid md:grid-cols-3 gap-6 pt-4"
              >
                {/* Score Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-center items-center text-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <p className="text-slate-400 font-medium mb-2">Overall Stability Score</p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{results.score}</span>
                    <span className="text-xl text-slate-500">/100</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
                    <Sparkles className="w-4 h-4" /> {results.status}
                  </div>
                </div>

                {/* Detailed Summary Card */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" /> Detailed Summary
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    {results.summary}
                  </p>
                </div>
              </motion.div>
            )}
          </section>

          {/* SECTION 2: Similarity Heatmap */}
          <section id="heatmap" className="scroll-mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <Activity className="text-cyan-400" /> Similarity Heatmap
              </h2>
              <p className="text-slate-400">Visualizes the cosine similarity between the baseline prompt and perturbed outputs.</p>
            </div>
            <GraphPlaceholder title="Heatmap Rendering Engine Pending" />
          </section>

          {/* SECTION 3: Stability Map */}
          <section id="stability-map" className="scroll-mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <MapIcon className="text-purple-400" /> Stability Map
              </h2>
              <p className="text-slate-400">Maps structural logical degradation across Small, Moderate, and Huge semantic shifts.</p>
            </div>
            <GraphPlaceholder title="Stability Map Rendering Engine Pending" />
          </section>

          {/* SECTION 4: Sensitivity Curve */}
          <section id="sensitivity" className="scroll-mt-12 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <LineChart className="text-blue-400" /> Sensitivity Curve
              </h2>
              <p className="text-slate-400">Tracks how rapidly the LLM hallucinates as emotional framing intensity increases.</p>
            </div>
            <GraphPlaceholder title="Curve Rendering Engine Pending" />
          </section>

          {/* SECTION 5: Stability Landscape */}
          <section id="landscape" className="scroll-mt-12 space-y-6 pb-24">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                <BarChart2 className="text-emerald-400" /> Stability Landscape
              </h2>
              <p className="text-slate-400">A 3D representation of prompt robustness combining semantic and emotional vectors.</p>
            </div>
            <GraphPlaceholder title="3D Landscape Engine Pending" />
          </section>

        </div>
      </main>
    </div>
  );
};

// Helper component for Sidebar Links
const SidebarLink = ({ icon, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-left ${
      isActive 
        ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20' 
        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    {label}
  </button>
);

// Helper component for Graph Placeholders
const GraphPlaceholder = ({ title }) => (
  <div className="w-full h-[400px] bg-[#0f172a]/50 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-slate-500 relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:20px_20px]" />
    <Activity className="w-12 h-12 mb-4 opacity-20" />
    <p className="font-mono text-sm relative z-10">{title}</p>
    <p className="text-xs mt-2 opacity-50 relative z-10">Awaiting Python Integration</p>
  </div>
);

export default Dashboard;