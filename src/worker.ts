import { Hono } from "hono";
import apiApp from "./api";

const app = new Hono<{ Bindings: { ASSETS: any } }>();

app.route("/api", apiApp);

// SPA fallback: any route that doesn't match an API route or an existing asset
// will reach here. We serve the index.html from the ASSETS binding.
app.get("*", async (c) => {
  const url = new URL(c.req.url);
  url.pathname = "/";
  return c.env.ASSETS.fetch(new Request(url.toString(), c.req.raw));
});

export default app;
