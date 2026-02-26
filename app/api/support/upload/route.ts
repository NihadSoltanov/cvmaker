import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? process.env.R2_ENDPOINT ?? "";

export async function POST(req: NextRequest) {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "bin";
    const key = `support/${user.id}/${randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());

    await r2.send(new PutObjectCommand({
        Bucket: process.env.R2_BUCKET ?? "cv-pdfs",
        Key: key,
        Body: buf,
        ContentType: file.type || "application/octet-stream",
        // Public read
        ACL: "public-read" as any,
    }));

    const url = `${PUBLIC_URL}/${key}`;
    return NextResponse.json({ url });
}
