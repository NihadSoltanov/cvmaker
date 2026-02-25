import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const endpoint = process.env.R2_ENDPOINT!;
const accessKeyId = process.env.R2_ACCESS_KEY_ID!;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY!;
const bucket = process.env.R2_BUCKET || "cv-pdfs";

export const r2 = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export const uploadPDF = async (key: string, body: Buffer | Uint8Array, contentType = "application/pdf") => {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
    });
    return r2.send(command);
};
