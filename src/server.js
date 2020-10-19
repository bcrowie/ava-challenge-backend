const WebSocket = require("ws");
let { conversations } = require("./routes/mutations");
const http = require("http");
const handleRequest = require("./routes/main");
const { wsCreate, wsDelete, wsMutate } = require("./routes/conversations");
const port = process.env.PORT || 5000;
const server = http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Headers", "https://ava.app.me");
    handleRequest(req, res);
  })
  .listen(port);

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.op === "get-all") {
      ws.send(JSON.stringify(conversations));
    } else if (data.op === "create") {
      const created = wsCreate(data, ws);
      created && ws.send(JSON.stringify({ op: "create", created }));
    } else if (data.op === "mutate") {
      const result = wsMutate(data, ws);
      ws.send(JSON.stringify(result));
    } else if (data.op === "delete") {
      wsDelete(data);
    }
  });
});

module.exports = server;
