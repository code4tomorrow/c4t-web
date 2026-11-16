#!/usr/bin/env node
/**
 * Finds YouTube videos for a lesson, so video ids are copied from real search
 * results instead of guessed.
 *
 *   node scripts/find-videos.js "python for loops" [more queries…]
 *
 * Prints id, length, channel, views, age, and title for the top results.
 */
const queries = process.argv.slice(2);
if (!queries.length) {
    console.error('Usage: node scripts/find-videos.js "search words" […]');
    process.exit(1);
}

const text = (node) =>
    node
        ? node.simpleText || (node.runs || []).map((run) => run.text).join("")
        : "";

const search = async (query) => {
    const response = await fetch(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
            query
        )}&hl=en&gl=US`,
        {
            headers: {
                "Accept-Language": "en-US,en;q=0.9",
                "User-Agent": "Mozilla/5.0",
            },
        }
    );
    const html = await response.text();
    const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
    if (!match) throw new Error("YouTube returned no results page");
    const data = JSON.parse(match[1]);
    const sections =
        data.contents?.twoColumnSearchResultsRenderer?.primaryContents
            ?.sectionListRenderer?.contents || [];
    const videos = [];
    for (const section of sections) {
        for (const item of section.itemSectionRenderer?.contents || []) {
            const video = item.videoRenderer;
            if (!video) continue;
            videos.push({
                id: video.videoId,
                length: text(video.lengthText) || "live",
                channel: text(video.ownerText),
                views: text(video.viewCountText),
                age: text(video.publishedTimeText),
                title: text(video.title),
            });
        }
    }
    return videos.slice(0, 10);
};

(async () => {
    for (const query of queries) {
        console.log(`\n# ${query}`);
        try {
            for (const v of await search(query)) {
                console.log(
                    `${v.id}  ${v.length.padStart(8)}  ${v.channel}  ·  ${
                        v.views
                    }  ·  ${v.age}\n             ${v.title}`
                );
            }
        } catch (error) {
            console.log(`  (search failed: ${error.message})`);
        }
    }
})();
