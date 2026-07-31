import type { GetServerSideProps } from "next";

/**
 * Tombstone for the retired Notion-backed course library.
 *
 * Those pages lived at arbitrarily deep paths like
 * `/courses/java/beginner/variables`, mirroring the Notion page tree. The
 * library has been replaced by the self-paced catalog, so rather than letting
 * every inbound link and bookmark hit a 404, deep `/courses/**` paths are sent
 * to the catalog with a permanent redirect.
 *
 * Single-segment paths never reach here: `[courseSlug].tsx` is the more
 * specific route and handles them (including 404s for unknown slugs). Only
 * two-or-more-segment paths fall through to this catch-all.
 */
const RetiredCourseLibrary = () => null;

export const getServerSideProps: GetServerSideProps = async () => ({
    redirect: { destination: "/courses", permanent: true },
});

export default RetiredCourseLibrary;
