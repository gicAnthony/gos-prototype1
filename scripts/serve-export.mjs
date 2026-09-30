import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";

const outputRoot = resolve(process.cwd(), "out");
const basePath = "/gos-prototype1";
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

if (!existsSync(join(outputRoot, "index.html"))) {
  console.error("No static export found. Run `npm run build` before `npm start`.");
  process.exit(1);
}

function sendFile(response, filePath) {
  const extension = extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    "Cache-Control": filePath.includes(`${sep}_next${sep}`)
      ? "public, max-age=31536000, immutable"
      : "no-cache",
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end("Bad request");
    return;
  }

  if (pathname === "/") {
    response.writeHead(302, { Location: `${basePath}/login/` }).end();
    return;
  }
  if (pathname === basePath) {
    response.writeHead(308, { Location: `${basePath}/` }).end();
    return;
  }
  if (!pathname.startsWith(`${basePath}/`)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
    return;
  }

  const relativePath = pathname.slice(basePath.length + 1);
  let filePath = resolve(outputRoot, relativePath);
  if (filePath !== outputRoot && !filePath.startsWith(`${outputRoot}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    if (statSync(filePath).isDirectory()) filePath = join(filePath, "index.html");
    if (statSync(filePath).isFile()) {
      sendFile(response, filePath);
      return;
    }
  } catch {
    // Fall through to the exported 404 page.
  }

  const notFound = join(outputRoot, "404.html");
  response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  createReadStream(notFound).pipe(response);
});

server.listen(port, host, () => {
  console.log(`GOS static export ready at http://localhost:${port}${basePath}/login/`);
});
