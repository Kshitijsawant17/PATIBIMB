import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 1_500_000;
const MAX_TEXT = 20_000;
const MAX_REDIRECTS = 3;

function isBlockedHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/\.$/, "");
  if (host === "localhost" || host === "ip6-localhost" || host === "metadata.google.internal") return true;
  if (host === "0.0.0.0" || host === "::1" || host.startsWith("127.")) return true;
  if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) return true;
  const parts = host.split(".");
  if (parts.length === 4 && parts.every((part) => /^\d+$/.test(part))) {
    const [a, b] = parts.map(Number);
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

function validateUrl(value: string) {
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP and HTTPS URLs are supported.");
  if (isBlockedHost(url.hostname)) throw new Error("That URL cannot be fetched for safety reasons.");
  return url;
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<br\s*\/?>(?=.)/gi, "\n")
      .replace(/<\/p>|<\/div>|<\/li>|<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

async function fetchSafely(startUrl: URL) {
  let current = startUrl;
  for (let attempt = 0; attempt <= MAX_REDIRECTS; attempt += 1) {
    validateUrl(current.toString());
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        "User-Agent": "PRATIBIMB/1.0 educational investor-resilience scanner",
        Accept: "text/html,text/plain,application/xhtml+xml;q=0.9,*/*;q=0.1",
      },
      signal: AbortSignal.timeout(8000),
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (attempt === MAX_REDIRECTS) throw new Error("Too many redirects.");
      const location = response.headers.get("location");
      if (!location) throw new Error("The page returned an invalid redirect.");
      current = new URL(location, current);
      continue;
    }

    return { response, url: current };
  }
  throw new Error("Could not fetch the URL.");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === "string" ? body.url.trim() : "";
    if (!rawUrl) return NextResponse.json({ error: "Enter a URL first." }, { status: 400 });

    const startUrl = validateUrl(rawUrl);
    const { response, url } = await fetchSafely(startUrl);

    if (!response.ok) {
      return NextResponse.json({ error: `The page returned HTTP ${response.status}.` }, { status: 422 });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!/(text\/html|text\/plain|application\/xhtml\+xml)/i.test(contentType)) {
      return NextResponse.json(
        { error: "This URL is not a readable web page. Upload a screenshot instead for image-based content." },
        { status: 415 }
      );
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BYTES) {
      return NextResponse.json({ error: "That page is too large to inspect safely." }, { status: 413 });
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("The page returned no readable content.");

    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      const remaining = MAX_BYTES - total;
      const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
      chunks.push(chunk);
      total += chunk.byteLength;
      if (total >= MAX_BYTES) break;
    }
    await reader.cancel();

    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }

    const raw = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const text = htmlToText(raw).slice(0, MAX_TEXT);
    const titleMatch = raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? htmlToText(titleMatch[1]).slice(0, 180) : "";

    if (text.length < 10) {
      return NextResponse.json({ error: "We could not find enough readable text on that page." }, { status: 422 });
    }

    return NextResponse.json({ text, title, url: url.toString(), source: "url" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The URL could not be inspected.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
