import { useState, useRef, useEffect } from "react";

const MODELS = [
  {
    id: "seedance-2",
    name: "Seedance 2.0",
    badge: "BEST QUALITY",
    by: "ByteDance",
    price: "$0.09/sec",
    priceNote: "~$0.45 per 5s clip",
    res: ["720p", "1080p"],
    audio: true,
    desc: "Cinema-grade output with native audio-video sync. Ideal for ads, storytelling, and high-end content.",
    color: "#7c3aed",
    tags: ["Audio Sync", "1080p", "Native Audio"],
    endpoint: "bytedance/seedance-2.0/text-to-video",
    // API constraints
    durations: [5, 6, 7, 8, 9, 10],       // valid seconds (min 4, max 15)
    durationFmt: "string",                  // send as "5"
    aspects: ["16:9", "9:16", "1:1", "4:3", "21:9"],
    hasResolution: true,
  },
  {
    id: "kling-3",
    name: "Kling 3.0 Pro",
    badge: "BEST VALUE",
    by: "Kuaishou",
    price: "$0.10/sec",
    priceNote: "~$0.50 per 5s clip",
    res: [],
    audio: true,
    desc: "Multi-shot cinematic sequences with consistent characters. Native 4K output and native audio.",
    color: "#0891b2",
    tags: ["4K Native", "Character Consistency", "Audio"],
    endpoint: "fal-ai/kling-video/v3/pro/text-to-video",
    // API constraints
    durations: [5, 10],                     // valid seconds
    durationFmt: "number",                  // send as 5 (integer)
    aspects: ["16:9", "9:16", "1:1"],       // only 3 supported
    hasResolution: false,                   // no resolution field
  },
  {
    id: "veo-3",
    name: "Veo 3.1",
    badge: "TOP TIER",
    by: "Google DeepMind",
    price: "$0.10/sec",
    priceNote: "Fast tier · ~$0.50 per 5s",
    res: ["720p", "1080p"],
    audio: true,
    desc: "Google's flagship model. Best physics simulation, lip-sync, and cinematic spatial depth.",
    color: "#059669",
    tags: ["Physics", "Lip-Sync", "4K"],
    endpoint: "fal-ai/veo3",
    // API constraints
    durations: [4, 6, 8],                  // valid seconds
    durationFmt: "Xs",                      // send as "8s"
    aspects: ["16:9", "9:16"],             // only 2 supported
    hasResolution: true,
  },
  {
    id: "wan-2",
    name: "Wan 2.6",
    badge: "BUDGET",
    by: "Alibaba",
    price: "$0.05/sec",
    priceNote: "~$0.25 per 5s clip",
    res: ["720p", "1080p"],
    audio: false,
    desc: "Open-source powerhouse. Lowest cost for drafting and iteration. Great for prototyping pipelines.",
    color: "#d97706",
    tags: ["Open Source", "Budget", "Fast Draft"],
    endpoint: "wan/v2.6/text-to-video",
    // API constraints
    durations: [5, 10, 15],               // ONLY these 3 values
    durationFmt: "string",                 // send as "5"
    aspects: ["16:9", "9:16", "1:1", "4:3"],
    hasResolution: true,
  },
  {
    id: "runway-gen4",
    name: "Runway Gen-4.5",
    badge: "PRO CONTROL",
    by: "Runway",
    price: "$0.05/sec",
    priceNote: "Turbo via API",
    res: ["720p", "1080p"],
    audio: false,
    desc: "Industry leader for image-to-video and camera control. Best for reference-guided generation.",
    color: "#e11d48",
    tags: ["Camera Control", "Image-to-Video", "Reference"],
    endpoint: "fal-ai/runway/gen4-turbo",
    // API constraints
    durations: [5, 10],
    durationFmt: "number",
    aspects: ["16:9", "9:16", "1:1"],
    hasResolution: false,
  },
];

const ASPECTS = ["16:9", "9:16", "1:1", "4:3", "21:9"];
const DURATIONS = [5, 6, 8, 10];

const GALLERY = [
  { id: 1, prompt: "A lone wolf running through a snow blizzard at dusk, cinematic slow motion", model: "Seedance 2.0", dur: "5s", res: "1080p", thumb: null },
  { id: 2, prompt: "Aerial drone shot of a neon-lit Tokyo street in rain, 4K", model: "Kling 3.0 Pro", dur: "8s", res: "4K", thumb: null },
  { id: 3, prompt: "Abstract liquid metal armor assembling over a warrior figure", model: "Veo 3.1", dur: "6s", res: "1080p", thumb: null },
  { id: 4, prompt: "Tiger silhouette at golden hour, grass fields, slow dolly push", model: "Wan 2.6", dur: "5s", res: "720p", thumb: null },
  { id: 5, prompt: "Space station corridor with holographic displays flickering", model: "Runway Gen-4.5", dur: "10s", res: "1080p", thumb: null },
  { id: 6, prompt: "A lion charging through a burning forest, sparks and embers", model: "Kling 3.0 Pro", dur: "5s", res: "4K", thumb: null },
];

const THUMB_COLORS = [
  ["#1a0533","#7c3aed"],["#0a1a2a","#0891b2"],["#0a1f15","#059669"],
  ["#1f1200","#d97706"],["#1a0010","#e11d48"],["#1a0a00","#c2410c"],
];

function ModelCard({ model, selected, onClick }) {
  const active = selected === model.id;
  return (
    <button
      onClick={() => onClick(model.id)}
      style={{
        background: active ? `${model.color}18` : "transparent",
        border: `1.5px solid ${active ? model.color : "rgba(255,255,255,0.08)"}`,
        borderRadius: 12,
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>{model.name}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>by {model.by}</span>
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: 1,
          padding: "2px 7px", borderRadius: 4,
          background: `${model.color}30`, color: model.color,
        }}>{model.badge}</span>
      </div>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: "0 0 8px", lineHeight: 1.5 }}>{model.desc}</p>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {model.tags.map(t => (
          <span key={t} style={{
            fontSize: 10, padding: "2px 7px",
            background: "rgba(255,255,255,0.06)", borderRadius: 4,
            color: "rgba(255,255,255,0.5)", border: "0.5px solid rgba(255,255,255,0.1)",
          }}>{t}</span>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: model.color }}>{model.price}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{model.priceNote}</span>
      </div>
    </button>
  );
}

function GalleryCard({ item, idx }) {
  const [c1, c2] = THUMB_COLORS[idx % THUMB_COLORS.length];
  return (
    <div style={{
      background: "#0f0f0f",
      border: "0.5px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      overflow: "hidden",
      transition: "transform 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{
        height: 140, background: `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(0,0,0,0.4)", border: "1.5px solid rgba(255,255,255,0.2)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: "rgba(0,0,0,0.6)", borderRadius: 6, padding: "3px 8px",
          fontSize: 10, color: "rgba(255,255,255,0.7)",
        }}>{item.dur} · {item.res}</div>
      </div>
      <div style={{ padding: "12px 14px" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: "0 0 6px", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.prompt}
        </p>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{item.model}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("txt2vid");
  const [selectedModel, setSelectedModel] = useState("seedance-2");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("16:9");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState("720p");

  // When model changes, snap duration/aspect/resolution to valid values for that model
  const handleModelSelect = (id) => {
    const m = MODELS.find(x => x.id === id);
    setSelectedModel(id);
    if (!m.durations.includes(duration)) setDuration(m.durations[0]);
    if (!m.aspects.includes(aspect)) setAspect(m.aspects[0]);
    if (m.hasResolution && m.res.length && !m.res.includes(resolution)) setResolution(m.res[0]);
  };
  const [audio, setAudio] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  //const [apiKey, setApiKey] = useState(() => localStorage.getItem("fal_api_key") || "");
  //const [showApiPanel, setShowApiPanel] = useState(false);
  const [navSection, setNavSection] = useState("studio");
  const [imageFile, setImageFile] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);
  // -- API key UI hidden for live version --
  // const [keyStatus, setKeyStatus] = useState(null);
  // const testApiKey = async () => { ... };
  const fileRef = useRef();
  const progressRef = useRef();

  const model = MODELS.find(m => m.id === selectedModel);

  const estimatedCost = () => {
    const rate = parseFloat(model.price.replace("$","").replace("/sec",""));
    return (rate * duration).toFixed(2);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setEnhancing(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are an expert AI video prompt engineer. Take the user's rough prompt and rewrite it as a detailed, cinematic video generation prompt. Include camera movement, lighting, mood, style, and visual details. Return ONLY the enhanced prompt, no explanation.",
          messages: [{ role: "user", content: `Enhance this video prompt: "${prompt}"` }],
        }),
      });
      const data = await res.json();
      setEnhancedPrompt(data.content[0].text);
      setPrompt(data.content[0].text);
    } catch (e) {
      setEnhancedPrompt("Could not enhance. Check your API connection.");
    }
    setEnhancing(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    // if (!apiKey.trim()) { setShowApiPanel(true); return; } // hidden for live version
    setGenerating(true);
    setProgress(0);
    setResult(null);
    setErrorMsg("");

    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 92) { clearInterval(progressRef.current); return 92; }
        return p + Math.random() * 4;
      });
    }, 600);

    try {
      // Build model-specific payload — each model has different field formats
      const dur = model.durationFmt === "string" ? String(duration)
                : model.durationFmt === "Xs"     ? `${duration}s`
                : Number(duration);

      const payload = {
        prompt,
        aspect_ratio: aspect,
        duration: dur,
        ...(model.hasResolution ? { resolution } : {}),
        ...(audio && model.audio ? { generate_audio: true } : {}),
      };

      const submitRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: model.endpoint, payload }),
      });

      const submitData = await submitRes.json();
      const statusUrl = submitData.status_url;
      const responseUrl = submitData.response_url;

      if (!statusUrl) {
        setErrorMsg(submitData?.detail || submitData?.error || "Submit failed — no status URL returned");
        setResult("error");
        return;
      }

      let done = false;
      let attempts = 0;

      while (!done && attempts < 60) {
        await new Promise(r => setTimeout(r, 4000));
        attempts++;

        const statusRes = await fetch("/api/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusUrl }),
        });
        const statusData = await statusRes.json();

        if (statusData.status === "COMPLETED") {
          const resultRes = await fetch("/api/result", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responseUrl }),
          });
          const resultData = await resultRes.json();
          const videoUrl =
            resultData.video?.url ||
            resultData.video_url ||
            resultData.output?.video?.url ||
            null;
          setResult(videoUrl || "error");
          done = true;
        } else if (statusData.status === "FAILED") {
          setErrorMsg(statusData.error || statusData.detail || "Generation failed on fal.ai");
          setResult("error");
          done = true;
        }
      }
      if (!done) {
        setErrorMsg("Timed out after 4 minutes — try again");
        setResult("error");
      }
    } catch (e) {
      setErrorMsg(e.message || "Network error — check your connection");
      setResult("error");
    } finally {
      clearInterval(progressRef.current);
      setProgress(100);
      setGenerating(false);
    }
  };

  const codeSnippet = `import fal_client

result = fal_client.subscribe(
    "${model.endpoint}",
    arguments={
        "prompt": "${prompt || 'A cinematic aerial shot of mountains at dawn'}",
        "aspect_ratio": "${aspect}",
        "duration": ${duration},
        ${model.audio ? '"generate_audio": True,' : ''}
    },
    with_logs=True,
)
print(result["video"]["url"])`;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      fontFamily: "'DM Sans', 'Space Grotesk', system-ui, sans-serif",
      color: "#fff",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=DM+Mono&display=swap" rel="stylesheet" />

      {/* Nav */}
      <nav style={{
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        padding: "0 32px",
        display: "flex", alignItems: "center",
        height: 56, gap: 32, position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8,8,8,0.95)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 16, letterSpacing: -0.5 }}>VIDAI<span style={{ color: "#7c3aed" }}>.</span>studio</span>
        </div>
        <div style={{ display: "flex", gap: 4, marginLeft: 8 }}>
          {["studio", "gallery", "pricing", "docs"].map(s => (
            <button key={s} onClick={() => setNavSection(s)} style={{
              background: navSection === s ? "rgba(255,255,255,0.07)" : "transparent",
              border: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 8,
              color: navSection === s ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13, fontWeight: 500, textTransform: "capitalize",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {/* Connect API button — hidden for live version */}
          {/* <button onClick={() => setShowApiPanel(!showApiPanel)} ...>Connect API</button> */}
          <button style={{
            background: "#7c3aed", border: "none", borderRadius: 8,
            padding: "7px 16px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600,
          }}>Get Started</button>
        </div>
      </nav>

      {/* API Key Panel — hidden for live version (key stored in backend FAL_KEY env var) */}
      {/* {showApiPanel && ( <div>...</div> )} */}

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>

        {navSection === "studio" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24, alignItems: "start" }}>

            {/* Left: Main Generator */}
            <div>
              {/* Hero */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "3px 10px",
                    background: "#7c3aed20", color: "#a78bfa", borderRadius: 4, border: "0.5px solid #7c3aed40",
                  }}>AI VIDEO GENERATOR</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>Powered by fal.ai · 6 models</span>
                </div>
                <h1 style={{
                  margin: 0, fontSize: 38, fontWeight: 700, lineHeight: 1.15,
                  fontFamily: "'Space Grotesk'", letterSpacing: -1,
                  background: "linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.4))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>Generate cinematic<br/>videos with AI.</h1>
              </div>

              {/* Tabs */}
              <div style={{
                display: "flex", gap: 2, marginBottom: 20,
                background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, width: "fit-content",
              }}>
                {[["txt2vid", "Text to Video"], ["img2vid", "Image to Video"]].map(([id, label]) => (
                  <button key={id} onClick={() => setTab(id)} style={{
                    background: tab === id ? "rgba(255,255,255,0.1)" : "transparent",
                    border: "none", borderRadius: 8, padding: "8px 18px",
                    cursor: "pointer", color: tab === id ? "#fff" : "rgba(255,255,255,0.4)",
                    fontSize: 13, fontWeight: tab === id ? 600 : 400,
                  }}>{label}</button>
                ))}
              </div>

              {/* Prompt Box */}
              <div style={{
                background: "#0f0f0f", border: `0.5px solid ${generating ? model.color + "60" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 16, padding: 20, marginBottom: 16,
                transition: "border-color 0.3s",
              }}>
                {tab === "img2vid" && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                      border: "1.5px dashed rgba(255,255,255,0.1)", borderRadius: 12,
                      padding: "24px 20px", marginBottom: 14, cursor: "pointer",
                      textAlign: "center", background: imageFile ? "#1a1a1a" : "transparent",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
                  >
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                      onChange={e => setImageFile(e.target.files[0]?.name)} />
                    <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
                    <p style={{ margin: 0, fontSize: 13, color: imageFile ? "#fff" : "rgba(255,255,255,0.35)" }}>
                      {imageFile || "Click to upload reference image"}
                    </p>
                  </div>
                )}
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Describe your video... (e.g. A lone wolf running through a snowstorm at dusk, cinematic slow motion, 4K)"
                  style={{
                    width: "100%", background: "transparent", border: "none",
                    color: "#fff", fontSize: 15, lineHeight: 1.7, resize: "none",
                    outline: "none", minHeight: 100, fontFamily: "'DM Sans'",
                    boxSizing: "border-box",
                    placeholder: "color: rgba(255,255,255,0.2)",
                  }}
                  rows={4}
                />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleEnhancePrompt}
                      disabled={enhancing || !prompt.trim()}
                      style={{
                        background: "rgba(124,58,237,0.15)", border: "0.5px solid rgba(124,58,237,0.3)",
                        borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                        color: "#a78bfa", fontSize: 12, fontWeight: 500,
                        opacity: !prompt.trim() ? 0.4 : 1,
                      }}>
                      {enhancing ? "✨ Enhancing..." : "✨ AI Enhance"}
                    </button>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", alignSelf: "center" }}>
                      {prompt.length} chars
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                      Est. cost: <strong style={{ color: model.color }}>${estimatedCost()}</strong>
                    </span>
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !prompt.trim()}
                      style={{
                        background: generating ? "rgba(124,58,237,0.4)" : "#7c3aed",
                        border: "none", borderRadius: 10, padding: "10px 22px",
                        cursor: generating ? "not-allowed" : "pointer",
                        color: "#fff", fontSize: 14, fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8,
                        opacity: !prompt.trim() ? 0.5 : 1,
                      }}>
                      {generating ? (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Generating {Math.round(progress)}%
                        </>
                      ) : "Generate →"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {generating && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${progress}%`,
                      background: `linear-gradient(90deg, ${model.color}, #a78bfa)`,
                      borderRadius: 3, transition: "width 0.6s ease",
                    }} />
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                    Queue → Processing → Encoding... usually 30-90 seconds
                  </p>
                </div>
              )}

              {/* Result */}
              {result && result !== "error" && (
                <div style={{
                  background: "#0f0f0f", border: "0.5px solid rgba(74,222,128,0.3)",
                  borderRadius: 16, padding: 20, marginBottom: 20,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>✓ Video generated</span>
                    <a href={result} download style={{
                      fontSize: 12, color: "#7c3aed", textDecoration: "none",
                      background: "rgba(124,58,237,0.15)", padding: "5px 12px", borderRadius: 6,
                    }}>⬇ Download</a>
                  </div>
                  <video controls style={{ width: "100%", borderRadius: 10 }} src={result} />
                </div>
              )}
              {result === "error" && (
                <div style={{
                  background: "rgba(225,29,72,0.1)", border: "0.5px solid rgba(225,29,72,0.3)",
                  borderRadius: 12, padding: "14px 18px", marginBottom: 16,
                  fontSize: 13, color: "#fda4af",
                }}>
                  <strong style={{ display: "block", marginBottom: 4 }}>⚠ Generation failed</strong>
                  <span style={{ fontFamily: "'DM Mono'", fontSize: 11, opacity: 0.85 }}>
                    {errorMsg || "Unknown error — open DevTools Console for details"}
                  </span>
                </div>
              )}

              {/* Settings row */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24,
              }}>
                {[
                  { label: "Aspect Ratio", values: model.aspects, val: aspect, set: setAspect },
                  { label: "Duration (sec)", values: model.durations, val: duration, set: v => setDuration(Number(v)) },
                  ...(model.hasResolution ? [{ label: "Resolution", values: model.res, val: resolution, set: setResolution }] : []),
                ].map(({ label, values, val, set }) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6, fontWeight: 500 }}>{label}</label>
                    <select value={val} onChange={e => set(e.target.value)} style={{
                      width: "100%", background: "#111", border: "0.5px solid rgba(255,255,255,0.1)",
                      borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 13,
                      outline: "none", cursor: "pointer",
                    }}>
                      {values.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
                {model.audio && (
                  <div>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 6, fontWeight: 500 }}>Native Audio</label>
                    <button onClick={() => setAudio(!audio)} style={{
                      width: "100%", background: audio ? "rgba(74,222,128,0.1)" : "#111",
                      border: `0.5px solid ${audio ? "rgba(74,222,128,0.3)" : "rgba(255,255,255,0.1)"}`,
                      borderRadius: 8, padding: "9px 12px", cursor: "pointer",
                      color: audio ? "#4ade80" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500,
                    }}>
                      {audio ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                )}
              </div>

              {/* Code Snippet */}
              <div style={{
                background: "#0a0a0a", border: "0.5px solid rgba(255,255,255,0.07)",
                borderRadius: 14, overflow: "hidden",
              }}>
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "12px 18px", borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>Python · fal.ai</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono'" }}>{model.endpoint}</span>
                </div>
                <pre style={{
                  margin: 0, padding: "16px 18px",
                  fontSize: 12, lineHeight: 1.7, overflowX: "auto",
                  fontFamily: "'DM Mono', monospace", color: "#e2e8f0",
                }}>{codeSnippet}</pre>
              </div>
            </div>

            {/* Right: Model Selector */}
            <div style={{ position: "sticky", top: 76 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>Select Model</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MODELS.map(m => (
                  <ModelCard key={m.id} model={m} selected={selectedModel} onClick={handleModelSelect} />
                ))}
              </div>
            </div>
          </div>
        )}

        {navSection === "gallery" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", background: "#7c3aed20", color: "#a78bfa", borderRadius: 4, border: "0.5px solid #7c3aed40" }}>GALLERY</span>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 28, margin: "10px 0 4px", letterSpacing: -0.5 }}>Generated Videos</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>Community showcase from all models</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {GALLERY.map((item, i) => <GalleryCard key={item.id} item={item} idx={i} />)}
            </div>
          </div>
        )}

        {navSection === "pricing" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", background: "#7c3aed20", color: "#a78bfa", borderRadius: 4, border: "0.5px solid #7c3aed40" }}>PRICING</span>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 28, margin: "10px 0 4px", letterSpacing: -0.5 }}>Pay-as-you-go</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>Powered by fal.ai · No monthly subscription required</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 }}>
              {MODELS.map(m => (
                <div key={m.id} style={{
                  background: "#0f0f0f", border: `0.5px solid rgba(255,255,255,0.08)`,
                  borderRadius: 14, padding: 22, borderTop: `2px solid ${m.color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 2px", fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 15 }}>{m.name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{m.by}</p>
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 700, color: m.color, fontFamily: "'Space Grotesk'" }}>{m.price}</span>
                  </div>
                  <div style={{ margin: "16px 0", borderTop: "0.5px solid rgba(255,255,255,0.07)", paddingTop: 14 }}>
                    {[
                      ["Resolution", m.res.length ? m.res.join(", ") : "N/A"],
                      ["Max Duration", `${Math.max(...m.durations)}s`],
                      ["Native Audio", m.audio ? "Yes ✓" : "No"],
                      ["10s clip cost", `$${(parseFloat(m.price.replace("$","").replace("/sec","")) * 10).toFixed(2)}`],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 12 }}>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                        <span style={{ color: "#fff", fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", margin: 0, lineHeight: 1.5 }}>{m.priceNote}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {navSection === "docs" && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", background: "#7c3aed20", color: "#a78bfa", borderRadius: 4, border: "0.5px solid #7c3aed40" }}>DOCS</span>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 28, margin: "10px 0 4px", letterSpacing: -0.5 }}>Quick Start</h2>
            </div>
            {[
              { step: "01", title: "Get fal.ai API Key", body: "Sign up at fal.ai → Dashboard → API Keys. Free $10 credit on signup — enough for ~100 Wan 2.6 clips. No GPU setup required.", code: "pip install fal-client" },
              { step: "02", title: "Install SDK", body: "fal.ai supports Python, JavaScript/TypeScript, Kotlin, and raw REST. Use the SDK for automatic queue management and retries.", code: "npm install @fal-ai/client\n# or\npip install fal-client" },
              { step: "03", title: "Set your API key", body: "Store securely as environment variable. Never hardcode in source files.", code: 'export FAL_KEY="your_key_here"' },
              { step: "04", title: "Generate your first video", body: "Use queue.subscribe() for async generation with automatic polling.", code: `import fal_client\n\nresult = fal_client.subscribe(\n    "fal-ai/kling-video/v3/pro/text-to-video",\n    arguments={\n        "prompt": "A wolf running through snow",\n        "aspect_ratio": "16:9",\n        "duration": 5,\n    },\n)\nprint(result["video"]["url"])` },
            ].map(({ step, title, body, code }) => (
              <div key={step} style={{ display: "flex", gap: 20, marginBottom: 32 }}>
                <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 24, color: "rgba(124,58,237,0.3)", minWidth: 32, paddingTop: 2 }}>{step}</span>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 6px", fontFamily: "'Space Grotesk'", fontWeight: 600, fontSize: 16 }}>{title}</h3>
                  <p style={{ margin: "0 0 12px", fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{body}</p>
                  <pre style={{
                    background: "#0a0a0a", border: "0.5px solid rgba(255,255,255,0.07)",
                    borderRadius: 10, padding: "14px 16px", margin: 0,
                    fontFamily: "'DM Mono'", fontSize: 12, color: "#e2e8f0",
                    overflowX: "auto", lineHeight: 1.7,
                  }}>{code}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #111; color: #fff; }
      `}</style>
    </div>
  );
}
