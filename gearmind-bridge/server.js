import express from 'express';
import cors from 'cors';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const app = express();
app.use(cors());
app.use(express.json());

let mcpClient;

async function connectToMCP() {
  const transport = new SSEClientTransport(new URL('http://localhost:3000/sse'));
  mcpClient = new Client(
    { name: 'gearmind-dashboard-bridge', version: '1.0.0' },
    { capabilities: {} }
  );
  await mcpClient.connect(transport);
  console.log('✅ Connected to Gearmind MCP server');
}

// Call any tool by name with arguments
app.post('/api/call-tool', async (req, res) => {
  const { toolName, args } = req.body;
  try {
    const result = await mcpClient.callTool({ name: toolName, arguments: args || {} });
    res.json(result);
  } catch (err) {
    console.error('Tool call failed:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// List all available tools (useful for building the dashboard)
app.get('/api/tools', async (req, res) => {
  try {
    const result = await mcpClient.listTools();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(4000, async () => {
  console.log('Bridge server running on http://localhost:4000');
  await connectToMCP();
});