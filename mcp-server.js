/**
 * Model Context Protocol (MCP) Server for Martabak Gresik
 * Memungkinkan AI Agent (seperti Claude Desktop) untuk mengakses katalog menu dan status toko.
 * 
 * Cara jalankan: node mcp-server.js
 */

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");

const API_URL = "https://martabak-gresik-katalog.vercel.app/api/menu";

const server = new Server(
  {
    name: "martabak-gresik-catalog",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_menu",
        description: "Mendapatkan daftar lengkap menu Martabak Gresik beserta harga dan status toko.",
        inputSchema: { type: "object", properties: {} },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_menu") {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "Gagal mengambil data menu." }],
        isError: true,
      };
    }
  }
  throw new Error("Tool not found");
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Martabak Gresik MCP Server running on stdio");
}

main().catch(console.error);
