import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  ChevronLeft,
  Settings2,
  Copy,
  Check
} from "lucide-react";

export default function AdminApp() {
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem("ruteclien_admin_token") || "";
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [apiKeys, setApiKeys] = useState<
    Array<{ id: string; key: string; limit: number; usage: number }>
  >([]);
  const [globals, setGlobals] = useState<Record<string, string>>({});
  const [availableModels, setAvailableModels] = useState<{ id: string }[]>([]);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingLimit, setEditingLimit] = useState<number>(0);
  const [error, setError] = useState("");
  const [newTokenInput, setNewTokenInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [unlimitedPrice, setUnlimitedPrice] = useState(() => {
    return localStorage.getItem("ruteclien_unlimited_price") || "Rp 150.000";
  });

  const handlePriceChange = (newPrice: string) => {
    setUnlimitedPrice(newPrice);
    localStorage.setItem("ruteclien_unlimited_price", newPrice);
  };

  useEffect(() => {
    if (adminToken) {
      verifyToken(adminToken);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setError("");
        fetchKeys(token);
        fetchGlobals(token);
        fetchModels(token);
      } else {
        setIsAuthenticated(false);
        setError("Invalid Admin Token");
      }
    } catch (e) {
      setError("Failed to verify token");
    }
  };

  const fetchModels = async (token: string) => {
    try {
      const res = await fetch("/api/custom-models", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAvailableModels(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch models");
    }
  };

  const saveModels = async (models: { id: string }[]) => {
    setAvailableModels(models);
    try {
      await fetch("/api/admin/custom-models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ models }),
      });
    } catch (e) {
      console.error("Failed to save models to backend");
    }
  };

  const fetchKeys = async (token: string) => {
    try {
      const res = await fetch("/api/admin/keys", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setApiKeys(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch keys");
    }
  };

  const fetchGlobals = async (token: string) => {
    try {
      const res = await fetch("/api/admin/globals", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGlobals(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch globals");
    }
  };

  const saveGlobals = async (newGlobals: Record<string, string>) => {
    setGlobals(newGlobals);
    try {
      await fetch("/api/admin/globals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ globals: newGlobals }),
      });
    } catch (e) {
      console.error("Failed to save globals to backend");
    }
  };

  const saveApiKeys = async (
    keys: Array<{ id: string; key: string; limit: number; usage: number }>,
  ) => {
    setApiKeys(keys);
    try {
      await fetch("/api/admin/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ keys }),
      });
    } catch (e) {
      console.error("Failed to save keys to backend");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("ruteclien_admin_token", adminToken);
    verifyToken(adminToken);
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

  const handleChangeAdminToken = async () => {
    if (!newTokenInput) return;
    try {
      const res = await fetch("/api/admin/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ newToken: newTokenInput }),
      });
      if (res.ok) {
        setAdminToken(newTokenInput);
        localStorage.setItem("ruteclien_admin_token", newTokenInput);
        setNewTokenInput("");
        alert("Admin token updated successfully!");
      } else {
        alert("Failed to update token.");
      }
    } catch (e) {
      alert("Error updating token.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#04120a] text-white">
        <form
          onSubmit={handleLogin}
          className="bg-[#061a0f] border border-emerald-500/20 p-8 rounded-2xl w-full max-w-md shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-500/20">
              <Settings2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-serif">Admin Login</h1>
          </div>
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-500/20">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                className="w-full bg-[#082414] border border-emerald-500/20 rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500/50"
                placeholder="Enter admin token..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Access Dashboard
            </button>
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="w-full bg-white/5 hover:bg-emerald-500/20 text-gray-300 font-medium py-3 rounded-xl transition-colors"
            >
              Back to App
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04120a] text-gray-100 font-sans selection:bg-emerald-500/30">
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-emerald-500/10 bg-[#04120a]/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (window.location.href = "/")}
            className="p-2 hover:bg-emerald-500/20 rounded-full transition-colors text-gray-400 hover:text-white mr-2"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <Settings2 className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="font-serif font-semibold text-xl tracking-wide text-gray-100">
            Admin <span className="font-light text-gray-500">Panel</span>
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-serif mb-3">Admin Dashboard</h2>
          <p className="text-gray-400 font-light">
            Configure application parameters and manage user API keys.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-[#061a0f] border border-emerald-500/10 rounded-2xl p-8 relative overflow-hidden group">
            <h3 className="text-xl font-serif text-gray-200 mb-6">
              Security Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Change Admin Token
                </label>
                <div className="flex gap-4">
                  <input
                    type="password"
                    value={newTokenInput}
                    onChange={(e) => setNewTokenInput(e.target.value)}
                    placeholder="New admin token"
                    className="flex-1 bg-[#082414] border border-emerald-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <button
                    onClick={handleChangeAdminToken}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl transition-colors font-medium whitespace-nowrap"
                  >
                    Update Token
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#061a0f] border border-emerald-500/10 rounded-2xl p-8 relative overflow-hidden group">
            <h3 className="text-xl font-serif text-gray-200 mb-6">
              Pricing Settings
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Unlimited Key Price
                </label>
                <input
                  type="text"
                  value={unlimitedPrice}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="e.g. Rp 150.000"
                  className="w-full bg-[#082414] border border-emerald-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2 font-light">
                  This price will be displayed on the GET KEY page.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#061a0f] border border-emerald-500/10 rounded-2xl p-8 relative overflow-hidden group">
            <h3 className="text-xl font-serif text-gray-200 mb-6">
              Model Management
            </h3>
            
            <div className="bg-[#082414] border border-emerald-500/10 rounded-2xl p-6 mb-8">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Add Custom Model</h4>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  id="newModelId"
                  placeholder="e.g. nvidia/llama-3.1-nemotron-70b-instruct" 
                  className="flex-1 bg-[#0c331d] border border-emerald-500/20 rounded-xl px-4 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.currentTarget;
                      const newModel = input.value.trim();
                      if (newModel && !availableModels.find(m => m.id === newModel)) {
                        const newModels = [...availableModels, { id: newModel }];
                        saveModels(newModels);
                        input.value = '';
                      }
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const input = document.getElementById('newModelId') as HTMLInputElement;
                    const newModel = input.value.trim();
                    if (newModel && !availableModels.find(m => m.id === newModel)) {
                      const newModels = [...availableModels, { id: newModel }];
                      saveModels(newModels);
                      input.value = '';
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Add Model
                </button>
              </div>
            </div>

            <div className="bg-[#082414] border border-emerald-500/10 rounded-2xl p-6">
              <h4 className="text-sm font-medium text-gray-300 mb-4">Available Models</h4>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {availableModels.map(model => (
                  <div key={model.id} className="flex items-center justify-between p-3 bg-[#0c331d] border border-emerald-500/10 rounded-xl">
                    <span className="text-sm font-mono text-gray-300">{model.id}</span>
                    <button 
                      onClick={() => {
                        const newModels = availableModels.filter(m => m.id !== model.id);
                        saveModels(newModels);
                      }}
                      className="p-2 hover:bg-red-500/10 text-red-500/70 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[#061a0f] border border-emerald-500/10 rounded-2xl p-8 relative overflow-hidden group">
            <h3 className="text-xl font-serif text-gray-200 mb-6">
              Global API Keys & Tokens
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  NVIDIA API Key
                </label>
                <div className="flex gap-4">
                  <input
                    type="password"
                    value={globals['NVIDIA_API_KEY'] || ""}
                    onChange={(e) => setGlobals({...globals, 'NVIDIA_API_KEY': e.target.value})}
                    placeholder="sk-..."
                    className="flex-1 bg-[#082414] border border-emerald-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <button
                    onClick={() => saveGlobals(globals)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl transition-colors font-medium whitespace-nowrap"
                  >
                    Save Key
                  </button>
                  <button
                    onClick={() => {
                      const newGlobals = { ...globals };
                      delete newGlobals['NVIDIA_API_KEY'];
                      saveGlobals(newGlobals);
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-3 rounded-xl transition-colors font-medium whitespace-nowrap"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-light">
                  This key is used globally for NVIDIA API calls if not set in environment variables.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#061a0f] border border-emerald-500/10 rounded-2xl p-8 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-serif text-gray-200">
                User API Keys
              </h3>
              <button
                onClick={generateApiKey}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Generate Token
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-500/10 text-gray-400 text-sm">
                    <th className="py-3 px-4 font-medium">User ID</th>
                    <th className="py-3 px-4 font-medium">API Key</th>
                    <th className="py-3 px-4 font-medium">Usage / Limit</th>
                    <th className="py-3 px-4 font-medium text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr
                      key={k.id}
                      className="border-b border-emerald-500/10 last:border-0 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-4 px-4 font-mono text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          {k.id}
                          <button onClick={() => handleCopy(k.id, `id-${k.id}`)} className="text-gray-500 hover:text-gray-300">
                            {copiedId === `id-${k.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          {k.key.substring(0, 15)}...
                          <button onClick={() => handleCopy(k.key, `key-${k.id}`)} className="text-gray-500 hover:text-gray-300">
                            {copiedId === `key-${k.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-300">
                        {editingKeyId === k.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500">{k.usage} /</span>
                            <input
                              type="number"
                              value={editingLimit}
                              onChange={(e) =>
                                setEditingLimit(parseInt(e.target.value) || 0)
                              }
                              className="w-24 bg-[#082414] border border-emerald-500/20 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        ) : (
                          <span>
                            {k.usage.toLocaleString()} /{" "}
                            {k.limit.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingKeyId === k.id ? (
                            <button
                              onClick={() => {
                                updateApiKeyLimit(k.id, editingLimit);
                                setEditingKeyId(null);
                              }}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingKeyId(k.id);
                                setEditingLimit(k.limit);
                              }}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 rounded transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteApiKey(k.id)}
                            className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500 font-light"
                      >
                        No API keys found. Generate one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
