
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { getShipTypes, getTechTree } from './data.js';

const __dirname = path.resolve();
const isProd = process.env.NODE_ENV === 'production' || process.env.VITEST;

async function createServer(distPath = path.resolve(__dirname, 'dist')) {
  const app = express();

  // Middleware to remove trailing slashes
  app.use((req, res, next) => {
    if (req.path.length > 1 && req.path.endsWith('/')) {
      const newPath = req.path.slice(0, -1);
      const query = req.url.slice(req.path.length);
      res.redirect(301, newPath + query);
    } else {
      next();
    }
  });

  let vite;
  if (!isProd) {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(distPath, 'client'), { index: false }));
  }

  app.get(/.*/, async (req, res, next) => {
    const url = req.originalUrl;

    try {
      let template;
      let render;

      if (!isProd) {
        template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        template = fs.readFileSync(path.resolve(distPath, 'client/index.html'), 'utf-8');
        render = (await import(path.resolve(distPath, 'server/entry-server.js'))).render;
      }

      const shipTypes = await getShipTypes();
      const techTree = await getTechTree('standard'); // Hardcoded for now

      const appHtml = await render(url, { shipTypes, techTree });
      const html = template.replace(`<!--ssr-outlet-->`, appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.error(e);
      next(e);
    }
  });

  return app;
}

export { createServer };
