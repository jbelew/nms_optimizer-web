
import fs from 'fs';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';

const __dirname = path.resolve();

async function createServer() {
  const app = express();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist/client')));

    app.use((req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/client/index.html'));
    });
  } else {
    // Create Vite server in development mode
    const vite = await createViteServer({
      server: { middlewareMode: 'ssr' },
    });
    // use vite's connect instance as middleware
    app.get('*', async (req, res) => {
      const url = req.originalUrl;

      try {
        // 1. Read index.html
        let template = fs.readFileSync(
          path.resolve(__dirname, 'index.html'),
          'utf-8',
        );

        // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
        //    also applies HTML transforms from Vite plugins, e.g. global preambles
        //    from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);

        // 3. Load the server entry. vite.ssrLoadModule automatically transforms
        //    your ESM source code to be usable in Node.js! There is no bundling
        //    required, and provides efficient invalidation similar to HMR.
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');

        // 4. render the app HTML. This assumes entry-server.js's exported `render`
        //    function calls appropriate framework SSR APIs, e.g. ReactDOMServer.renderToString()
        const appHtml = await render(url, {});

        // 5. Inject the app-rendered HTML into the template.
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);

        // 6. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        // If an error is caught, let Vite fix the stacktrace so it maps back to
        // your actual source code.
        vite.ssrFixStacktrace(e);
        console.error(e);
        res.status(500).end(e.message);
      }
    });
  }

  app.listen(5173, () => {
    console.log('Server listening on http://localhost:5173');
  });
}

createServer();
