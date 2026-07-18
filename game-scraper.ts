import { writeFile } from "node:fs/promises";

const BASE = "https://www.madkidgames.com/html5-games";
const PAGES = 18;

interface Game {
    slug: string;
    name: string;
    image: string;
    iframe: string;
    description: string;
}

async function main() {
    const games = new Map<string, Game>();

    for (let page = 1; page <= PAGES; page++) {
        const url = page === 1 ? BASE : `${BASE}/${page}`;

        console.log(`Fetching ${url}`);

        const html = await fetch(url).then((r) => r.text());

        const cards = html.match(/<a href="https:\/\/www\.madkidgames\.com\/game\/[\s\S]*?openJsonFromList\(this\)">[\s\S]*?<\/button>/g) || [];

        for (const card of cards) {
            const slug =
                card.match(/data-slug="([^"]+)"/)?.[1] ??
                "";

            if (!slug) continue;

            const name =
                card.match(/alt="([^"]+)"/)?.[1] ??
                card.match(/data-title="([^"]+)"/)?.[1] ??
                slug;

            const image =
                card.match(/data-src="([^"]+)"/)?.[1] ??
                card.match(/src="([^"]+)"/)?.[1] ??
                "";

            games.set(slug, {
                slug,
                name,
                image,
                iframe: `https://www.madkidgames.com/full/${slug}`,
                description: "",
            });
        }
    }

    const list = [...games.values()].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    await writeFile(
        "slugs.txt",
        list.map((g) => g.slug).join("\n"),
        "utf8"
    );

    const ts = `export interface Game {
  slug: string;
  name: string;
  image: string;
  iframe: string;
  description: string;
}

export const games: Game[] = ${JSON.stringify(list, null, 2)};\n`;

    await writeFile("games.ts", ts, "utf8");

    console.log(`Saved ${list.length} games.`);
}

main().catch(console.error);