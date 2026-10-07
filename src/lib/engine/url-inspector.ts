/**
 * Link check: looks only at the *text of the web address*.
 *
 * The link is never opened or fetched. That keeps it private (nothing leaves the
 * device), safe (no request reaches a possibly harmful site) and honest: these
 * are structural warning signs in the address, not a verdict on the page.
 */

export type LinkFindingId =
  | "ip-host"
  | "no-https"
  | "shortener"
  | "regulator-lookalike"
  | "userinfo-trick"
  | "punycode"
  | "invite-link"
  | "unusual-ending";

export type LinkFindingSeverity = "warning" | "caution" | "info";

export interface LinkFinding {
  id: LinkFindingId;
  severity: LinkFindingSeverity;
  /** The part of the address that triggered the finding, shown to the person. */
  detail: string;
}

export type LinkInspection =
  | { ok: true; address: string; host: string; findings: LinkFinding[] }
  | { ok: false; reason: "empty" | "invalid" };

/** Link shorteners hide where a link really goes. */
const SHORTENERS = new Set([
  "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "rb.gy", "is.gd", "goo.gl", "ow.ly",
  "shorturl.at", "tiny.cc", "rebrand.ly", "bit.do", "v.gd", "t.ly", "s.id", "lnkd.in",
]);

/** Group-invite hosts: common places where pressure is built among strangers. */
const INVITE_HOSTS = new Set(["wa.me", "chat.whatsapp.com", "t.me", "telegram.me", "telegram.dog"]);

/**
 * Official domains of bodies that scam messages like to name. A lookalike is a
 * host that *contains* one of these names but is not that domain or a subdomain of it.
 */
const OFFICIAL: Record<string, string[]> = {
  sebi: ["sebi.gov.in"],
  rbi: ["rbi.org.in"],
  npci: ["npci.org.in"],
  nse: ["nseindia.com"],
  bse: ["bseindia.com"],
  amfi: ["amfiindia.com"],
  mca: ["mca.gov.in"],
  irdai: ["irdai.gov.in"],
};

/** Endings that are cheap to register. Plenty of honest sites use them, so this is only "info". */
const CHEAP_TLDS = new Set(["xyz", "top", "click", "icu", "vip", "buzz", "site", "online", "live", "cfd", "sbs", "work"]);

const IPV4 = /^\d{1,3}(?:\.\d{1,3}){3}$/;

function isHostOrSubdomainOf(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

export function inspectUrl(raw: string): LinkInspection {
  const input = (raw ?? "").trim();
  if (!input) return { ok: false, reason: "empty" };
  // A link pasted with spaces in it is more likely a sentence than an address.
  if (/\s/.test(input)) return { ok: false, reason: "invalid" };

  const explicitScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(input);
  let url: URL;
  try {
    url = new URL(explicitScheme ? input : `https://${input}`);
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { ok: false, reason: "invalid" };
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  const isIp = IPV4.test(host);
  // A real address needs a dot (a name with an ending) or to be an IP.
  if (!isIp && !host.includes(".")) return { ok: false, reason: "invalid" };

  const findings: LinkFinding[] = [];

  if (isIp) findings.push({ id: "ip-host", severity: "warning", detail: host });

  if (url.username || url.password || /^[a-z][a-z0-9+.-]*:\/\/[^/]*@/i.test(input)) {
    findings.push({ id: "userinfo-trick", severity: "warning", detail: host });
  }

  if (explicitScheme && url.protocol === "http:") {
    findings.push({ id: "no-https", severity: "caution", detail: "http://" });
  }

  if (SHORTENERS.has(host)) findings.push({ id: "shortener", severity: "caution", detail: host });

  if (INVITE_HOSTS.has(host)) findings.push({ id: "invite-link", severity: "info", detail: host });

  if (host.split(".").some((label) => label.startsWith("xn--"))) {
    findings.push({ id: "punycode", severity: "warning", detail: host });
  }

  if (!isIp) {
    // Compare whole name parts ("sebi-approved-invest" -> sebi, approved, invest) so
    // an unrelated word that merely contains "rbi" or "nse" is not flagged.
    const parts = host.split(/[.\-_]/);
    for (const [name, domains] of Object.entries(OFFICIAL)) {
      if (!parts.includes(name)) continue;
      if (domains.some((d) => isHostOrSubdomainOf(host, d))) continue;
      findings.push({ id: "regulator-lookalike", severity: "warning", detail: `${name.toUpperCase()} · ${host}` });
      break;
    }

    const tld = host.split(".").pop() ?? "";
    if (CHEAP_TLDS.has(tld)) findings.push({ id: "unusual-ending", severity: "info", detail: `.${tld}` });
  }

  return { ok: true, address: url.href, host, findings };
}
