// Passenger (cPanel's Node runner) requires a plain JS entry file — it
// doesn't run `npm start` directly, so this wraps Next.js's production
// server and listens on whatever port Passenger assigns via process.env.PORT.
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const hostname = "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, () => {
    console.log(`> Omama Finance site ready on port ${port}`);
  });
});