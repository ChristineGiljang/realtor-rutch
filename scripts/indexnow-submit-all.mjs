// Usage: node scripts/indexnow-submit-all.mjs YOUR_KEY
const SITE = "https://realtor-rutch.com";
const HOST = "realtor-rutch.com";
const key = process.argv[2];

if (!key) {
  console.error("Usage: node scripts/indexnow-submit-all.mjs YOUR_KEY");
  process.exit(1);
}

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);

console.log(`Found ${urls.length} URLs in sitemap.xml`);
if (urls.length === 0) process.exit(1);

for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key,
      keyLocation: `${SITE}/${key}.txt`,
      urlList: batch,
    }),
  });
  console.log(`Batch ${i / 10000 + 1}: HTTP ${res.status}`);
}
