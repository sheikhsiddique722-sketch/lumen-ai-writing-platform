const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const GROQ_API_KEY = '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';
const PORT = 3000;

// Root is one level up from this file (js/)
const ROOT = path.join(__dirname, '..');

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // AI proxy — Groq (FREE, super fast)
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const systemMsg = data.system || 'You are Lumen, an intelligent AI writing assistant. Help users write, improve, and refine their work. Be concise, elegant, and match the user\'s tone.';

        const payload = JSON.stringify({
          model: 'llama-3.1-8b-instant',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: systemMsg },
            ...data.messages
          ]
        });

        const options = {
          hostname: 'api.groq.com',
          path: '/openai/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload),
            'Authorization': 'Bearer ' + GROQ_API_KEY
          }
        };

        const apiReq = https.request(options, apiRes => {
          let resp = '';
          apiRes.on('data', c => resp += c);
          apiRes.on('end', () => {
            try {
              const json = JSON.parse(resp);
              if (json.error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: json.error.message }));
              } else {
                const text = json.choices[0].message.content;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ content: [{ text }] }));
              }
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Parse error: ' + e.message }));
            }
          });
        });

        apiReq.on('error', e => {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        });

        apiReq.write(payload);
        apiReq.end();
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Bad request' }));
      }
    });
    return;
  }

  // Serve static files from project root
  const filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\x1b[36m');
  console.log('  ✦ Lumen is running');
  console.log('  → Open: http://localhost:' + PORT);
  console.log('  → AI:   Groq LLaMA 3.1 (FREE)');
  console.log('\x1b[0m');
});
