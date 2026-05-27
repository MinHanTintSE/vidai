import { useState, useRef, useEffect } from "react";
import { supabase } from "./lib/supabase.js";

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

// ─── Viral Presets: loaded from Supabase `presets` table ─────────────────────
// Add / edit / remove presets directly in Supabase → Table Editor → presets
// No preset data lives in this file anymore.

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

// ─── Auth Modal ────────────────────────────────────────────────────────────────
function AuthModal({ onClose }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true); setError(""); setMessage("");
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const oauth = (provider) => supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  });

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 10, boxSizing: "border-box",
    background: "#1a1a1a", border: "0.5px solid rgba(255,255,255,0.12)",
    color: "#fff", fontSize: 13, outline: "none",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#111", border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: 16, padding: 32, width: 420, maxWidth: "90vw" }}
        onClick={e => e.stopPropagation()}>

        <h2 style={{ margin: "0 0 4px", fontFamily: "'Space Grotesk'", fontSize: 20, fontWeight: 700 }}>
          {mode === "signin" ? "Welcome back" : "Create account"}
        </h2>
        <p style={{ margin: "0 0 22px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
          {mode === "signup" ? "Get 50 free credits on signup" : "Sign in to continue generating"}
        </p>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.04)",
          borderRadius: 10, padding: 4, marginBottom: 20 }}>
          {[["signin","Sign In"],["signup","Sign Up"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setMessage(""); }} style={{
              flex: 1, background: mode === m ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", borderRadius: 8, padding: "8px 0", cursor: "pointer",
              color: mode === m ? "#fff" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500,
            }}>{label}</button>
          ))}
        </div>

        {/* OAuth */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <button onClick={() => oauth("google")} style={{
            background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "11px 16px", cursor: "pointer", color: "#fff",
            fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button onClick={() => oauth("github")} style={{
            background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "11px 16px", cursor: "pointer", color: "#fff",
            fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>or email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email + Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input type="email" placeholder="Email address" value={email}
            onChange={e => setEmail(e.target.value)} style={inp} />
          <input type="password" placeholder="Password (min 6 chars)" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} style={inp} />
        </div>

        {error && <p style={{ color: "#fda4af", fontSize: 12, margin: "10px 0 0" }}>{error}</p>}
        {message && <p style={{ color: "#4ade80", fontSize: 12, margin: "10px 0 0" }}>{message}</p>}

        <button onClick={submit} disabled={loading || !email || !password} style={{
          width: "100%", background: "#7c3aed", border: "none", borderRadius: 10,
          padding: 14, cursor: "pointer", color: "#fff", fontWeight: 600, fontSize: 14,
          marginTop: 16, opacity: (!email || !password) ? 0.5 : 1,
        }}>
          {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        {mode === "signup" && !message && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 12, textAlign: "center" }}>
            New accounts start with <strong style={{ color: "#a78bfa" }}>50 free credits</strong>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── History Section ────────────────────────────────────────────────────────────
function HistorySection({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => { setHistory(data || []); setLoading(false); });
  }, [user.id]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading history...</p>
    </div>
  );

  if (!history.length) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎬</div>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, fontWeight: 500 }}>No videos yet</p>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, marginTop: 6 }}>
        Your generated videos will appear here
      </p>
    </div>
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
      {history.map(item => (
        <div key={item.id} style={{
          background: "#0f0f0f", border: "0.5px solid rgba(255,255,255,0.08)",
          borderRadius: 12, overflow: "hidden",
        }}>
          {item.video_url
            ? <video src={item.video_url} controls style={{ width: "100%", display: "block", maxHeight: 200, objectFit: "cover" }} />
            : <div style={{ height: 160, background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Video unavailable</span>
              </div>
          }
          <div style={{ padding: "12px 14px" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "0 0 8px", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {item.prompt}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{item.model_name} · {item.duration}s</span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                {new Date(item.created_at).toLocaleDateString()}
              </span>
            </div>
            {item.video_url && (
              <a href={item.video_url} download target="_blank" rel="noreferrer" style={{
                display: "inline-block", marginTop: 8, fontSize: 11, color: "#7c3aed",
                textDecoration: "none",
              }}>⬇ Download</a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Preset Card (image-to-video, no text input) ───────────────────────────────
function PresetCard({ preset, previewUrl, onClearPreview, onGenerate, isGenerating, progress, disabled, hasImage }) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    if (!videoRef.current) return;
    if (hovered) videoRef.current.play().catch(() => {});
    else videoRef.current.pause();
  }, [hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0d0d0d",
        border: `1.5px solid ${isGenerating ? preset.color : hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 14, overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s",
        transform: hovered && !isGenerating ? "translateY(-2px)" : "none",
      }}
    >
      {/* ── Preview / thumbnail area ── */}
      <div style={{ position: "relative", height: 160, overflow: "hidden", background: "#0a0a0a" }}>
        {previewUrl ? (
          <>
            <video ref={videoRef} src={previewUrl} loop muted playsInline
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,13,13,0.8) 0%, transparent 55%)" }} />
            <button onClick={e => { e.stopPropagation(); onClearPreview(preset.id); }}
              style={{
                position: "absolute", top: 8, right: 8, zIndex: 10,
                background: "rgba(0,0,0,0.65)", border: "0.5px solid rgba(255,255,255,0.15)",
                borderRadius: 6, padding: "3px 8px", cursor: "pointer",
                color: "rgba(255,255,255,0.5)", fontSize: 10,
              }}>✕</button>
            {hovered && (
              <div style={{
                position: "absolute", bottom: 8, left: 8,
                background: "rgba(0,0,0,0.65)", borderRadius: 6, padding: "3px 8px",
                fontSize: 10, color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: 4,
              }}><span style={{ color: "#4ade80" }}>▶</span> PREVIEW</div>
            )}
          </>
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `linear-gradient(135deg, #0d0d0d 0%, ${preset.color}20 40%, ${preset.color}40 60%, #0d0d0d 100%)`,
            backgroundSize: "300% 300%", animation: "gradientShift 4s ease infinite",
            display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8,
          }}>
            <span style={{ fontSize: 38, filter: `drop-shadow(0 0 14px ${preset.color})` }}>{preset.emoji}</span>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: preset.color, display: "inline-block", animation: "pulse 2s ease infinite" }} />
              GENERATE TO PREVIEW
            </span>
          </div>
        )}

        {/* Category badge */}
        <div style={{
          position: "absolute", top: 8, left: 8,
          background: `${preset.color}cc`, borderRadius: 5,
          padding: "2px 8px", fontSize: 9, fontWeight: 700, color: "#fff", letterSpacing: 0.5,
        }}>{preset.category.replace(/^[^ ]+ /, "").toUpperCase()}</div>

        {/* Progress bar on top of preview while generating */}
        {isGenerating && (
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "rgba(0,0,0,0.4)" }}>
            <div style={{
              height: "100%", width: `${progress}%`,
              background: `linear-gradient(90deg, ${preset.color}, #fff)`,
              transition: "width 0.6s ease",
            }} />
          </div>
        )}
      </div>

      {/* ── Card body ── */}
      <div style={{ padding: "13px 15px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
          <span style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 14, color: "#fff" }}>{preset.name}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: 4 }}>
            {preset.duration}s
          </span>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.42)", margin: "0 0 10px", lineHeight: 1.5 }}>{preset.description}</p>

        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 11 }}>
          {preset.tags.map(t => (
            <span key={t} style={{
              fontSize: 10, padding: "2px 6px", background: "rgba(255,255,255,0.05)",
              borderRadius: 4, color: "rgba(255,255,255,0.32)", border: "0.5px solid rgba(255,255,255,0.07)",
            }}>{t}</span>
          ))}
          <span style={{
            fontSize: 10, padding: "2px 7px", marginLeft: "auto",
            background: `${preset.color}18`, borderRadius: 4,
            color: preset.color, border: `0.5px solid ${preset.color}35`,
          }}>Kling 1.6</span>
        </div>

        <button
          onClick={() => onGenerate(preset)}
          disabled={disabled}
          style={{
            width: "100%",
            background: isGenerating ? `${preset.color}30` : hasImage ? preset.color : "rgba(255,255,255,0.06)",
            border: `0.5px solid ${isGenerating ? preset.color : hasImage ? "transparent" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8, padding: "10px 0", cursor: disabled ? "not-allowed" : "pointer",
            color: hasImage || isGenerating ? "#fff" : "rgba(255,255,255,0.35)",
            fontWeight: 600, fontSize: 13, transition: "all 0.15s",
          }}
        >
          {isGenerating
            ? `Generating ${Math.round(progress)}%...`
            : hasImage
              ? "Generate with my photo →"
              : "⬆ Upload photo first"}
        </button>
      </div>
    </div>
  );
}

// ─── Presets Section (self-contained image-to-video flow) ───────────────────────
function PresetsSection({ user, onShowAuth }) {
  // ── DB-sourced data ──
  const [presets, setPresets] = useState([]);
  const [loadingPresets, setLoadingPresets] = useState(true);
  const [previewVideos, setPreviewVideos] = useState({}); // { preset_id: video_url }

  // Load presets from DB once
  useEffect(() => {
    supabase.from("presets").select("*").eq("active", true).order("sort_order")
      .then(({ data, error }) => {
        if (!error) setPresets(data || []);
        setLoadingPresets(false);
      });
  }, []);

  // Load this user's pinned previews from DB whenever user changes
  useEffect(() => {
    if (!user) { setPreviewVideos({}); return; }
    supabase.from("preset_previews").select("preset_id, video_url").eq("user_id", user.id)
      .then(({ data }) => {
        const map = {};
        (data || []).forEach(r => { map[r.preset_id] = r.video_url; });
        setPreviewVideos(map);
      });
  }, [user?.id]);

  const savePreviewVideo = async (presetId, videoUrl) => {
    setPreviewVideos(prev => ({ ...prev, [presetId]: videoUrl }));
    if (user) {
      await supabase.from("preset_previews")
        .upsert({ user_id: user.id, preset_id: presetId, video_url: videoUrl });
    }
  };

  const clearPreviewVideo = async (presetId) => {
    setPreviewVideos(prev => { const n = { ...prev }; delete n[presetId]; return n; });
    if (user) {
      await supabase.from("preset_previews")
        .delete().eq("user_id", user.id).eq("preset_id", presetId);
    }
  };

  // Derive category list from loaded presets
  const categories = ["All", ...Array.from(new Set(presets.map(p => p.category)))];

  const [activeCategory, setActiveCategory] = useState("All");

  // Image upload state
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);  // local blob URL for display
  const [imagePublicUrl, setImagePublicUrl] = useState(null);    // fal.ai CDN URL for generation
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  // Generation state
  const [generatingId, setGeneratingId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);       // video URL or "error"
  const [resultPresetId, setResultPresetId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const progressRef = useRef();

  const filtered = activeCategory === "All" ? presets : presets.filter(p => p.category === activeCategory);

  // ── Resize image in browser, then upload to fal.ai via backend ──
  const handleImageSelect = async (file) => {
    if (!file) return;
    setUploadError("");
    setImagePublicUrl(null);

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreviewUrl(localUrl);
    setUploading(true);

    try {
      // Resize to max 1024px using canvas
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = localUrl; });
      const MAX = 1024;
      let w = img.width, h = img.height;
      if (w > h && w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      else if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);

      // Convert to base64 JPEG
      const base64 = await new Promise(res => canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = e => res(e.target.result.split(",")[1]);
        reader.readAsDataURL(blob);
      }, "image/jpeg", 0.85));

      // Upload to fal.ai via backend
      const resp = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.url) throw new Error(data.error || "Upload failed");
      setImagePublicUrl(data.url);
    } catch (e) {
      setUploadError("Upload failed: " + e.message);
      setImagePreviewUrl(null);
    }
    setUploading(false);
  };

  // ── Generate video from preset + uploaded image ──
  const handleGenerate = async (preset) => {
    if (!user) { onShowAuth(); return; }
    if (!imagePublicUrl) { fileRef.current?.click(); return; }

    setGeneratingId(preset.id);
    setResultPresetId(preset.id);
    setProgress(0);
    setResult(null);
    setErrorMsg("");

    progressRef.current = setInterval(() => {
      setProgress(p => { if (p >= 90) { clearInterval(progressRef.current); return 90; } return p + Math.random() * 3.5; });
    }, 600);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const payload = { image_url: imagePublicUrl, prompt: preset.motion, duration: preset.duration };

      const submitRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token}` },
        body: JSON.stringify({ endpoint: preset.endpoint, payload }),
      });
      const submitData = await submitRes.json();
      const { status_url: statusUrl, response_url: responseUrl } = submitData;

      if (!statusUrl) {
        setErrorMsg(submitData?.detail || submitData?.error || "Submit failed — no status URL");
        setResult("error"); return;
      }

      let done = false, attempts = 0;
      while (!done && attempts < 60) {
        await new Promise(r => setTimeout(r, 4000));
        attempts++;
        const statusData = await fetch("/api/status", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusUrl }),
        }).then(r => r.json());

        if (statusData.status === "COMPLETED") {
          const resultData = await fetch("/api/result", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ responseUrl }),
          }).then(r => r.json());

          const videoUrl = resultData.video?.url || resultData.video_url || resultData.output?.video?.url || null;
          setResult(videoUrl || "error");
          if (!videoUrl) { setErrorMsg("No video URL in response"); }

          // Save to history + deduct credits
          if (videoUrl && user) {
            await supabase.from("generations").insert({
              user_id: user.id, prompt: preset.motion,
              model_id: preset.id, model_name: preset.name,
              video_url: videoUrl, duration: preset.duration, credits_used: preset.duration,
            });
            await supabase.rpc("deduct_credits", { user_id: user.id, amount: preset.duration });
          }
          done = true;
        } else if (statusData.status === "FAILED") {
          setErrorMsg(statusData.error || "Generation failed on fal.ai");
          setResult("error"); done = true;
        }
      }
      if (!done) { setErrorMsg("Timed out after 4 minutes"); setResult("error"); }
    } catch (e) {
      setErrorMsg(e.message || "Network error");
      setResult("error");
    } finally {
      clearInterval(progressRef.current);
      setProgress(100);
      setGeneratingId(null);
    }
  };

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "3px 10px",
            background: "#e11d4820", color: "#fb7185", borderRadius: 4, border: "0.5px solid #e11d4840",
          }}>VIRAL PRESETS</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            {loadingPresets ? "Loading..." : `${presets.length} effects · image-to-video`}
          </span>
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 28, margin: "10px 0 4px", letterSpacing: -0.5 }}>
          Put yourself in the scene.
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Upload your photo once. Pick any preset. Watch yourself go viral.
        </p>
      </div>

      {/* ── Photo upload ── */}
      <div style={{ marginBottom: 28 }}>
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            border: `1.5px dashed ${imagePublicUrl ? "#4ade8060" : uploading ? "#7c3aed80" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 16, padding: imagePreviewUrl ? 0 : "28px 20px",
            cursor: uploading ? "wait" : "pointer", textAlign: "center",
            background: imagePreviewUrl ? "transparent" : "rgba(255,255,255,0.02)",
            transition: "all 0.2s", overflow: "hidden",
            display: "flex", alignItems: "center",
            maxWidth: 480,
          }}
          onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = "#7c3aed80"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = imagePublicUrl ? "#4ade8060" : "rgba(255,255,255,0.12)"; }}
        >
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleImageSelect(e.target.files[0])} />

          {imagePreviewUrl ? (
            <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%" }}>
              <img src={imagePreviewUrl} alt="Your photo"
                style={{ width: 90, height: 90, objectFit: "cover", display: "block", flexShrink: 0 }} />
              <div style={{ padding: "0 18px", flex: 1, textAlign: "left" }}>
                {uploading ? (
                  <>
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#a78bfa" }}>⏳ Uploading...</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Processing your photo</p>
                  </>
                ) : imagePublicUrl ? (
                  <>
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#4ade80" }}>✓ Photo ready</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Click any preset below to generate</p>
                  </>
                ) : (
                  <>
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#fda4af" }}>⚠ Upload failed</p>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{uploadError}</p>
                  </>
                )}
                <button onClick={e => { e.stopPropagation(); setImagePreviewUrl(null); setImagePublicUrl(null); fileRef.current?.click(); }}
                  style={{
                    marginTop: 8, background: "transparent", border: "0.5px solid rgba(255,255,255,0.15)",
                    borderRadius: 6, padding: "4px 10px", cursor: "pointer",
                    color: "rgba(255,255,255,0.4)", fontSize: 11,
                  }}>Change photo</button>
              </div>
            </div>
          ) : (
            <div style={{ width: "100%", padding: "4px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤳</div>
              <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: "#fff" }}>Upload your photo</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                JPG, PNG, WEBP · Best with a clear face or full body shot
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Category filter (derived from DB data) ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            background: activeCategory === cat ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
            border: `0.5px solid ${activeCategory === cat ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 8, padding: "6px 13px", cursor: "pointer",
            color: activeCategory === cat ? "#fff" : "rgba(255,255,255,0.45)",
            fontSize: 12, fontWeight: activeCategory === cat ? 600 : 400, transition: "all 0.15s",
          }}>{cat}</button>
        ))}
      </div>

      {/* ── Preset Grid ── */}
      {loadingPresets && (
        <div style={{ textAlign: "center", padding: 60 }}>
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>Loading presets...</p>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>
        {filtered.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            previewUrl={previewVideos[preset.id] || null}
            onClearPreview={clearPreviewVideo}
            onGenerate={handleGenerate}
            isGenerating={generatingId === preset.id}
            progress={progress}
            disabled={!!generatingId}
            hasImage={!!imagePublicUrl}
          />
        ))}
      </div>

      {/* ── Result area ── */}
      {result && result !== "error" && (
        <div style={{
          marginTop: 32, background: "#0f0f0f",
          border: "0.5px solid rgba(74,222,128,0.3)", borderRadius: 16, padding: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#4ade80", fontWeight: 700 }}>✓ Video generated!</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {resultPresetId && (
                previewVideos[resultPresetId]
                  ? <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>📌 Pinned as preview</span>
                  : <button onClick={() => savePreviewVideo(resultPresetId, result)} style={{
                      fontSize: 12, color: "#f59e0b", background: "rgba(245,158,11,0.12)",
                      padding: "5px 12px", borderRadius: 6, border: "0.5px solid rgba(245,158,11,0.3)",
                      cursor: "pointer", fontWeight: 600,
                    }}>📌 Pin as preview loop</button>
              )}
              <a href={result} download target="_blank" rel="noreferrer" style={{
                fontSize: 12, color: "#7c3aed", textDecoration: "none",
                background: "rgba(124,58,237,0.15)", padding: "5px 12px", borderRadius: 6,
              }}>⬇ Download</a>
            </div>
          </div>
          <video controls style={{ width: "100%", borderRadius: 10, maxHeight: 480 }} src={result} />
        </div>
      )}
      {result === "error" && (
        <div style={{
          marginTop: 24, background: "rgba(225,29,72,0.1)", border: "0.5px solid rgba(225,29,72,0.3)",
          borderRadius: 12, padding: "14px 18px", fontSize: 13, color: "#fda4af",
        }}>
          <strong style={{ display: "block", marginBottom: 4 }}>⚠ Generation failed</strong>
          <span style={{ fontFamily: "'DM Mono'", fontSize: 11, opacity: 0.85 }}>{errorMsg || "Unknown error"}</span>
        </div>
      )}
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────────
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
  const [navSection, setNavSection] = useState("studio");

  // Auth
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [enhancing, setEnhancing] = useState(false);

  // (preset previews now live in Supabase preset_previews table, managed by PresetsSection)
  // -- API key UI hidden for live version --
  // const [keyStatus, setKeyStatus] = useState(null);
  // const testApiKey = async () => { ... };
  const fileRef = useRef();
  const progressRef = useRef();

  // ── Auth setup ────────────────────────────────────────────────────────────────
  const fetchCredits = async (userId) => {
    const { data } = await supabase.from("profiles").select("credits").eq("id", userId).single();
    if (data) setCredits(data.credits);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCredits(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchCredits(session.user.id);
      else { setCredits(0); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowUserMenu(false);
    setNavSection("studio");
  };
  // ─────────────────────────────────────────────────────────────────────────────

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
    if (!user) { setShowAuth(true); return; }
    if (credits < duration) {
      setErrorMsg(`Not enough credits. You have ${credits} but need ${duration} for a ${duration}s video.`);
      setResult("error");
      return;
    }
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

      const { data: { session } } = await supabase.auth.getSession();
      const submitRes = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
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

          // Save to history + deduct credits
          if (videoUrl && user) {
            await supabase.from("generations").insert({
              user_id: user.id,
              prompt,
              model_id: model.id,
              model_name: model.name,
              video_url: videoUrl,
              duration,
              aspect_ratio: aspect,
              resolution: model.hasResolution ? resolution : null,
              credits_used: duration,
            });
            const { data } = await supabase.rpc("deduct_credits", { amount: duration });
            if (data !== null) setCredits(data);
            else fetchCredits(user.id);
          }

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
          {["studio", "presets", "gallery", "pricing", "docs", ...(user ? ["history"] : [])].map(s => (
            <button key={s} onClick={() => setNavSection(s)} style={{
              background: navSection === s ? "rgba(255,255,255,0.07)" : "transparent",
              border: "none", cursor: "pointer", padding: "6px 14px", borderRadius: 8,
              color: navSection === s ? "#fff" : "rgba(255,255,255,0.4)",
              fontSize: 13, fontWeight: 500, textTransform: "capitalize",
            }}>{s === "presets" ? "🔥 Presets" : s}</button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 8, padding: "7px 14px", cursor: "pointer", color: "#fff",
                fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ color: "#a78bfa", fontWeight: 600 }}>⚡ {credits}</span>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>·</span>
                <span>{user.email?.split("@")[0]}</span>
                <span style={{ fontSize: 10, opacity: 0.4 }}>▾</span>
              </button>
              {showUserMenu && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
                  background: "#111", border: "0.5px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: 6, minWidth: 160,
                }}>
                  <div style={{ padding: "8px 12px 6px", borderBottom: "0.5px solid rgba(255,255,255,0.07)", marginBottom: 4 }}>
                    <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{user.email}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a78bfa" }}>⚡ {credits} credits remaining</p>
                  </div>
                  <button onClick={() => { setNavSection("history"); setShowUserMenu(false); }} style={{
                    width: "100%", background: "transparent", border: "none", borderRadius: 6,
                    padding: "8px 12px", cursor: "pointer", color: "rgba(255,255,255,0.7)",
                    fontSize: 13, textAlign: "left",
                  }}>🎬 My History</button>
                  <button onClick={handleSignOut} style={{
                    width: "100%", background: "transparent", border: "none", borderRadius: 6,
                    padding: "8px 12px", cursor: "pointer", color: "#fda4af",
                    fontSize: 13, textAlign: "left",
                  }}>↩ Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{
              background: "#7c3aed", border: "none", borderRadius: 8,
              padding: "7px 16px", cursor: "pointer", color: "#fff", fontSize: 12, fontWeight: 600,
            }}>Sign In</button>
          )}
        </div>
      </nav>

      {/* Auth Modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>✓ Video generated</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <a href={result} download style={{
                        fontSize: 12, color: "#7c3aed", textDecoration: "none",
                        background: "rgba(124,58,237,0.15)", padding: "5px 12px", borderRadius: 6,
                      }}>⬇ Download</a>
                    </div>
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

        {navSection === "presets" && (
          <PresetsSection
            user={user}
            onShowAuth={() => setShowAuth(true)}
          />
        )}

        {navSection === "history" && (
          <div>
            <div style={{ marginBottom: 28 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, padding: "3px 10px", background: "#7c3aed20", color: "#a78bfa", borderRadius: 4, border: "0.5px solid #7c3aed40" }}>HISTORY</span>
              <h2 style={{ fontFamily: "'Space Grotesk'", fontWeight: 700, fontSize: 28, margin: "10px 0 4px", letterSpacing: -0.5 }}>My Videos</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                {user ? `⚡ ${credits} credits remaining` : "Sign in to view your history"}
              </p>
            </div>
            {user
              ? <HistorySection user={user} />
              : <div style={{ textAlign: "center", padding: 60 }}>
                  <button onClick={() => setShowAuth(true)} style={{
                    background: "#7c3aed", border: "none", borderRadius: 10,
                    padding: "12px 28px", cursor: "pointer", color: "#fff", fontSize: 14, fontWeight: 600,
                  }}>Sign In to View History</button>
                </div>
            }
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        textarea::placeholder { color: rgba(255,255,255,0.2); }
        select option { background: #111; color: #fff; }
      `}</style>
    </div>
  );
}
