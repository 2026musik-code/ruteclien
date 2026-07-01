import { Hono } from "hono";

type Bindings = {
  accounts_kv: any;
  NVIDIA_API_KEY: string;
  ADMIN_TOKEN: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath('/api');

let localAdminToken = typeof process !== 'undefined' && process.env.ADMIN_TOKEN ? process.env.ADMIN_TOKEN : "admin123";
let localKeys: any[] = [];

async function getAdminToken(c: any) {
  if (c.env?.accounts_kv) {
    const token = await c.env.accounts_kv.get("adminToken");
    if (token) return token;
  }
  return c.env?.ADMIN_TOKEN || (typeof process !== 'undefined' ? process.env.ADMIN_TOKEN : undefined) || localAdminToken;
}

async function saveAdminToken(c: any, token: string) {
  if (c.env?.accounts_kv) {
    await c.env.accounts_kv.put("adminToken", token);
  } else {
    localAdminToken = token;
  }
}

async function getApiKeys(c: any) {
  if (c.env?.accounts_kv) {
    try {
      const keys = await c.env.accounts_kv.get("apiKeys");
      return keys ? JSON.parse(keys) : [];
    } catch (e) {
      console.error("Failed to parse apiKeys from KV:", e);
      return [];
    }
  }
  return localKeys;
}

async function saveApiKeys(c: any, keys: any) {
  if (c.env?.accounts_kv) {
    await c.env.accounts_kv.put("apiKeys", JSON.stringify(keys));
  } else {
    localKeys = keys;
  }
}

// Middleware to verify admin token
app.use('/admin/*', async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized. Admin token required." }, 401);
  }
  const token = authHeader.split(" ")[1];
  const adminToken = await getAdminToken(c);
  if (token !== adminToken) {
    return c.json({ error: "Forbidden. Invalid admin token." }, 403);
  }
  await next();
});

// Admin Routes for API Keys
app.get("/admin/keys", async (c) => {
  const keys = await getApiKeys(c);
  return c.json(keys);
});

app.post("/admin/keys", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body && body.keys) {
    await saveApiKeys(c, body.keys);
    return c.json({ success: true });
  }
  return c.json({ error: "Invalid payload" }, 400);
});

app.post("/admin/token", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (body && body.newToken) {
    await saveAdminToken(c, body.newToken);
    return c.json({ success: true });
  }
  return c.json({ error: "Invalid payload" }, 400);
});

app.post("/admin/verify", async (c) => {
  return c.json({ valid: true });
});

app.get("/models", async (c) => {
  try {
    const apiKey = c.env?.NVIDIA_API_KEY || (typeof process !== 'undefined' ? process.env.NVIDIA_API_KEY : undefined);
    if (!apiKey) {
       return c.json({ error: "NVIDIA_API_KEY is not configured in environment." }, 500);
    }
    const response = await fetch("https://integrate.api.nvidia.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) throw new Error("Failed to fetch models");
    const data = await response.json();
    return c.json(data);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

app.post("/chat", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    const clientId = c.req.header("x-user-id");
    if (!authHeader || !authHeader.startsWith("Bearer ") || !clientId) {
      return c.json(
        {
          error:
            "Unauthorized. Please provide a valid User ID (x-user-id header) and API Key (Authorization header).",
        },
        401
      );
    }
    const clientKey = authHeader.split(" ")[1];

    const apiKeys = await getApiKeys(c);
    const keyRecord = apiKeys.find(
      (k: any) => k.id === clientId && k.key === clientKey
    );

    if (!keyRecord) {
      return c.json(
        {
          error:
            "Invalid User ID or API Key. Please purchase a valid credential or generate one in the Admin panel.",
        },
        401
      );
    }

    if (keyRecord.usage >= keyRecord.limit) {
      return c.json(
        {
          error: `API Key limit reached (${keyRecord.limit} requests). Please upgrade or purchase a new key.`,
        },
        403
      );
    }

    const body = await c.req.json().catch(() => ({}));
    const { messages, model, temperature, max_tokens, top_p, system_prompt } = body;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array is required" }, 400);
    }

    // Handle Image Generation using Pollinations AI
    if (model === "image-generation") {
      keyRecord.usage += 1;
      await saveApiKeys(c, apiKeys);

      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage.content;
      const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(
        prompt
      )}?width=1024&height=1024&nologo=true`;

      return new Response(
        `data: ${JSON.stringify({
          choices: [
            {
              delta: {
                content: `Here is your generated image for "${prompt}":\n\n![Generated Image](${imageUrl})`,
              },
            },
          ],
        })}\n\ndata: [DONE]\n\n`,
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }
      );
    }

    // Handle Video Generation Placeholder
    if (model === "video-generation") {
      keyRecord.usage += 1;
      await saveApiKeys(c, apiKeys);

      const lastMessage = messages[messages.length - 1];
      const prompt = lastMessage.content;

      return new Response(
        `data: ${JSON.stringify({
          choices: [
            {
              delta: {
                content: `Video generation for "${prompt}" is simulated in this preview. In a production environment, you would integrate a video API like Luma Dream Machine, RunwayML, or Kling AI here.`,
              },
            },
          ],
        })}\n\ndata: [DONE]\n\n`,
        {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          },
        }
      );
    }

    const apiKey = c.env?.NVIDIA_API_KEY || (typeof process !== 'undefined' ? process.env.NVIDIA_API_KEY : undefined);
    if (!apiKey) {
      return c.json({ error: "NVIDIA_API_KEY is not configured in environment." }, 500);
    }

    const formattedMessages = messages.map((m: any) => {
      if (m.role === "user") {
        if (m.image) {
          return {
            role: "user",
            content: [
              { type: "text", text: m.content || "Analyze this." },
              { type: "image_url", image_url: { url: m.image } },
            ],
          };
        } else {
          return {
            role: "user",
            content: m.content,
          };
        }
      } else {
        return {
          role: "assistant",
          content: m.content,
        };
      }
    });

    if (system_prompt) {
      formattedMessages.unshift({ role: "system", content: system_prompt });
    }

    const payload: any = {
      model: model || "stepfun-ai/step-3.7-flash",
      messages: formattedMessages,
      temperature: temperature !== undefined ? temperature : 0.6,
      top_p: top_p !== undefined ? top_p : 0.95,
      max_tokens: max_tokens !== undefined ? max_tokens : 4096,
      stream: true,
    };

    const response = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      if (response.status === 404) {
        throw new Error(
          `The selected model '${payload.model}' is not supported for this type of request or is unavailable for your account.`
        );
      }
      throw new Error(`NVIDIA API Error: ${response.status} - ${errorData}`);
    }

    keyRecord.usage += 1;
    await saveApiKeys(c, apiKeys);

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;
