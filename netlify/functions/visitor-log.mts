import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

function getDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase();

  if (/tablet|ipad|android(?!.*mobile)/i.test(ua)) {
    return "Tablet";
  }

  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) {
    return "Mobile";
  }

  return "Desktop";
}

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const userAgent = req.headers.get("user-agent") || "Unknown";

  const visitor = {
    visitId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),

    ipAddress: context.ip || "Unknown",

    country: context.geo?.country?.name || "Unknown",
    countryCode: context.geo?.country?.code || "Unknown",

    city: context.geo?.city || "Unknown",

    region:
      context.geo?.subdivision?.name ||
      context.geo?.subdivision?.code ||
      "Unknown",

    latitude: context.geo?.latitude ?? null,
    longitude: context.geo?.longitude ?? null,
    timezone: context.geo?.timezone || "Unknown",

    deviceType: getDeviceType(userAgent),
    userAgent,

    page: req.headers.get("referer") || "Direct",
    site: context.site?.url || "Unknown"
  };

  const store = getStore("portfolio-visitors");

  await store.setJSON(visitor.visitId, visitor);

  return new Response(
    JSON.stringify({
      success: true
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json"
      }
    }
  );
};

export const config: Config = {
  path: "/api/visitor-log",
  method: "POST"
};
