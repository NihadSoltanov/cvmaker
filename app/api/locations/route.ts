import { NextResponse } from "next/server";

// CountriesNow API — free, no API key needed
const BASE = "https://countriesnow.space/api/v0.1";

// Cache in-memory for the server lifetime
let countriesCache: string[] | null = null;
const citiesCache: Record<string, string[]> = {};

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "countries" | "cities"
    const country = searchParams.get("country") || "";

    // ── Countries list ──────────────────────────────────────────────
    if (type === "countries") {
        if (countriesCache) {
            return NextResponse.json({ countries: countriesCache }, { headers: { "Cache-Control": "public, max-age=86400" } });
        }
        try {
            const res = await fetch(`${BASE}/countries/iso`, { next: { revalidate: 86400 } });
            const json = await res.json();
            const names: string[] = (json.data || [])
                .map((c: any) => c.name as string)
                .filter(Boolean)
                .sort();
            countriesCache = names;
            return NextResponse.json(
                { countries: names },
                { headers: { "Cache-Control": "public, max-age=86400" } }
            );
        } catch {
            return NextResponse.json({ error: "Failed to load countries" }, { status: 502 });
        }
    }

    // ── Cities for a country ─────────────────────────────────────────
    if (type === "cities" && country) {
        if (citiesCache[country]) {
            return NextResponse.json({ cities: citiesCache[country] }, { headers: { "Cache-Control": "public, max-age=86400" } });
        }
        try {
            const res = await fetch(`${BASE}/countries/cities`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ country }),
                next: { revalidate: 86400 },
            });
            const json = await res.json();
            const cities: string[] = (json.data || []).sort();
            citiesCache[country] = cities;
            return NextResponse.json(
                { cities },
                { headers: { "Cache-Control": "public, max-age=86400" } }
            );
        } catch {
            return NextResponse.json({ error: "Failed to load cities" }, { status: 502 });
        }
    }

    return NextResponse.json({ error: "Invalid request. Use ?type=countries or ?type=cities&country=Germany" }, { status: 400 });
}
