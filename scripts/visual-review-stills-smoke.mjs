/* global console, fetch, process */

const appOrigin = process.env.AI_VIDEO_STUDIO_SMOKE_ORIGIN ?? "http://127.0.0.1:3000";

const fixtureProject = {
  meta: {
    title: "Visual Review Still Smoke",
    fps: 30,
    width: 1280,
    height: 720,
  },
  brief: "Render one scripted segment for visual review still extraction.",
  segments: [
    {
      id: "segment-1",
      title: "Still smoke",
      intent: "Verify still extraction renders representative frames.",
      templateId: "scripted",
      implementation: {
        meta: {
          title: "Still smoke",
          fps: 30,
          width: 1280,
          height: 720,
        },
        theme: {
          background: "#0f172a",
          panel: "rgba(255,255,255,0.08)",
          primary: "#38bdf8",
          secondary: "#f59e0b",
          text: "#f8fafc",
          muted: "#cbd5e1",
        },
        scenes: [
          {
            id: "still-smoke-title",
            type: "title",
            title: "Visual review",
            subtitle: "Representative still extraction.",
            duration: 90,
          },
        ],
      },
    },
  ],
};

const requestJson = async (url, init) => {
  const response = await fetch(url, init);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}: ${text}`);
  }

  return body;
};

const main = async () => {
  const body = await requestJson(`${appOrigin}/api/visual-review/stills`, {
    body: JSON.stringify({ project: fixtureProject }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
  const stills = body?.extraction?.stills ?? [];
  const firstStill = stills[0];

  if (body?.extraction?.status !== "rendered") {
    throw new Error("Visual review still smoke expected rendered extraction status.");
  }
  if (body.extraction.stillCount !== 3 || stills.length !== 3) {
    throw new Error(`Visual review still smoke expected 3 stills, got ${stills.length}.`);
  }
  if (body.visualReview?.reviewFrameCount !== 3) {
    throw new Error("Visual review still smoke expected reviewFrameCount to stay attached.");
  }
  if (!firstStill?.downloadUrl || firstStill.contentType !== "image/png") {
    throw new Error("Visual review still smoke expected PNG still metadata with a download URL.");
  }
  if (
    !firstStill.analysis ||
    typeof firstStill.analysis.blankFrameScore !== "number" ||
    !["analyzed", "near_blank_frame", "unsupported"].includes(firstStill.analysis.status)
  ) {
    throw new Error("Visual review still smoke expected per-still analysis metadata.");
  }
  if (!stills.every((still) => typeof still.analysis?.dominantColorRatio === "number")) {
    throw new Error("Visual review still smoke expected every still to include pixel analysis.");
  }
  if (body.visualReview.warningCount > 0) {
    const messages = body.visualReview.findings.map((finding) => finding.message).join("\n");
    if (!messages.includes("Representative still appears near blank")) {
      throw new Error("Visual review still warnings should include still-analysis context.");
    }
  }

  const stillResponse = await fetch(`${appOrigin}${firstStill.downloadUrl}`);
  if (!stillResponse.ok) {
    throw new Error(
      `Visual review still smoke could not fetch first still: ${stillResponse.status}`,
    );
  }
  if (stillResponse.headers.get("content-type") !== "image/png") {
    throw new Error("Visual review still smoke expected image/png download content type.");
  }

  const bytes = new Uint8Array(await stillResponse.arrayBuffer());
  if (bytes.byteLength <= 0) {
    throw new Error("Visual review still smoke expected non-empty still bytes.");
  }

  console.log(
    `Visual review still smoke passed: ${stills.length} stills, first=${firstStill.downloadUrl}`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
