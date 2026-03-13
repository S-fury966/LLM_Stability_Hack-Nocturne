import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  BrainCircuit, 
  AlertTriangle, 
  Sparkles, 
  Activity,
  ArrowLeft,
  RefreshCw,
  BarChart3,
  Map
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [basePrompt, setBasePrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleAnalyze = async () => {
    if (!basePrompt) return;
    setIsAnalyzing(true);
    
    try {
      // 1. Send the POST request to your FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // We wrap the basePrompt in a JSON object that matches your Pydantic model
        body: JSON.stringify({ prompt: basePrompt }), 
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      // 2. Parse the JSON response from Python
      const data = await response.json();
      console.log("Success! Backend Data:", data);

      // 3. Update the UI state using the real metrics from your backend
      // Note: We multiply by 100 if your python backend returns a decimal like 0.62
      setResults({
        stabilityScore: Math.round(data.metrics.final_score * 100), 
        
        // Custom logic to flag vulnerabilities based on your python hallucination risk
        vulnerabilities: data.metrics.hallucination_risk > 0.4 ? 3 : 0, 
        
        summary: `Analysis complete. Overall stability is ${data.metrics.final_interpretation}. Graph score: ${data.metrics.graph_score}. Hallucination assessment: ${data.metrics.hallucination_interpretation}.`,
        
        // We'll save the matrix data here so you can use it for the heatmap later
        matrixData: data.visualization_data.similarity_matrix 
      });

    } catch (error) {
      console.error("Failed to fetch:", error);
      // Fallback UI if the backend is off or crashes
      setResults({
        stabilityScore: 0,
        vulnerabilities: "!",
        summary: "Connection failed. Please ensure your FastAPI server is running on port 8000."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setBasePrompt('');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 flex flex-col">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <nav className="bg-[#020617]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <ShieldAlert className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Aegis Workspace</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Ready
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <div className="grid lg:grid-cols-12 gap-8 h-full">
          
          {/* LEFT COLUMN: Clean Prompt Input */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <BrainCircuit className="w-5 h-5" />
                  <h2 className="font-bold text-white text-lg">Target Prompt</h2>
                </div>
                {results && (
                  <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white transition-colors">
                    Clear
                  </button>
                )}
              </div>
              
              <p className="text-sm text-slate-400 mb-4">
                Enter the exact query you want Aegis to automatically map and stress-test.
              </p>

              <textarea 
                className="w-full flex-grow min-h-[300px] p-4 bg-[#020617]/50 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none text-lg leading-relaxed shadow-inner"
                placeholder="Type your prompt here..."
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                disabled={isAnalyzing}
              />
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              onClick={handleAnalyze}
              disabled={!basePrompt || isAnalyzing}
              className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${
                basePrompt && !isAnalyzing 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-[1.02] shadow-cyan-500/25' 
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/10'
              }`}
            >
              {isAnalyzing ? (
                <><RefreshCw className="w-6 h-6 animate-spin" /> Scanning...</>
              ) : (
                <><Sparkles className="w-6 h-6" /> Run Full Analysis</>
              )}
            </motion.button>
          </div>

          {/* RIGHT COLUMN: Results Dashboard */}
          <div className="lg:col-span-8 flex flex-col">
            {!results && !isAnalyzing && (
              <div className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm min-h-[500px]">
                <Activity className="w-20 h-20 text-slate-600 mb-6" />
                <h3 className="text-2xl font-bold text-slate-400 mb-2">Awaiting Input</h3>
                <p className="text-slate-500 text-center max-w-md text-lg">
                  Submit a prompt to generate a comprehensive stability map and sensitivity curve.
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex-grow flex flex-col items-center justify-center border border-cyan-500/20 rounded-2xl bg-cyan-500/5 backdrop-blur-sm min-h-[500px]">
                <div className="relative w-28 h-28 mb-8">
                  <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-400 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-cyan-400"><BrainCircuit className="w-10 h-10 animate-pulse" /></div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-3 tracking-wide">Mapping Vectors...</h3>
                <p className="text-cyan-400 text-lg animate-pulse">Running automated perturbations</p>
              </div>
            )}

            {results && !isAnalyzing && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 flex-grow flex flex-col">
                
                {/* Score Cards */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Overall Stability Score</p>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-6xl font-black text-white">{results.stabilityScore}</span>
                      <span className="text-2xl text-slate-500 font-bold mb-1">/100</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3">
                      <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-cyan-400" style={{ width: `${results.stabilityScore}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm flex flex-col justify-between">
                    <div>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-3">Analysis Summary</p>
                      <p className="text-slate-200 text-lg leading-relaxed">{results.summary}</p>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg text-red-400 font-bold self-start">
                      <AlertTriangle className="w-5 h-5" />
                      {results.vulnerabilities} High-Risk Flaws
                    </div>
                  </div>
                </div>

                {/* Heatmap Visualization Placeholder */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex-grow flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Map className="w-5 h-5 text-cyan-400" />
                      Semantic Heatmap
                    </h3>
                  </div>
                  <div className="flex-grow min-h-[250px] rounded-xl border border-white/5 bg-[#020617] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="text-center z-10">
                      <Map className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 font-medium text-lg">[ Backend Heatmap Rendering Here ]</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;