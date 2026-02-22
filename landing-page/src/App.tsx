import { useState } from 'react';
import { Download, Smartphone, Apple, Zap, ShieldCheck, Cpu, Settings, Activity, CheckCircle, ArrowRight } from 'lucide-react';

function App() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const response = await fetch("https://formspree.io/f/maqdpvvk", {
        method: "POST",
        body: data,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        alert("Oops! There was a problem submitting your form");
      }
    } catch (error) {
      alert("Oops! There was a problem submitting your form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-twilight text-white font-sans selection:bg-light-green selection:text-black flex flex-col relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-twilight opacity-20 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-ink opacity-40 blur-[100px]"></div>
      </div>

      {/* <nav className="border-b border-indigo-ink/50 backdrop-blur-md bg-deep-twilight/50 fixed w-full z-10 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-ink flex items-center justify-center border border-violet-twilight shadow-[0_0_15px_rgba(92,73,185,0.3)]">
              <Sparkles className="w-6 h-6 text-light-green" />
            </div>
            <span className="text-xl font-bold tracking-tight">CleanSweep</span>
          </div>
        </div>
      </nav> */}

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 pt-8 pb-20 relative z-0">
        <div className="max-w-4xl w-full text-center space-y-6 sm:space-y-8">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-ink/50 border border-violet-twilight/30 text-frozen-water text-sm font-medium mb-4 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-light-green" />
            <span>The ultimate cleaning utility for Windows</span>
          </div> */}

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[0.9]">
            Keep Your Devices <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-frozen-water via-light-green to-light-green drop-shadow-sm">Spotless.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-frozen-water/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Free RAM. Fix Frozen Apps. Boost Performance.
          </p>

          <div className="pt-8 flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => window.open("https://raw.githubusercontent.com/hackyyy-official/CleanSweep/refs/heads/main/dist/CleanSweep(1.1).exe", "_blank")}
                className="group relative w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 bg-light-green text-black px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-[#a6f082] transition-all hover:-translate-y-1 hover:shadow-[0_10px_40px_-10px_rgba(152,232,116,0.5)]"
              >
                <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                Download for Windows (v1.1)
                <div className="h-4 w-[1px] bg-black/20 mx-1"></div>
                <div className="flex items-center gap-1 text-xs opacity-80">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </button>

              <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-ink/30 text-white px-5 sm:px-6 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-indigo-ink/50 border border-violet-twilight/30 transition-all">
                View Features
              </button>
            </div>

            <p className="text-sm text-frozen-water/60 font-medium tracking-wide">
              Free • No Ads • 45MB Download
            </p>

            {/* Trust Strip */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-6 gap-y-2 text-[10px] sm:text-xs font-semibold text-frozen-water/50">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-light-green/70" /> Works on Windows 10 & 11</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-light-green/70" /> No Telemetry</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-light-green/70" /> Fully Offline</span>
            </div>
          </div>

          <div className="pt-10 sm:pt-16 max-w-5xl mx-auto px-2 sm:px-4">
            <div className="flex flex-col items-center">
              {/* Context Label */}
              <div className="mb-6 flex items-center gap-2 px-3 py-1 rounded-md border border-violet-twilight/30 bg-indigo-ink/20 text-[10px] font-bold uppercase tracking-[0.2em] text-frozen-water/60">
                <span className="w-1.5 h-1.5 rounded-full bg-light-green animate-pulse"></span>
                Live Preview
              </div>

              <div className="relative group w-full">
                {/* Dimensional Shadow - Nuanced */}
                <div className="absolute inset-2 bg-black/90 blur-[100px] -z-10 group-hover:bg-black transition-colors duration-700"></div>
                <div className="absolute inset-8 bg-violet-twilight/20 blur-[60px] -z-10 group-hover:opacity-60 transition-opacity duration-700"></div>

                {/* Device-like Frame */}
                <div className="relative rounded-2xl border-t-[12px] border-x-[4px] border-b-[4px] border-[#13111C] overflow-hidden shadow-[0_45px_100px_-20px_rgba(0,0,0,1)] bg-[#0a0a0f]">
                  {/* Subtle Window Controls */}
                  <div className="absolute top-[-9px] left-3 flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-frozen-water/10 hover:bg-red-500/50 transition-colors"></div>
                    <div className="w-2 h-2 rounded-full bg-frozen-water/10 hover:bg-yellow-500/50 transition-colors"></div>
                    <div className="w-2 h-2 rounded-full bg-frozen-water/10 hover:bg-green-500/50 transition-colors"></div>
                  </div>

                  <img
                    src="/screenshot.png"
                    alt="CleanSweep Dashboard Mockup"
                    className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>

                {/* Explanatory Caption */}
                <p className="mt-4 text-sm text-frozen-water/40 italic font-medium text-center">
                  CleanSweep scanning active processes in real time.
                </p>

                {/* Animated Counters / Stats */}
                <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4 md:gap-8 max-w-4xl mx-auto">
                  <div className="p-3 sm:p-4 rounded-xl bg-indigo-ink/20 border border-violet-twilight/10 backdrop-blur-sm group/stat hover:bg-indigo-ink/30 transition-colors flex flex-col items-center justify-center">
                    <div className="text-xl sm:text-2xl md:text-4xl font-black text-light-green tabular-nums tracking-tighter drop-shadow-sm">124</div>
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-frozen-water/50 font-bold mt-1 text-center">Processes Detected</div>
                  </div>

                  {/* Highlighted Middle Metric */}
                  <div className="p-3 sm:p-6 rounded-xl bg-indigo-ink/40 border-2 border-light-green/40 backdrop-blur-md group/stat hover:border-light-green/60 hover:shadow-[0_0_30px_rgba(152,232,116,0.15)] transition-all flex flex-col items-center justify-center transform sm:scale-110 z-10">
                    <div className="text-2xl sm:text-4xl md:text-6xl font-black text-light-green tabular-nums tracking-tighter drop-shadow-lg">87<span className="text-xl sm:text-3xl md:text-4xl">MB</span></div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-frozen-water/80 font-bold mt-2 text-center">Memory Freed</div>
                  </div>

                  <div className="p-3 sm:p-4 rounded-xl bg-indigo-ink/20 border border-violet-twilight/10 backdrop-blur-sm group/stat hover:bg-indigo-ink/30 transition-colors flex flex-col items-center justify-center">
                    <div className="text-xl sm:text-2xl md:text-4xl font-black text-light-green tabular-nums tracking-tighter drop-shadow-sm">12</div>
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest text-frozen-water/50 font-bold mt-1 text-center">Apps Closed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-16 sm:pt-32 pb-10 sm:pb-16 w-full relative">
            <div className="absolute inset-0 bg-[#0c0822] -z-10 border-y border-violet-twilight/10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-twilight/5 to-transparent -z-10"></div>

            <div className="max-w-6xl mx-auto px-4 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-8 sm:mb-16 tracking-tight">Why CleanSweep?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[
                  { title: 'Instant Process Detection', desc: 'Scans active processes in milliseconds.', icon: <Zap className="w-6 h-6 text-light-green" /> },
                  { title: 'Smart Safe Termination', desc: 'Avoids critical system processes automatically.', icon: <CheckCircle className="w-6 h-6 text-light-green" /> },
                  { title: 'Digitally Signed & Secure', desc: 'Verified executable with zero bloatware.', icon: <ShieldCheck className="w-6 h-6 text-light-green" /> },
                  { title: 'Low Memory Footprint', desc: 'Runs silently with under 2MB RAM usage.', icon: <Cpu className="w-6 h-6 text-light-green" /> },
                  { title: 'Advanced Power User Mode', desc: 'Granular control for deep system management.', icon: <Settings className="w-6 h-6 text-light-green" /> },
                  { title: 'Real-Time Activity Log', desc: 'Transparent tracking of all optimizations.', icon: <Activity className="w-6 h-6 text-light-green" /> },
                ].map((feature, i) => (
                  <div key={i} className="p-5 sm:p-8 rounded-2xl bg-deep-twilight/40 border border-violet-twilight/20 backdrop-blur-md flex flex-col items-center text-center group hover:border-light-green/40 hover:bg-deep-twilight/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(92,73,185,0.15)]">
                    <div className="w-14 h-14 mb-6 rounded-2xl bg-indigo-ink flex items-center justify-center border border-violet-twilight/40 group-hover:scale-105 transition-transform shadow-inner">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-frozen-water mb-2 leading-snug">{feature.title}</h4>
                      <p className="text-sm text-frozen-water/60 leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-14 sm:pt-24 max-w-4xl mx-auto text-center px-2 sm:px-0">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Take CleanSweep Everywhere</h3>
            <p className="text-frozen-water/80 mb-6 sm:mb-10 text-base sm:text-lg">We are actively developing native applications for mobile devices. Get notified the moment they drop.</p>

            <div className="flex flex-col items-center max-w-2xl mx-auto w-full min-h-[140px] justify-center">
              {!isSubmitted ? (
                <>
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col sm:flex-row items-stretch justify-center gap-4 w-full"
                  >
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Enter your email address"
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-5 rounded-xl bg-deep-twilight/50 border border-violet-twilight/40 text-white placeholder-frozen-water/50 focus:outline-none focus:border-light-green focus:ring-1 focus:ring-light-green transition-all shadow-inner text-base sm:text-lg"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-2 bg-indigo-ink/80 text-white border border-violet-twilight/50 px-6 sm:px-10 py-3 sm:py-5 rounded-xl font-bold hover:bg-indigo-ink transition-colors whitespace-nowrap text-base sm:text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Submitting..." : (
                        <>Join Waitlist <ArrowRight className="w-5 h-5 ml-1" /></>
                      )}
                    </button>
                  </form>
                  <p className="text-xs text-frozen-water/40 mt-4 font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> We'll never send spam. Unsubscribe anytime.
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-light-green/20 rounded-full flex items-center justify-center mb-4 border border-light-green/30">
                    <CheckCircle className="w-8 h-8 text-light-green" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">You're on the list!</h4>
                  <p className="text-frozen-water/60">We'll notify you as soon as the mobile apps are ready.</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-10">
              <div className="flex items-center gap-2 text-frozen-water/50 font-medium">
                <Apple className="w-5 h-5" /> iOS
              </div>
              <div className="w-1 h-1 rounded-full bg-frozen-water/30"></div>
              <div className="flex items-center gap-2 text-frozen-water/50 font-medium">
                <Smartphone className="w-5 h-5" /> Android
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="pt-16 pb-8 border-t border-indigo-ink/30 relative z-10 bg-[#0A071A]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold tracking-tight text-white">CleanSweep</span>
              </div>
              <p className="text-frozen-water/60 text-sm max-w-xs leading-relaxed">
                The most efficient tool to manage, terminate, and monitor system processes on Windows.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm text-frozen-water/60">
                <li><button onClick={() => window.open("https://drive.usercontent.google.com/download?id=1nbJYU5jFC_gXXs1fH5q_Cskz8mTeNzn_&export=download&authuser=0&confirm=t&uuid=9d7048dd-ac25-4341-b846-f617fd00e25a&at=APcXIO2xQlCxMqOh9luzL8-BMKyw%3A1771755088760", "_blank")} className="hover:text-light-green transition-colors text-left bg-transparent border-none p-0">Download (v1.2.0)</button></li>
                <li><a href="#" className="hover:text-light-green transition-colors">System Requirements</a></li>
                <li><a href="#" className="hover:text-light-green transition-colors">Release Notes</a></li>
                <li><a href="#" className="hover:text-light-green transition-colors flex items-center gap-1.5"><Activity className="w-3 h-3" /> Verify Checksum (SHA256)</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Legal & Support</h4>
              <ul className="space-y-3 text-sm text-frozen-water/60">
                <li><a href="#" className="hover:text-light-green transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-light-green transition-colors">Terms of Service</a></li>
                <li><a href="mailto:support@cleansweep.app" className="hover:text-light-green transition-colors">support@cleansweep.app</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-violet-twilight/10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-[10px] sm:text-xs text-frozen-water/40">
            <p>© 2026 CleanSweep Software. All rights reserved.</p>
            <p>Designed for Windows 10 & 11</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
