import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  Loader2,
  Sparkles,
  X,
  Send,
  BrainCircuit,
  MessageSquare,
  Search,
  Code,
  Box,
  ChevronLeft,
  Terminal,
  Settings2,
  SlidersHorizontal,
  Key,
  Copy,
  Plus,
  Menu,
  BarChart3,
  Activity,
  MessageCircle,
  CheckCircle2,
  Crown,
  Trash2,
  Save,
  Edit2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { Message, MediaState } from "./types";
import ReactMarkdown from "react-markdown";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const categorizeModel = (id: string) => {
  const lowerId = id.toLowerCase();
  if (
    lowerId.includes("vision") ||
    lowerId.includes("-vl") ||
    lowerId.includes("neva") ||
    lowerId.includes("fuyu") ||
    lowerId.includes("kosmos") ||
    lowerId.includes("multimodal") ||
    lowerId.includes("step-3.7")
  )
    return "Vision & Multimodal";
  if (lowerId.includes("image-generation")) return "Image Generation";
  if (lowerId.includes("video-generation") || lowerId.includes("video"))
    return "Video Creation";
  if (lowerId.includes("reasoning") || lowerId.includes("reason"))
    return "Reasoning & Agents";
  if (
    lowerId.includes("code") ||
    lowerId.includes("coder") ||
    lowerId.includes("starcoder")
  )
    return "Coding & Development";
  if (
    lowerId.includes("nemotron") ||
    lowerId.includes("llama") ||
    lowerId.includes("mistral") ||
    lowerId.includes("gemma") ||
    lowerId.includes("qwen") ||
    lowerId.includes("yi") ||
    lowerId.includes("phi") ||
    lowerId.includes("step-")
  )
    return "Language & Chat";
  return "Other Services";
};

const getCategoryIcon = (category: string) => {
  if (category.includes("Vision")) return <ImageIcon className="w-5 h-5" />;
  if (category.includes("Image")) return <ImageIcon className="w-5 h-5" />;
  if (category.includes("Video")) return <Video className="w-5 h-5" />;
  if (category.includes("Reasoning"))
    return <BrainCircuit className="w-5 h-5" />;
  if (category.includes("Code")) return <Code className="w-5 h-5" />;
  if (category.includes("Language"))
    return <MessageSquare className="w-5 h-5" />;
  return <Box className="w-5 h-5" />;
};

const getCategoryColors = (category: string) => {
  if (category.includes("Vision"))
    return {
      border:
        "border-blue-500/20 bg-blue-500/5 hover:border-blue-500/50 hover:bg-blue-500/10",
      bar: "bg-blue-500/50 group-hover:bg-blue-400",
      icon: "text-blue-400",
    };
  if (category.includes("Image"))
    return {
      border:
        "border-fuchsia-500/20 bg-fuchsia-500/5 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/10",
      bar: "bg-fuchsia-500/50 group-hover:bg-fuchsia-400",
      icon: "text-fuchsia-400",
    };
  if (category.includes("Video"))
    return {
      border:
        "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/50 hover:bg-rose-500/10",
      bar: "bg-rose-500/50 group-hover:bg-rose-400",
      icon: "text-rose-400",
    };
  if (category.includes("Reasoning"))
    return {
      border:
        "border-purple-500/20 bg-purple-500/5 hover:border-purple-500/50 hover:bg-purple-500/10",
      bar: "bg-purple-500/50 group-hover:bg-purple-400",
      icon: "text-purple-400",
    };
  if (category.includes("Code"))
    return {
      border:
        "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 hover:bg-emerald-500/10",
      bar: "bg-emerald-500/50 group-hover:bg-emerald-400",
      icon: "text-emerald-400",
    };
  if (category.includes("Language"))
    return {
      border:
        "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/50 hover:bg-amber-500/10",
      bar: "bg-amber-500/50 group-hover:bg-amber-400",
      icon: "text-amber-400",
    };
  return {
    border:
      "border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/50 hover:bg-indigo-500/10",
    bar: "bg-indigo-500/50 group-hover:bg-indigo-400",
    icon: "text-indigo-400",
  };
};

const usageData = [
  { name: "Jun 24", requests: 400 },
  { name: "Jun 25", requests: 300 },
  { name: "Jun 26", requests: 550 },
  { name: "Jun 27", requests: 480 },
  { name: "Jun 28", requests: 700 },
  { name: "Jun 29", requests: 1200 },
  { name: "Jun 30", requests: 850 },
];

export default function App() {
  const [view, setView] = useState<
    "dashboard" | "chat" | "analytics" | "get-key" | "docs" | "admin"
  >("dashboard");
  const [unlimitedPrice, setUnlimitedPrice] = useState(() => {
    return localStorage.getItem("ruteclien_unlimited_price") || "Rp 150.000";
  });
  const [userId, setUserId] = useState(() => {
    return localStorage.getItem("ruteclien_user_id") || "";
  });
  const [userApiKey, setUserApiKey] = useState(() => {
    return localStorage.getItem("ruteclien_user_key") || "";
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const handleConnect = () => {
    localStorage.setItem("ruteclien_user_id", userId);
    localStorage.setItem("ruteclien_user_key", userApiKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const [apiKeys, setApiKeys] = useState<
    Array<{ id: string; key: string; limit: number; usage: number }>
  >([]);

  useEffect(() => {
    fetch("/api/admin/keys")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setApiKeys(data);
        }
      })
      .catch(console.error);
  }, []);

  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<number>(0);

  const saveApiKeys = async (
    keys: Array<{ id: string; key: string; limit: number; usage: number }>,
  ) => {
    setApiKeys(keys);
    try {
      await fetch("/api/admin/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
    } catch (e) {
      console.error("Failed to save keys to backend");
    }
  };

  const generateApiKey = () => {
    const newId = `user_${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`;
    const newKey = `sk-ruteclien-${Math.random().toString(36).substring(2, 14)}`;
    const keys = [
      ...apiKeys,
      { id: newId, key: newKey, limit: 10000, usage: 0 },
    ];
    saveApiKeys(keys);
  };

  const deleteApiKey = (id: string) => {
    saveApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const updateApiKeyLimit = (id: string, newLimit: number) => {
    saveApiKeys(
      apiKeys.map((k) => (k.id === id ? { ...k, limit: newLimit } : k)),
    );
  };

  const handlePriceChange = (newPrice: string) => {
    setUnlimitedPrice(newPrice);
    localStorage.setItem("ruteclien_unlimited_price", newPrice);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [media, setMedia] = useState<MediaState>({
    file: null,
    previewUrl: null,
    type: null,
  });
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>(
    "stepfun-ai/step-3.7-flash",
  );

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [temperature, setTemperature] = useState(0.6);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [topP, setTopP] = useState(0.95);
  const [systemPrompt, setSystemPrompt] = useState("");

  const [availableModels, setAvailableModels] = useState<{ id: string }[]>([]);

  useEffect(() => {
    fetch("/api/custom-models")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAvailableModels(data);
        }
      })
      .catch(console.error);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const groupedModels = useMemo(() => {
    const filtered = availableModels.filter((m) =>
      m.id.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    return filtered.reduce(
      (acc, model) => {
        const category = categorizeModel(model.id);
        if (!acc[category]) acc[category] = [];
        acc[category].push(model);
        return acc;
      },
      {} as Record<string, typeof availableModels>,
    );
  }, [availableModels, searchQuery]);

  useEffect(() => {
    // Models are statically defined above to ensure only working ones are shown
  }, []);

  useEffect(() => {
    if (view === "chat") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setError("Please upload an image or video file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setMedia({
      file,
      previewUrl,
      type: isVideo ? "video" : "image",
    });
    setError(null);
  };

  const clearMedia = () => {
    if (media.previewUrl) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setMedia({ file: null, previewUrl: null, type: null });
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractFrame = (): string | null => {
    if (media.type === "video" && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL("image/jpeg", 0.9);
      }
    }
    return null;
  };

  const convertImageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!input.trim() && !media.file) return;
    if (isGenerating) return;

    if (!userId.trim() || !userApiKey.trim()) {
      setError(
        "Please set your User ID and API Key in the dashboard to test models.",
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    let base64Image = undefined;
    if (media.file) {
      if (media.type === "video") {
        const frameData = extractFrame();
        if (frameData) base64Image = frameData;
      } else {
        base64Image = await convertImageToBase64(media.file);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      image: base64Image,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    clearMedia();

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", reasoning: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userApiKey}`,
          "X-User-Id": userId,
        },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image,
          })),
          model: selectedModel,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          system_prompt: systemPrompt || undefined,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to generate response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let assistantContent = "";
        let assistantReasoning = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                const delta = data.choices[0]?.delta;

                if (delta) {
                  if (delta.reasoning_content) {
                    assistantReasoning += delta.reasoning_content;
                  }
                  if (delta.content) {
                    assistantContent += delta.content;
                  }

                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantId
                        ? {
                            ...msg,
                            content: assistantContent,
                            reasoning: assistantReasoning,
                          }
                        : msg,
                    ),
                  );
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      }
    } catch (err: any) {
      let errorMsg = err.message || "An unknown error occurred.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) errorMsg = parsed.error;
      } catch (e) {}
      setError(errorMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
    setView("chat");
  };

  const mobileMenuOverlay = (
    <AnimatePresence>
      {showMobileMenu && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] sm:hidden"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute top-0 left-0 bottom-0 w-[280px] bg-[#050505] border-r border-white/5 flex flex-col"
          >
            <div className="p-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <h2 className="font-serif font-semibold text-lg tracking-wide text-gray-100">
                  RUTEclien
                </h2>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              <button
                onClick={() => {
                  setView("dashboard");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "dashboard"
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Activity className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">
                  Dashboard
                </span>
              </button>

              <button
                onClick={() => {
                  setView("docs");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "docs"
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Terminal className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">
                  Documentation
                </span>
              </button>

              <button
                onClick={() => {
                  setView("chat");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "chat"
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <Box className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">
                  Playground
                </span>
              </button>

              <button
                onClick={() => {
                  setView("analytics");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "analytics"
                    ? "bg-indigo-500/10 text-indigo-300"
                    : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">
                  Analytics
                </span>
              </button>

              <div className="my-2 border-t border-white/5"></div>

              <button
                onClick={() => {
                  window.location.href = "/admin";
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-gray-400 hover:bg-white/5 hover:text-gray-200`}
              >
                <Terminal className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">
                  Admin Dashboard
                </span>
              </button>

              <button
                onClick={() => {
                  setView("get-key");
                  setShowMobileMenu(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  view === "get-key"
                    ? "bg-amber-500/10 text-amber-300"
                    : "text-amber-500/70 hover:bg-amber-500/5 hover:text-amber-400"
                }`}
              >
                <Crown className="w-5 h-5" />
                <span className="font-medium text-sm tracking-wide">
                  Get Premium Key
                </span>
              </button>

              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                    Your User ID
                  </label>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => {
                      setUserId(e.target.value);
                    }}
                    placeholder="user_..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                    Your API Key
                  </label>
                  <input
                    type="password"
                    value={userApiKey}
                    onChange={(e) => {
                      setUserApiKey(e.target.value);
                    }}
                    placeholder="sk-ruteclien-..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <button
                  onClick={handleConnect}
                  className="w-full bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Connected
                    </>
                  ) : (
                    "Connect"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (false && view === ("keys" as any)) {
    return (
      <div className="min-h-screen bg-[#020202] text-gray-100 font-sans selection:bg-indigo-500/30">
        {mobileMenuOverlay}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#020202]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="sm:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("dashboard")}
              className="hidden sm:block p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white mr-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100">
              API <span className="font-light text-gray-500">Keys</span>
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h2 className="text-3xl font-serif mb-3">API Keys</h2>
            <p className="text-gray-400 font-light max-w-2xl">
              Your API keys provide full access to all RUTEclien endpoints. Keep
              them secure and never share them publicly.
            </p>
          </div>

          <div className="bg-[#050505] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h3 className="text-lg font-medium text-gray-200 mb-1">
                  Active Keys
                </h3>
                <p className="text-sm text-gray-500 font-light">
                  You have {apiKeys.length} active API{" "}
                  {apiKeys.length === 1 ? "key" : "keys"}.
                </p>
              </div>
              <button
                onClick={generateApiKey}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-indigo-900/20"
              >
                <Plus className="w-4 h-4" />
                Generate New Key
              </button>
            </div>

            <div className="space-y-4">
              {apiKeys.map((apiKey, index) => (
                <div
                  key={apiKey.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a0a0a] border border-white/5 rounded-xl gap-4 hover:border-indigo-500/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-300">
                        {index === 0 ? "Default Key" : `Project Key ${index}`} (
                        {apiKey.id})
                      </span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 tracking-wider">
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-500 font-mono">
                        Created on {new Date().toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 font-mono flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {((apiKey.usage / apiKey.limit) * 100).toFixed(1)}% Used
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#020202] border border-white/10 px-4 py-2 rounded-lg flex-1 sm:max-w-xs justify-between">
                    <span className="font-mono text-sm text-gray-400 select-all truncate">
                      {apiKey.key.substring(0, 15)}********************
                    </span>
                    <button
                      className="text-gray-500 hover:text-indigo-400 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div className="text-center py-8 text-gray-500 font-light">
                  No API keys found. Generate one to start building.
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-lg font-medium text-gray-200 mb-4">
                Usage Limits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-sm text-gray-400 mb-2">
                    Monthly Quota
                  </div>
                  <div className="text-2xl font-serif text-gray-200">
                    10,000{" "}
                    <span className="text-sm text-gray-500 font-sans">
                      requests
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="bg-indigo-500 h-full w-[12%]" />
                  </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl">
                  <div className="text-sm text-gray-400 mb-2">Rate Limit</div>
                  <div className="text-2xl font-serif text-gray-200">
                    60{" "}
                    <span className="text-sm text-gray-500 font-sans">RPM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === "analytics") {
    return (
      <div className="min-h-screen bg-[#020202] text-gray-100 font-sans selection:bg-indigo-500/30">
        {mobileMenuOverlay}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#020202]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="sm:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("dashboard")}
              className="hidden sm:block p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white mr-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100">
              Usage <span className="font-light text-gray-500">Analytics</span>
            </h1>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h2 className="text-3xl font-serif mb-3">Analytics Overview</h2>
            <p className="text-gray-400 font-light max-w-2xl">
              Monitor your API usage, requests volume, and overall performance
              across all endpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl shadow-inner group hover:border-indigo-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Total Requests (30d)
              </div>
              <div className="text-4xl font-serif text-gray-100">4,480</div>
              <div className="text-emerald-400 text-sm mt-2 flex items-center gap-1 font-medium">
                <Plus className="w-3 h-3" /> 12% from last month
              </div>
            </div>

            <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl shadow-inner group hover:border-indigo-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Avg. Latency
              </div>
              <div className="text-4xl font-serif text-gray-100">
                124
                <span className="text-xl text-gray-500 font-sans ml-1">ms</span>
              </div>
              <div className="text-emerald-400 text-sm mt-2 flex items-center gap-1 font-medium">
                -5ms from last month
              </div>
            </div>

            <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl shadow-inner group hover:border-indigo-500/30 transition-colors">
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Error Rate
              </div>
              <div className="text-4xl font-serif text-gray-100">
                0.12
                <span className="text-xl text-gray-500 font-sans ml-1">%</span>
              </div>
              <div className="text-emerald-400 text-sm mt-2 flex items-center gap-1 font-medium">
                Stable
              </div>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 md:p-8 shadow-inner relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-30 group-hover:opacity-60 transition-opacity" />
            <h3 className="text-lg font-medium text-gray-200 mb-8 flex items-center gap-2">
              Request Volume
            </h3>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={usageData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRequests"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0a0a0a",
                      borderColor: "#ffffff1a",
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    itemStyle={{ color: "#818cf8" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="requests"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRequests)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === "get-key") {
    return (
      <div className="min-h-screen bg-[#020202] text-gray-100 font-sans selection:bg-amber-500/30">
        {mobileMenuOverlay}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#020202]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="sm:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("dashboard")}
              className="hidden sm:block p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white mr-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100">
              Get <span className="font-light text-gray-500">Key</span>
            </h1>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-16">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-white to-amber-200">
              Unlock Full Power with RUTEclien Premium
            </h2>
            <p className="text-lg text-gray-400 font-light leading-relaxed">
              Dapatkan akses tanpa batas ke semua model AI terbaik kami.
              Tingkatkan produktivitas Anda tanpa khawatir tentang batasan limit
              bulanan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-[#050505] border border-white/5 rounded-3xl p-8 flex flex-col hover:border-white/10 transition-colors">
              <h3 className="text-xl font-medium text-gray-200 mb-2">Basic</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-serif text-white">Free</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-gray-600" />
                  10,000 requests per month
                </li>
                <li className="flex items-center gap-3 text-gray-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-gray-600" />
                  Standard Support
                </li>
                <li className="flex items-center gap-3 text-gray-400 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-gray-600" />
                  60 Requests per minute (RPM)
                </li>
              </ul>
              <button
                onClick={() => setView("dashboard")}
                className="w-full py-3 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 transition-colors"
              >
                Current Plan
              </button>
            </div>

            {/* Unlimited Plan */}
            <div className="bg-gradient-to-b from-[#0a0a0a] to-[#050505] border border-amber-500/30 rounded-3xl p-8 flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full" />

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-medium text-amber-200">
                  Unlimited
                </h3>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                  <Crown className="w-3 h-3" />
                  Popular
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-serif text-white">
                  {unlimitedPrice}
                </span>
                <span className="text-gray-500 font-light">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                <li className="flex items-center gap-3 text-gray-300 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Unlimited requests
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Priority 24/7 WhatsApp Support
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  No rate limits (Unlimited RPM)
                </li>
                <li className="flex items-center gap-3 text-gray-300 font-light text-sm">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Access to all premium models
                </li>
              </ul>

              <a
                href="https://wa.me/6287733745059?text=Halo%2C%20saya%20tertarik%20untuk%20membeli%20RUTEclien%20Premium%20Unlimited%20Key."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all relative z-10"
              >
                <MessageCircle className="w-5 h-5" />
                Beli via WhatsApp
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === "docs") {
    return (
      <div className="min-h-screen bg-[#020202] text-gray-100 font-sans selection:bg-indigo-500/30">
        {mobileMenuOverlay}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#020202]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="sm:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView("dashboard")}
              className="hidden sm:block p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white mr-2"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <Terminal className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100">
              API <span className="font-light text-gray-500">Docs</span>
            </h1>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h2 className="text-3xl font-serif mb-3">API Documentation</h2>
            <p className="text-gray-400 font-light">
              Learn how to integrate RUTEclien API into your application.
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-[#050505] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
              <h3 className="text-xl font-serif text-gray-200 mb-4">Authentication</h3>
              <p className="text-gray-400 font-light mb-6">
                All requests must include your API Key in the <code className="bg-white/10 px-2 py-1 rounded text-sm text-gray-300">Authorization</code> header, and your User ID in the <code className="bg-white/10 px-2 py-1 rounded text-sm text-gray-300">X-User-Id</code> header.
              </p>
              
              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 relative font-mono text-sm">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`Authorization: Bearer YOUR_API_KEY\nX-User-Id: YOUR_USER_ID`);
                    alert("Headers copied to clipboard!");
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-300 hover:bg-white/10 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <div className="text-gray-400">Authorization: <span className="text-indigo-400">Bearer YOUR_API_KEY</span></div>
                <div className="text-gray-400 mt-2">X-User-Id: <span className="text-indigo-400">YOUR_USER_ID</span></div>
              </div>
            </div>

            <div className="bg-[#050505] border border-white/5 rounded-2xl p-8 relative overflow-hidden group">
              <h3 className="text-xl font-serif text-gray-200 mb-4">Chat Completions endpoint</h3>
              <p className="text-gray-400 font-light mb-6">
                Send a POST request to <code className="bg-white/10 px-2 py-1 rounded text-sm text-gray-300">/api/chat</code> to get model responses.
              </p>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 relative font-mono text-sm overflow-x-auto">
                <button 
                  onClick={() => {
                    const code = `curl -X POST https://api.ruteclien.com/api/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "X-User-Id: YOUR_USER_ID" \\
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ],
    "model": "gemini-2.5-pro",
    "temperature": 0.7
  }'`;
                    navigator.clipboard.writeText(code);
                    alert("cURL snippet copied to clipboard!");
                  }}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-300 hover:bg-white/10 rounded transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <pre className="text-gray-400 leading-relaxed text-xs sm:text-sm">
<span className="text-emerald-400">curl</span> -X POST https://api.ruteclien.com/api/chat \<br/>
  -H <span className="text-amber-300">"Content-Type: application/json"</span> \<br/>
  -H <span className="text-amber-300">"Authorization: Bearer YOUR_API_KEY"</span> \<br/>
  -H <span className="text-amber-300">"X-User-Id: YOUR_USER_ID"</span> \<br/>
  -d <span className="text-amber-300">'{'{'}</span><br/>
    <span className="text-indigo-300">"messages"</span>: [<br/>
      {'{'}<span className="text-indigo-300">"role"</span>: <span className="text-emerald-300">"user"</span>, <span className="text-indigo-300">"content"</span>: <span className="text-emerald-300">"Hello!"</span>{'}'}<br/>
    ],<br/>
    <span className="text-indigo-300">"model"</span>: <span className="text-emerald-300">"gemini-2.5-pro"</span>,<br/>
    <span className="text-indigo-300">"temperature"</span>: <span className="text-rose-300">0.7</span><br/>
  <span className="text-amber-300">{'}'}'</span>
                </pre>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }


  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-[#020202] text-gray-100 font-sans selection:bg-indigo-500/30">
        {mobileMenuOverlay}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#020202]/80 backdrop-blur-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="sm:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100">
              RUTE<span className="font-light text-gray-500">clien</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-light text-gray-400">
            <div className="hidden sm:flex items-center gap-4">
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                }}
                placeholder="Enter User ID"
                className="w-32 bg-[#0a0a0a] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <input
                type="password"
                value={userApiKey}
                onChange={(e) => {
                  setUserApiKey(e.target.value);
                }}
                placeholder="Enter API Key"
                className="w-40 bg-[#0a0a0a] border border-white/10 rounded-full px-4 py-1.5 text-xs text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button
                onClick={handleConnect}
                className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-full px-4 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {isSaved ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </>
                ) : (
                  "Connect"
                )}
              </button>
              <span
                className="hover:text-gray-200 cursor-pointer transition-colors"
                onClick={() => setView("analytics")}
              >
                Analytics
              </span>
              <span 
                className="hover:text-gray-200 cursor-pointer transition-colors"
                onClick={() => setView("docs")}
              >
                Documentation
              </span>
              <span
                className="hover:text-gray-200 cursor-pointer transition-colors"
                onClick={() => setView("chat")}
              >
                Playground
              </span>
              <div className="w-px h-4 bg-white/10 mx-2" />
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="hidden sm:inline">API Operational</span>
              <span className="sm:hidden">Online</span>
            </div>

            <button
              onClick={() => setView("get-key")}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Key</span>
              <span className="sm:hidden">Key</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gateway Version 2.0 is now live</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500"
            >
              API Reference
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 font-light max-w-2xl mx-auto text-lg"
            >
              Integrate world-class foundational models into your applications
              with our unified gateway endpoint.
            </motion.p>
          </div>

          {/* API Endpoint & cURL Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 mb-16 shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-200 font-serif">
                  Quickstart Request
                </h3>
              </div>
            </div>

            <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl font-mono text-sm text-gray-300 overflow-x-auto shadow-inner relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-50" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 border-b border-white/5 pb-4">
                <span className="text-xs font-sans bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/20 font-semibold tracking-wider w-fit">
                  POST
                </span>
                <span className="text-gray-400 break-all md:break-normal text-xs sm:text-sm">
                  {window.location.origin}/api/chat
                </span>
              </div>
              <pre className="text-gray-300 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all md:whitespace-pre md:break-normal">
                <span className="text-pink-400">curl</span> -X POST{" "}
                <span className="text-green-300">
                  "{window.location.origin}/api/chat"
                </span>{" "}
                \ -H{" "}
                <span className="text-green-300">
                  "Authorization: Bearer YOUR_RUTECLIEN_API_KEY"
                </span>{" "}
                \ -H{" "}
                <span className="text-green-300">
                  "Content-Type: application/json"
                </span>{" "}
                \ -d <span className="text-yellow-300">'{"{"}</span>
                <span className="text-indigo-300">"model"</span>:{" "}
                <span className="text-green-300">
                  "stepfun-ai/step-3.7-flash"
                </span>
                ,<span className="text-indigo-300">"messages"</span>: [{"{"}
                <span className="text-indigo-300">"role"</span>:{" "}
                <span className="text-green-300">"user"</span>,
                <span className="text-indigo-300">"content"</span>:{" "}
                <span className="text-green-300">
                  "Hello! What can you do?"
                </span>
                {"}"}]<span className="text-yellow-300">{"}"}'</span>
              </pre>
            </div>
          </motion.div>

          {/* Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12 relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search available endpoints and models..."
              className="w-full bg-[#050505] border border-white/10 rounded-xl py-4 pl-14 pr-6 text-gray-200 text-base font-light focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>

          {/* Model Groups */}
          <div className="space-y-16 pb-20">
            {Object.keys(groupedModels).length === 0 && (
              <div className="text-center text-gray-500 py-10 font-light">
                No matching models found.
              </div>
            )}
            {Object.entries(groupedModels).map(([groupName, models], index) => (
              <motion.div
                key={groupName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                  <div className={getCategoryColors(groupName).icon}>
                    {getCategoryIcon(groupName)}
                  </div>
                  <h3 className="text-xl font-serif text-gray-200 tracking-wide">
                    {groupName}
                  </h3>
                  <div className="ml-2 text-xs font-mono bg-white/5 text-gray-400 px-2 py-0.5 rounded-full border border-white/10">
                    {models.length} models
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {models.map((model) => {
                    const colors = getCategoryColors(groupName);
                    return (
                      <div
                        key={model.id}
                        onClick={() => handleSelectModel(model.id)}
                        className={`group relative border ${colors.border} rounded-2xl p-5 cursor-pointer overflow-hidden transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                      >
                        <div
                          className={`absolute top-0 left-0 w-1 h-full transition-colors ${colors.bar}`}
                        />

                        <div className="flex flex-col gap-2 relative z-10 w-full">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 tracking-wider">
                              POST
                            </span>
                            <span className="font-mono text-sm text-gray-400">
                              /api/chat
                            </span>
                          </div>
                          <h4 className="text-gray-100 font-medium text-lg font-serif">
                            {model.id}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto relative z-10 shrink-0 gap-4">
                          <div className="flex items-center gap-2 bg-emerald-500/5 text-emerald-400/80 px-2.5 py-1 rounded-md text-[11px] font-mono border border-emerald-500/10">
                            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                            <span className="hidden sm:inline">Active</span>
                          </div>
                          <div className="text-indigo-400/0 group-hover:text-indigo-400 transition-colors flex items-center text-sm font-light gap-1">
                            Test API{" "}
                            <ChevronLeft className="w-4 h-4 rotate-180" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-screen bg-[#020202] text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-5 border-b border-white/5 bg-[#020202]/80 backdrop-blur-xl z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView("dashboard")}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="hidden sm:flex p-2 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
            <Terminal className="w-5 h-5 text-indigo-400" />
          </div>
          <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100 hidden sm:block">
            API Playground
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("get-key")}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Get Key</span>
          </button>

          <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Connected
          </div>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-[#050505] border border-white/10 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/50 max-w-[200px] sm:max-w-[300px] truncate text-indigo-50 font-light hover:bg-white/5 transition-colors cursor-pointer appearance-none shadow-sm"
          >
            {Object.keys(groupedModels).length > 0 ? (
              Object.entries(groupedModels).map(([category, models]) => (
                <optgroup
                  key={category}
                  label={category}
                  className="bg-[#111] text-indigo-400 font-semibold"
                >
                  {models.map((model) => (
                    <option
                      key={model.id}
                      value={model.id}
                      className="text-gray-200 font-sans font-normal bg-[#0a0a0a]"
                    >
                      {model.id}
                    </option>
                  ))}
                </optgroup>
              ))
            ) : (
              <>
                <option value={selectedModel}>{selectedModel}</option>
              </>
            )}
          </select>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2.5 rounded-xl transition-all ${
              showSettings
                ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                : "bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10"
            }`}
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </header>
      {/* Main Content Area with potential Settings Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-8 pb-20">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[55vh] text-center opacity-70">
                  <div className="p-5 bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full mb-6 border border-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.05)]">
                    <Box className="w-12 h-12 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-medium mb-4 text-indigo-50">
                    Testing Endpoint: {selectedModel}
                  </h2>
                  <p className="text-base text-gray-400 max-w-md font-light leading-relaxed">
                    Send a payload request to this API endpoint to see the
                    response. You can attach images for Vision models.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[90%] md:max-w-[85%] rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md ${
                        msg.role === "user"
                          ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-50 rounded-br-sm"
                          : "bg-white/5 border border-white/10 text-gray-200 rounded-bl-sm"
                      }`}
                    >
                      {msg.image && (
                        <div className="mb-5 rounded-2xl overflow-hidden max-w-sm border border-white/10 shadow-lg">
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}

                      {msg.reasoning && (
                        <div className="mb-5 p-4 bg-black/40 rounded-2xl border border-white/5 text-sm text-gray-400 flex flex-col gap-3 shadow-inner">
                          <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs uppercase tracking-widest font-mono">
                            <BrainCircuit className="w-4 h-4" />
                            Thinking Process
                          </div>
                          <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed opacity-80">
                            {msg.reasoning}
                          </div>
                        </div>
                      )}

                      {msg.content ? (
                        <div className="prose prose-invert prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-headings:font-serif break-words">
                          <ReactMarkdown
                            components={{
                              img: ({ node, ...props }) => (
                                <img {...props} referrerPolicy="no-referrer" />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : msg.role === "assistant" && isGenerating ? (
                        <div className="flex items-center gap-3 text-indigo-400/80 py-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm tracking-wide font-light">
                            Awaiting API Response...
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 bg-gradient-to-t from-[#020202] via-[#020202]/95 to-transparent border-t border-white/5 relative">
            <div className="max-w-4xl mx-auto">
              {!userId.trim() || !userApiKey.trim() ? (
                <div className="bg-[#050505] border border-amber-500/20 rounded-3xl p-8 flex flex-col md:flex-row gap-6 items-center shadow-2xl backdrop-blur-md">
                  <div className="p-4 bg-amber-500/10 text-amber-400 rounded-full shrink-0">
                    <Key className="w-8 h-8" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-medium text-amber-200 mb-2">Key Required for Testing</h3>
                    <p className="text-gray-400 text-sm mb-4">You need an API Key and User ID to send messages. Please configure them in the dashboard.</p>
                    <button 
                      onClick={() => setView("dashboard")}
                      className="bg-amber-500 hover:bg-amber-400 text-gray-900 px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
                    >
                      Go to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-4 bg-red-950/30 border border-red-500/30 text-red-300 text-sm rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
                      <span className="break-words mr-4">{error}</span>
                      <button
                        onClick={() => setError(null)}
                        className="shrink-0 hover:bg-red-500/20 p-1 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Media Preview */}
              <AnimatePresence>
                {media.previewUrl && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="relative inline-block"
                  >
                    <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50 max-h-48 shadow-xl">
                      {media.type === "image" ? (
                        <img
                          src={media.previewUrl}
                          alt="Preview"
                          className="h-48 w-auto object-contain"
                        />
                      ) : (
                        <video
                          ref={videoRef}
                          src={media.previewUrl}
                          controls
                          className="h-48 w-auto object-contain"
                          crossOrigin="anonymous"
                        />
                      )}
                      <button
                        onClick={clearMedia}
                        className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-all shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                className="relative flex items-end gap-3 bg-[#050505] border border-white/10 rounded-[2rem] p-2 focus-within:border-indigo-500/40 focus-within:bg-[#0a0a0a] transition-all duration-300 shadow-2xl backdrop-blur-xl"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                />
                <canvas ref={canvasRef} className="hidden" />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors ml-1"
                  title="Upload image or video"
                >
                  <Upload className="w-5 h-5" />
                </button>

                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Send a payload to the API..."
                  className="flex-1 max-h-48 min-h-[44px] bg-transparent border-none text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-0 resize-none py-4 text-base font-light"
                  rows={1}
                  style={{ height: "auto" }}
                />

                <button
                  type="submit"
                  disabled={isGenerating || (!input.trim() && !media.file)}
                  className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-full hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:from-white/10 disabled:to-white/5 disabled:text-gray-500 transition-all shadow-lg shadow-indigo-900/20 mr-1"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
              </>
              )}
            </div>
          </div>
        </div>{" "}
        {/* End Chat Column */}
        {/* Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="border-l border-white/5 bg-[#050505] overflow-y-auto custom-scrollbar shrink-0 h-full relative"
            >
              <div className="w-[320px] p-6 space-y-8 absolute top-0 left-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-gray-200 font-medium">
                    <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                    Parameters
                  </div>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* System Prompt */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-300">
                    System Prompt
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none h-32 transition-all"
                  />
                </div>

                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium text-gray-300">
                      Temperature
                    </label>
                    <span className="text-gray-500 font-mono">
                      {temperature.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium text-gray-300">
                      Max Tokens
                    </label>
                    <span className="text-gray-500 font-mono">{maxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="16384"
                    step="1"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                {/* Top P */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <label className="font-medium text-gray-300">Top P</label>
                    <span className="text-gray-500 font-mono">
                      {topP.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <p className="text-xs text-gray-500 font-light leading-relaxed">
                    These parameters will be sent directly to the selected
                    RUTEclien endpoint with your next request.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>{" "}
      {/* End Main Content Wrapper */}
    </div>
  );
}
