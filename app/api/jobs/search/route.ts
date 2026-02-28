import { NextResponse } from "next/server";

export interface JobResult {
    job_id: string;
    job_title: string;
    employer_name: string;
    employer_logo?: string;
    job_city?: string;
    job_posted_at_datetime_utc?: string;
    job_apply_link?: string;
    job_is_remote?: boolean;
}

function parseLinkedInJobs(html: string): JobResult[] {
    const jobs: JobResult[] = [];
    const cardRegex = /<li>([\s\S]*?)<\/li>/g;
    let match;
    while ((match = cardRegex.exec(html)) !== null) {
        const card = match[1];

        // Job ID from URN or view link
        const idMatch = card.match(/data-entity-urn="urn:li:jobPosting:(\d+)"/) ||
            card.match(/href="https:\/\/www\.linkedin\.com\/jobs\/view\/[^/]*?-(\d+)\/?"/) ||
            card.match(/\/jobs\/view\/[^/]*?-(\d+)\/?"/);
        const job_id = idMatch?.[1] || "";
        if (!job_id) continue;

        // Title
        const titleMatch = card.match(/class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/) ||
            card.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
        const job_title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";
        if (!job_title) continue;

        // Company
        const companyMatch = card.match(/class="[^"]*base-search-card__subtitle[^"]*"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/) ||
            card.match(/class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/);
        const employer_name = companyMatch ? companyMatch[1].replace(/<[^>]+>/g, "").trim() : "";

        // Location
        const locMatch = card.match(/class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/);
        const job_city = locMatch ? locMatch[1].replace(/<[^>]+>/g, "").trim() : "";

        // Posted date
        const dateMatch = card.match(/datetime="([^"]+)"/);
        const job_posted_at_datetime_utc = dateMatch?.[1];

        // Logo - try multiple patterns
        const logoMatch =
            card.match(/data-delayed-url="(https:\/\/media\.licdn\.com[^"]+)"/) ||
            card.match(/src="(https:\/\/media\.licdn\.com[^"]+)"/) ||
            card.match(/img[^>]+data-ghost-url="([^"]+)"/);
        const employer_logo = logoMatch?.[1] || undefined;

        const job_is_remote = /remote/i.test(job_city) || /remote/i.test(job_title);

        jobs.push({
            job_id,
            job_title,
            employer_name,
            employer_logo,
            job_city,
            job_posted_at_datetime_utc,
            job_apply_link: `https://www.linkedin.com/jobs/view/${job_id}`,
            job_is_remote,
        });
    }
    return jobs;
}

async function fetchPage(keywords: string, location: string, start: number): Promise<string> {
    const params = new URLSearchParams({
        keywords,
        location,
        start: String(start),
        sortBy: "DD", // date descending = newest first
        f_TPR: "r604800", // last 7 days (freshest jobs)
    });
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${params}`;
    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Referer": "https://www.linkedin.com/jobs/search/",
        },
        next: { revalidate: 180 }, // cache 3 min
    });
    if (!res.ok) throw new Error(`LinkedIn ${res.status}`);
    return res.text();
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const role = (searchParams.get("role") || "").trim();
    const location = (searchParams.get("location") || "").trim();

    if (!role) return NextResponse.json({ error: "Role is required" }, { status: 400 });

    try {
        // Fetch 3 pages in parallel (0-24, 25-49, 50-74) = up to 75 jobs
        const [html0, html25, html50] = await Promise.allSettled([
            fetchPage(role, location, 0),
            fetchPage(role, location, 25),
            fetchPage(role, location, 50),
        ]);

        const allHtml = [html0, html25, html50]
            .filter((r): r is PromiseFulfilledResult<string> => r.status === "fulfilled")
            .map(r => r.value)
            .join("");

        if (!allHtml.trim()) {
            return NextResponse.json({ jobs: [], total: 0 });
        }

        const jobs = parseLinkedInJobs(allHtml);

        // Deduplicate by job_id
        const seen = new Set<string>();
        const unique = jobs.filter(j => j.job_id && !seen.has(j.job_id) && seen.add(j.job_id));

        return NextResponse.json({ jobs: unique, total: unique.length });
    } catch (error: any) {
        if (error?.message?.includes("429")) {
            return NextResponse.json({ error: "LinkedIn rate limit. Please wait a minute and try again." }, { status: 429 });
        }
        console.error("LinkedIn jobs error:", error);
        return NextResponse.json({ error: "Could not fetch jobs. Please try again." }, { status: 500 });
    }
}
