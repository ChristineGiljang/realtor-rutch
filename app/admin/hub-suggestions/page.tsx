import {
  getHubSuggestions,
  type AreaSuggestion,
  type BuildingSuggestion,
} from "@/lib/hub-suggestions";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Hub suggestions",
  robots: { index: false, follow: false },
};

function Warnings({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-sm text-amber-700">
      {items.map((w) => (
        <li key={w}>⚠ {w}</li>
      ))}
    </ul>
  );
}

function Snippet({ code }: { code: string }) {
  // select-all: one click selects the whole snippet, then Ctrl+C
  return (
    <pre className="mt-3 select-all overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
      {code}
    </pre>
  );
}

function AreaCard({ a }: { a: AreaSuggestion }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <p className="font-semibold">
        {a.name}{" "}
        <span className="font-normal text-gray-500">
          · {a.cityName} · {a.total} listing{a.total === 1 ? "" : "s"}
        </span>
      </p>
      <Warnings items={a.warnings} />
      <Snippet code={a.snippet} />
    </div>
  );
}

function BuildingCard({ b }: { b: BuildingSuggestion }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-4">
      <p className="font-semibold">
        {b.name}{" "}
        <span className="font-normal text-gray-500">
          · {(b.areaName ?? b.areaSlug) || "no area"} · {b.cityName}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        {b.total} listing{b.total === 1 ? "" : "s"} ({b.sale} sale, {b.rent}{" "}
        rent)
        {b.wouldIndex
          ? " · would be indexed and appear in the footer"
          : " · below the minimum, stays noindex until a sale or rent page has 3"}
      </p>
      <Warnings items={b.warnings} />
      <Snippet code={b.snippet} />
    </div>
  );
}

export default async function HubSuggestionsPage() {
  const { areas, buildings, total } = await getHubSuggestions();

  return (
    <div className="mx-auto max-w-4xl space-y-10 p-6">
      <div>
        <h1 className="text-2xl font-bold">Hub suggestions</h1>
        <p className="mt-1 text-sm text-gray-600">
          Places used by your active listings that don&apos;t have a hub page
          yet. Paste areas into <code>lib/areas.ts</code> first, then buildings
          into <code>lib/buildings.ts</code>, then redeploy.
        </p>
        {total === 0 && (
          <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">
            Nothing to add. Every building and barangay is registered.
          </p>
        )}
      </div>

      {areas.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Areas to add ({areas.length})
          </h2>
          {areas.map((a) => (
            <AreaCard key={a.key} a={a} />
          ))}
        </section>
      )}

      {buildings.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            Buildings to add ({buildings.length})
          </h2>
          {buildings.map((b) => (
            <BuildingCard key={b.key} b={b} />
          ))}
        </section>
      )}
    </div>
  );
}
