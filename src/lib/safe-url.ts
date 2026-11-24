import { lookup } from "dns/promises";
import https from "https";
import { isIP } from "net";

function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const parts = address.split(".").map(Number);
    const [a, b] = parts;
    return !(a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) ||
      (a === 192 && (b === 0 || b === 88 || (b === 2 && parts[2] === 0))) ||
      (a === 198 && (b === 18 || b === 19 || (b === 51 && parts[2] === 100))) ||
      (a === 203 && b === 0 && parts[2] === 113));
  }
  if (isIP(address) === 6) {
    const normalized = address.toLowerCase();
    if (normalized.startsWith("::ffff:")) return isPublicAddress(normalized.slice(7));
    return !(normalized === "::" || normalized === "::1" || normalized.startsWith("fc") ||
      normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") ||
      normalized.startsWith("fea") || normalized.startsWith("feb") || normalized.startsWith("ff") ||
      normalized.startsWith("2001:db8:"));
  }
  return false;
}

function allowedHosts(): Set<string> {
  return new Set((process.env.URL_IMPORT_ALLOWED_HOSTS || "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean));
}

export async function safeFetchUrl(input: string): Promise<{ status: number; contentType: string; body: string }> {
  const url = new URL(input);
  if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443") {
    throw new Error("Only credential-free HTTPS URLs on port 443 are allowed");
  }
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!allowedHosts().has(host) || isIP(host)) throw new Error("Host is not on the URL import allowlist");

  const addresses = await lookup(host, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => !isPublicAddress(address))) {
    throw new Error("Host resolves to a non-public address");
  }
  const destination = addresses[0];
  return new Promise((resolve, reject) => {
    const request = https.request({
      protocol: "https:",
      hostname: host,
      port: 443,
      path: `${url.pathname}${url.search}`,
      method: "GET",
      servername: host,
      headers: { "User-Agent": "FlowVault-Data-Importer/1.0", Accept: "text/plain, application/json" },
      lookup: (_hostname, _options, callback) => callback(null, destination.address, destination.family),
      timeout: 5000,
    }, (response) => {
      if ((response.statusCode || 0) >= 300 && (response.statusCode || 0) < 400) {
        response.resume();
        reject(new Error("Redirects are not followed by the importer"));
        return;
      }
      const chunks: Buffer[] = [];
      let size = 0;
      response.on("data", (chunk: Buffer) => {
        size += chunk.length;
        if (size > 1024 * 1024) {
          request.destroy(new Error("Response exceeds the 1 MB limit"));
          return;
        }
        chunks.push(chunk);
      });
      response.on("end", () => resolve({
        status: response.statusCode || 502,
        contentType: response.headers["content-type"] || "",
        body: Buffer.concat(chunks).toString("utf8"),
      }));
    });
    request.on("timeout", () => request.destroy(new Error("Request timed out")));
    request.on("error", reject);
    request.end();
  });
}
