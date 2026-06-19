import { BetaAnalyticsDataClient } from "@google-analytics/data";

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID ?? "";

function getClient() {
  const creds = process.env.GA4_SERVICE_ACCOUNT_JSON;
  if (!creds) return null;
  try {
    return new BetaAnalyticsDataClient({
      credentials: JSON.parse(creds),
    });
  } catch {
    return null;
  }
}

export type GA4Stats = {
  last30Days: {
    users: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: string;
  };
  topPages: { path: string; views: number }[];
  devices: { device: string; users: number }[];
  activeUsers: number;
};

const EMPTY: GA4Stats = {
  last30Days: { users: 0, sessions: 0, pageViews: 0, avgSessionDuration: "0:00" },
  topPages: [],
  devices: [],
  activeUsers: 0,
};

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function getGA4Stats(): Promise<GA4Stats> {
  if (!GA4_PROPERTY_ID) return EMPTY;
  const client = getClient();
  if (!client) return EMPTY;

  const property = `properties/${GA4_PROPERTY_ID}`;

  try {
    const [overview, pages, devices, realtime] = await Promise.all([
      // Métricas gerais — últimos 30 dias
      client.runReport({
        property,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        metrics: [
          { name: "totalUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
        ],
      }),

      // Páginas mais visitadas
      client.runReport({
        property,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "8",
      }),

      // Dispositivos
      client.runReport({
        property,
        dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "totalUsers" }],
        orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
      }),

      // Usuários em tempo real
      client.runRealtimeReport({
        property,
        metrics: [{ name: "activeUsers" }],
      }),
    ]);

    const row0 = overview[0]?.rows?.[0];
    const duration = parseFloat(row0?.metricValues?.[3]?.value ?? "0");

    return {
      last30Days: {
        users:              parseInt(row0?.metricValues?.[0]?.value ?? "0"),
        sessions:           parseInt(row0?.metricValues?.[1]?.value ?? "0"),
        pageViews:          parseInt(row0?.metricValues?.[2]?.value ?? "0"),
        avgSessionDuration: fmtDuration(duration),
      },
      topPages: (pages[0]?.rows ?? []).map((r) => ({
        path:  r.dimensionValues?.[0]?.value ?? "/",
        views: parseInt(r.metricValues?.[0]?.value ?? "0"),
      })),
      devices: (devices[0]?.rows ?? []).map((r) => ({
        device: r.dimensionValues?.[0]?.value ?? "other",
        users:  parseInt(r.metricValues?.[0]?.value ?? "0"),
      })),
      activeUsers: parseInt(realtime[0]?.rows?.[0]?.metricValues?.[0]?.value ?? "0"),
    };
  } catch (err) {
    console.error("[GA4]", err);
    return EMPTY;
  }
}
