const SITE_URL = "https://realtor-rutch.com";
const HOST = "realtor-rutch.com";
const ENDPOINT = "https://api.indexnow.org/indexnow";

function toAbsolute(path: string) {
  if (path.startsWith("http")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Tell Bing (via IndexNow) that these pages are new, changed, or deleted.
 * Accepts paths like "/blog/my-post" or full URLs on realtor-rutch.com.
 * Never throws, so it can't break saving a listing or blog post.
 */
export async function submitToIndexNow(paths: string[]) {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    console.warn("[IndexNow] INDEXNOW_KEY is not set, skipping.");
    return { ok: false, skipped: true as const };
  }

  // Don't ping Bing from local development.
  if (process.env.NODE_ENV !== "production") {
    return { ok: false, skipped: true as const };
  }

  const urlList = Array.from(new Set(paths.map(toAbsolute))).slice(0, 10000);
  if (urlList.length === 0) return { ok: true, status: 0 };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key,
        keyLocation: `${SITE_URL}/${key}.txt`,
        urlList,
      }),
    });

    // 200 = accepted, 202 = accepted (key validation pending)
    const ok = res.status === 200 || res.status === 202;
    if (!ok) {
      console.error(`[IndexNow] Failed with status ${res.status}`);
    }
    return { ok, status: res.status };
  } catch (err) {
    console.error("[IndexNow] Request error:", err);
    return { ok: false, error: true as const };
  }
}
