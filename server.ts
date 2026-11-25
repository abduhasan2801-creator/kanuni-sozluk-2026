import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { attachJsonErrorMiddleware, createApiApp } from './src/server/app.ts';

async function startServer() {
  const app = createApiApp({ attachApiFallbackHandlers: false });
  const PORT = Number(process.env.PORT || 3000);

  // Vite / Static Frontend Serving
  const distDir = path.resolve(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(distDir);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(expressStaticWithSpa(distDir));
  }

  attachJsonErrorMiddleware(app);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AHD Kanuni Sözlük server listening on http://0.0.0.0:${PORT}`);
  });
}

import express from 'express';

function expressStaticWithSpa(distDir: string) {
  const router = express.Router();
  router.use(express.static(distDir));
  router.use((req, res, next) => {
    if ((req.method !== 'GET' && req.method !== 'HEAD') || req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
  return router;
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
