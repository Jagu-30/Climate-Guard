"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary/30">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0e14]/80 backdrop-blur-xl shadow-[0_0_20px_rgba(0,229,255,0.05)] flex justify-between items-center px-8 py-4">
        <div className="text-xl font-black text-[#00E5FF] tracking-tighter font-headline">
          ClimateGuard
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/dashboard" className="text-[#00E5FF] border-b-2 border-[#00E5FF] pb-1 font-headline font-bold tracking-tight">
            Dashboard
          </Link>
          <Link href="/dashboard?tab=alerts" className="text-slate-400 hover:text-white transition-colors font-headline font-bold tracking-tight">Alerts</Link>
          <Link href="/dashboard?tab=predictor" className="text-slate-400 hover:text-white transition-colors font-headline font-bold tracking-tight">Insights</Link>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <button className="material-symbols-outlined text-slate-400 hover:text-[#00E5FF] transition-all">location_on</button>
            <button className="material-symbols-outlined text-slate-400 hover:text-[#00E5FF] transition-all">dark_mode</button>
          </div>
          <Link href="/dashboard" className="bg-gradient-to-r from-primary to-secondary text-on-secondary-fixed font-headline font-bold px-6 py-2 rounded-lg glow-button transition-all duration-300">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative pt-20">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
          {/* Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
          
          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto">
            <div className="mb-8 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label text-xs uppercase tracking-widest text-primary">Sentinel-1 AI Active</span>
            </div>
            
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight mb-8 hero-gradient">
              AI-Powered Climate<br/>Risk Intelligence
            </h1>
            
            <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Real-time monitoring, predictive analytics, and adaptive action planning for a resilient future.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <Link href="/dashboard" className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-on-secondary-fixed font-headline font-bold text-lg rounded-xl glow-button transition-all transform hover:scale-105">
                Get Started
              </Link>
              <Link href="/dashboard" className="px-10 py-4 border border-outline/20 font-headline font-bold text-lg rounded-xl hover:bg-white/5 transition-all">
                View Demo
              </Link>
            </div>
            
            {/* 3D Digital Globe Placeholder */}
            <div className="relative w-full max-w-4xl mx-auto aspect-square md:aspect-video rounded-3xl overflow-hidden glass-card p-1">
              <div className="w-full h-full bg-surface-container-lowest rounded-2xl relative overflow-hidden">
                <img 
                  className="w-full h-full object-cover opacity-60 mix-blend-screen" 
                  alt="Digital representation of planet earth with glowing data networks" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBN5xTfbnfRiDa3Nd_82NDr4lCDwPhqs0quHJkg7oK6QpOte2OzSv8VNDFZCJxvploa-OboxaSr5dZyzGlC5HuZrCwNv2wXcpfk2WpS98_E6fGuYtbszW9YBCNEikmg3WrkpAQLEItCh0f_ZxbfRk-qVcCgIwI_B68Qd61mDxycWxZc3yD1JNx0s2G3A-L1dFLbVAuISIwrW9_SbQGnoqJlSrzdvYlfMDnEQck04Z1FgcH_DFgYeAV_Syl7jb6x0IHmpR_C9pdUQxU"
                />
                
                {/* Overlay UI Elements */}
                <div className="absolute top-8 left-8 text-left">
                  <div className="font-label text-[10px] text-primary mb-1 uppercase">Live Stream</div>
                  <div className="font-headline font-bold text-2xl text-white">Atmospheric Depth</div>
                </div>
                
                <div className="absolute bottom-8 right-8 flex space-x-4">
                  <div className="glass-card px-4 py-2 rounded-lg border-primary/20">
                    <div className="font-label text-[10px] text-on-surface-variant uppercase">Global Heat</div>
                    <div className="font-label text-xl text-primary font-bold">+1.2°C</div>
                  </div>
                  <div className="glass-card px-4 py-2 rounded-lg border-tertiary/20">
                    <div className="font-label text-[10px] text-on-surface-variant uppercase">Risk Level</div>
                    <div className="font-label text-xl text-tertiary font-bold">Critical</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Bento Grid */}
        <section className="py-32 px-8 max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="font-headline font-bold text-4xl mb-4">Intelligence at Scale</h2>
            <div className="h-1 w-20 bg-primary"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Risk Assessment */}
            <div className="glass-card p-8 rounded-3xl flex flex-col group hover:border-primary/40 transition-all duration-500">
              <div className="mb-8 w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl">radar</span>
              </div>
              <h3 className="font-headline font-bold text-2xl mb-4">Risk Assessment</h3>
              <p className="font-body text-on-surface-variant mb-8 flex-grow">
                Deep-learning models analyze multi-source satellite data to identify hyper-local climate vulnerabilities.
              </p>
              <div className="h-24 w-full bg-surface-container rounded-xl p-4 overflow-hidden relative">
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent"></div>
                <div className="flex items-end justify-between h-full space-x-1">
                  <div className="w-2 bg-primary/40 h-[40%] rounded-t-sm"></div>
                  <div className="w-2 bg-primary/60 h-[60%] rounded-t-sm"></div>
                  <div className="w-2 bg-primary/40 h-[30%] rounded-t-sm"></div>
                  <div className="w-2 bg-primary/80 h-[80%] rounded-t-sm"></div>
                  <div className="w-2 bg-primary/100 h-[50%] rounded-t-sm"></div>
                  <div className="w-2 bg-primary/60 h-[70%] rounded-t-sm"></div>
                </div>
              </div>
            </div>

            {/* Predictive Analytics */}
            <div className="glass-card p-8 rounded-3xl flex flex-col group hover:border-secondary/40 transition-all duration-500">
              <div className="mb-8 w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-3xl">timeline</span>
              </div>
              <h3 className="font-headline font-bold text-2xl mb-4">Predictive Analytics</h3>
              <p className="font-body text-on-surface-variant mb-8 flex-grow">
                Forecast climate trajectories up to 30 years with AI models trained on petabytes of historical weather patterns.
              </p>
              <div className="h-24 w-full bg-surface-container rounded-xl p-4 flex items-center justify-center">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                  <path className="text-secondary" d="M0 35 Q 25 35 40 20 T 80 10 T 100 5" fill="none" stroke="currentColor" strokeWidth="2"></path>
                  <circle className="text-secondary animate-pulse" cx="80" cy="10" fill="currentColor" r="3"></circle>
                </svg>
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="glass-card p-8 rounded-3xl flex flex-col group hover:border-tertiary/40 transition-all duration-500">
              <div className="mb-8 w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary text-3xl">auto_awesome</span>
              </div>
              <h3 className="font-headline font-bold text-2xl mb-4">Action Recommendations</h3>
              <p className="font-body text-on-surface-variant mb-8 flex-grow">
                Autonomous strategic planning for infrastructure resilience and supply chain adaptation.
              </p>
              <div className="h-24 w-full bg-surface-container rounded-xl p-4 flex flex-col justify-center space-y-2">
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary w-[85%]"></div>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary/60 w-[45%]"></div>
                </div>
                <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary/30 w-[65%]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="font-label text-4xl font-bold text-primary mb-2">99.8%</div>
              <div className="font-body text-on-surface-variant uppercase text-xs tracking-widest">Model Accuracy</div>
            </div>
            <div>
              <div className="font-label text-4xl font-bold text-primary mb-2">4.2PB</div>
              <div className="font-body text-on-surface-variant uppercase text-xs tracking-widest">Data Ingested</div>
            </div>
            <div>
              <div className="font-label text-4xl font-bold text-primary mb-2">12ms</div>
              <div className="font-body text-on-surface-variant uppercase text-xs tracking-widest">Latency</div>
            </div>
            <div>
              <div className="font-label text-4xl font-bold text-primary mb-2">140+</div>
              <div className="font-body text-on-surface-variant uppercase text-xs tracking-widest">Global Partners</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-[#72757d]/10 bg-[#0a0e14] flex flex-col items-center justify-center space-y-6 px-8">
        <div className="font-headline text-[#00E5FF] font-bold text-2xl">
          ClimateGuard
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link className="text-slate-500 hover:text-[#00E5FF] font-body text-xs transition-opacity" href="/about">About</Link>
          <Link className="text-slate-500 hover:text-[#00E5FF] font-body text-xs transition-opacity" href="/dashboard?tab=alerts">Alerts</Link>
          <Link className="text-slate-500 hover:text-[#00E5FF] font-body text-xs transition-opacity" href="/dashboard?tab=economic">Economics</Link>
          <Link className="text-slate-500 hover:text-[#00E5FF] font-body text-xs transition-opacity" href="/dashboard">Dashboard</Link>
        </div>
        <p className="font-body text-xs text-slate-500 text-center max-w-md">
          © 2024 ClimateGuard AI. Atmospheric Intelligence Unit. Powered by high-resolution geospatial telemetry.
        </p>
      </footer>
    </div>
  )
}
