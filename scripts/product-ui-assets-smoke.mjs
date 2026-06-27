/* global Buffer, File, FormData, Request, Response, console, process */

import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const compiledRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const smokeOrigin = "http://product-ui-assets-smoke.local";

process.env.AI_VIDEO_STUDIO_ARTIFACT_ROOT = await mkdtemp(
  path.join(tmpdir(), "product-ui-assets-smoke-"),
);

const routeModulePath = path.join(
  compiledRoot,
  "src",
  "app",
  "api",
  "assets",
  "product-ui",
  "route.js",
);
const assetRouteModulePath = path.join(
  compiledRoot,
  "src",
  "app",
  "api",
  "assets",
  "product-ui",
  "[assetId]",
  "route.js",
);
const productAssetsModulePath = path.join(compiledRoot, "src", "lib", "product-assets", "index.js");
const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
  "base64",
);

const fail = (message) => {
  throw new Error(message);
};

const importOptional = async (modulePath) => {
  try {
    return await import(modulePath);
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cannot find module")) {
      return undefined;
    }
    throw error;
  }
};

const assertStatus = (response, expectedStatus, label) => {
  if (response.status !== expectedStatus) {
    fail(`${label}: expected status ${expectedStatus}, got ${response.status}`);
  }
};

const assertObject = (value, label) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(`${label}: expected object`);
  }
  return value;
};

const createImageForm = ({ bytes = pngBytes, name = "smoke-product.png", type = "image/png" } = {}) => {
  const formData = new FormData();
  formData.set("image", new File([bytes], name, { type }));
  formData.set("alt", "Smoke product screenshot");
  formData.set("frameLabel", "Product frame");
  return formData;
};

const postUpload = async (formData) => {
  const uploadRoute = await importOptional(routeModulePath);
  if (typeof uploadRoute?.POST !== "function") {
    return Response.json({ error: "route missing" }, { status: 404 });
  }
  return uploadRoute.POST(new Request(`${smokeOrigin}/api/assets/product-ui`, { body: formData, method: "POST" }));
};

const getAsset = async (assetId) => {
  const assetRoute = await importOptional(assetRouteModulePath);
  if (typeof assetRoute?.GET !== "function") {
    return Response.json({ error: "route missing" }, { status: 404 });
  }
  return assetRoute.GET(new Request(`${smokeOrigin}/api/assets/product-ui/${assetId}`), {
    params: Promise.resolve({ assetId }),
  });
};

const assertUploadResponse = (payload) => {
  const body = assertObject(payload, "upload response");
  const descriptor = assertObject(body.descriptor, "descriptor");
  const metadata = assertObject(body.metadata, "metadata");

  if (descriptor.sourceType !== "route") {
    fail(`descriptor.sourceType mismatch: ${String(descriptor.sourceType)}`);
  }
  if (typeof descriptor.src !== "string" || !descriptor.src.startsWith("/api/assets/product-ui/")) {
    fail(`descriptor.src mismatch: ${String(descriptor.src)}`);
  }
  if (descriptor.src.startsWith("http://") || descriptor.src.startsWith("https://")) {
    fail("descriptor.src must not be a remote URL");
  }
  if (descriptor.alt !== "Smoke product screenshot" || descriptor.frameLabel !== "Product frame") {
    fail("descriptor labels mismatch");
  }
  if (typeof metadata.assetId !== "string" || !descriptor.src.endsWith(metadata.assetId)) {
    fail("metadata.assetId must match descriptor route src");
  }
  if (
    metadata.originalName !== "smoke-product.png" ||
    metadata.sizeInBytes !== pngBytes.byteLength ||
    metadata.contentType !== "image/png"
  ) {
    fail("metadata mismatch");
  }

  return { assetId: metadata.assetId, descriptor };
};

const assertDescriptorValidation = async (descriptor) => {
  const productAssets = await importOptional(productAssetsModulePath);
  if (typeof productAssets?.productImageDescriptorSchema?.safeParse !== "function") {
    fail("productImageDescriptorSchema.safeParse is required");
  }

  if (!productAssets.productImageDescriptorSchema.safeParse(descriptor).success) {
    fail("valid route descriptor should pass helper validation");
  }
  if (
    productAssets.productImageDescriptorSchema.safeParse({
      ...descriptor,
      src: "https://example.com/product.png",
    }).success
  ) {
    fail("remote descriptor src should be rejected");
  }
  if (
    productAssets.productImageDescriptorSchema.safeParse({
      ...descriptor,
      src: "/api/tts/assets/product.png",
    }).success
  ) {
    fail("non product-ui route descriptor src should be rejected");
  }
};

const assertServedImage = async (descriptor) => {
  const assetId = descriptor.src.replace("/api/assets/product-ui/", "");
  const servedResponse = await getAsset(assetId);
  assertStatus(servedResponse, 200, "served image");
  const servedBytes = new Uint8Array(await servedResponse.arrayBuffer());
  if (
    servedBytes.byteLength !== pngBytes.byteLength ||
    servedResponse.headers.get("content-type") !== "image/png" ||
    servedResponse.headers.get("content-length") !== String(pngBytes.byteLength) ||
    servedResponse.headers.get("cache-control") !== "public, max-age=31536000, immutable"
  ) {
    fail("served image response mismatch");
  }
};

const runSmoke = async () => {
  try {
    const uploadResponse = await postUpload(createImageForm());
    assertStatus(uploadResponse, 200, "valid upload");
    const { assetId, descriptor } = assertUploadResponse(await uploadResponse.json());
    await assertDescriptorValidation(descriptor);
    await assertServedImage(descriptor);

    assertStatus(
      await postUpload(createImageForm({ name: "smoke-product.gif", type: "image/gif" })),
      400,
      "invalid extension and mime",
    );
    assertStatus(await postUpload(createImageForm({ bytes: Uint8Array.from([]) })), 400, "empty file");
    assertStatus(
      await postUpload(createImageForm({ bytes: new Uint8Array(10 * 1024 * 1024 + 1) })),
      400,
      "oversized file",
    );

    const remoteUrlForm = new FormData();
    remoteUrlForm.set("src", "https://example.com/product.png");
    assertStatus(await postUpload(remoteUrlForm), 400, "remote URL form");
    assertStatus(await getAsset("not-a-valid-id"), 400, "invalid id");
    assertStatus(await getAsset(assetId.replace(/-[a-z0-9]{8}\./, "-deadbeef.")), 404, "missing valid id");

    console.log("product-ui-assets smoke passed");
  } finally {
    await rm(process.env.AI_VIDEO_STUDIO_ARTIFACT_ROOT, { force: true, recursive: true });
  }
};

await runSmoke();
