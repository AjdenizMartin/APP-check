import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Readable } from "node:stream";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DRIVER = process.env.STORAGE_DRIVER ?? "local";
const LOCAL_ROOT = process.env.PRIVATE_STORAGE_PATH ?? ".data/storage";

function ensureRelativeSafeKey(key: string) {
  if (key.includes("..") || key.startsWith("/")) {
    throw new Error("invalid_storage_key");
  }
}

async function streamToBuffer(stream: Readable) {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function createS3Client() {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || "eu-west-1",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true",
    credentials:
      process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
          }
        : undefined,
  });
}

export async function putPrivateObject(key: string, body: Buffer, mimeType: string) {
  ensureRelativeSafeKey(key);

  if (DRIVER === "s3") {
    const client = createS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: mimeType,
      }),
    );
    return;
  }

  const absolutePath = path.join(process.cwd(), LOCAL_ROOT, key);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, body);
}

export async function getPrivateObject(key: string) {
  ensureRelativeSafeKey(key);

  if (DRIVER === "s3") {
    const client = createS3Client();
    const object = await client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
      }),
    );

    if (!object.Body) {
      throw new Error("storage_object_not_found");
    }

    const body = await streamToBuffer(object.Body as Readable);
    return body;
  }

  const absolutePath = path.join(process.cwd(), LOCAL_ROOT, key);
  return readFile(absolutePath);
}
