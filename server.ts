import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import fs from 'fs';
import path from 'path';
import apiApp from './src/api';

const app = new Hono();

// Mount the API
app.route('/api', apiApp);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/*', serveStatic({ root: './dist' }));
  
  // SPA fallback
  app.get('*', (c) => {
    const index = fs.readFileSync(path.join(process.cwd(), 'dist', 'index.html'), 'utf-8');
    return c.html(index);
  });
}

const port = process.env.NODE_ENV === 'production' ? 3000 : 3001;

serve({
  fetch: app.fetch,
  port: port
}, (info) => {
  console.log(`Hono Server running on http://0.0.0.0:${info.port}`);
});
