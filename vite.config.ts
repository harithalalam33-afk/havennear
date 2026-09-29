import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function n8nProxyPlugin(): Plugin {
  return {
    name: 'n8n-proxy',
    configureServer(server) {
      server.middlewares.use('/api/n8n-chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}');
            const targetUrl =
              data.webhookUrl ||
              'https://harithalalam.app.n8n.cloud/webhook/b8f061d0-ddcd-4725-a42b-56d891fea6cc/chat';

            const payload = {
              chatInput: data.message || data.chatInput || '',
              message: data.message || data.chatInput || '',
              sessionId: data.sessionId || `haven-session-${Date.now()}`,
              propertyId: data.property?.id,
              propertyTitle: data.property?.title,
              propertyAddress: data.property?.address,
              propertyPrice: data.property?.price,
              propertyNeighborhood: data.property?.neighborhood,
              landlordName: data.landlord?.name,
              property: data.property,
              landlord: data.landlord,
            };

            const n8nRes = await fetch(targetUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            const text = await n8nRes.text();
            let parsed: any;
            try {
              parsed = JSON.parse(text);
            } catch {
              parsed = { output: text };
            }

            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                status: n8nRes.status,
                ok: n8nRes.ok,
                data: parsed,
                targetUrl,
              })
            );
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Proxy error' }));
          }
        });
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), n8nProxyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

