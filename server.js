/* eslint-disable @typescript-eslint/no-require-imports */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: { origin: "*" },
  });

  global.sheeaseIO = io;

  io.on("connection", (socket) => {
    socket.on("join:booking", (bookingId) => {
      if (bookingId) socket.join(`booking:${bookingId}`);
    });
    socket.on("join:user", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> SheEase ready on http://${hostname}:${port}`);
  });
});
