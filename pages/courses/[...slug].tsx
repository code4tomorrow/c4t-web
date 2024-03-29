import React, { HTMLProps, useEffect, useMemo } from "react";
import { getSiteMap } from "@utils/notion/getSiteMap";
import { NotionRenderer } from "react-notion-x";
import { InferGetStaticPropsType } from "next";
import { NotionAPI } from "notion-client";
import { parsePageId, getPageTitle, getPageBreadcrumbs } from "notion-utils";
import { PHASE_PRODUCTION_BUILD } from "next/constants";
import { cache as cacheClient } from "@utils/cacheStaticProps";
import pRetry from "p-retry";
import Prism from "prismjs";
import { notion as notionAPI } from "@utils/notion/client";
import "react-notion-x/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";
import "katex/dist/katex.min.css";

import "prismjs/components/prism-c.js";
import "prismjs/components/prism-cpp.js";
import "prismjs/components/prism-csharp.js";
import "prismjs/components/prism-java.js";
import "prismjs/components/prism-python.js";
import "prismjs/components/prism-markup.js";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image, { ImageProps } from "next/legacy/image";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
import invert from "lodash/invert";
import { graphQLClient } from "@utils/contentful";
import { gql } from "graphql-request";
import config from "config";
import { ICourse } from ".";
import Head from "next/head";
import { useRouter } from "next/router";
import Loader from "@components/Loader";
import { getPreviewImageMap } from "@utils/notion/getPreviewImageMap";
import { ECacheKey } from "common/enums/cache";
import type { ExtendedRecordMap } from "notion-types";
import { filterRecordMap } from "@utils/notion/filterRecordMap";
import {
    addDashesToUUID,
    convertCompressedBase64ToUUID,
    convertUUIDToBase64Compressed,
    validateUUID,
} from "@utils/common";
import { formatNotionRoute } from "@utils/notion/formatNotionRoute";

const Pdf = dynamic(
    () =>
        import("react-notion-x/build/third-party/pdf").then(
            (m) => m.Pdf as any
        ),
    {
        ssr: false,
    }
);

const Modal = dynamic(
    () => import("react-notion-x/build/third-party/modal").then((m) => m.Modal),
    {
        ssr: false,
    }
);

const Equation = dynamic(() =>
    import("react-notion-x/build/third-party/equation").then(
        (m) => m.Equation as any
    )
);

const Code = dynamic(
    () =>
        import("react-notion-x/build/third-party/code").then(async (m) => {
            await Promise.all([
                import("prismjs/components/prism-markup-templating.js"),
                import("prismjs/components/prism-bash.js"),
                import("prismjs/components/prism-markdown.js"),
                import("prismjs/components/prism-objectivec.js"),
                import("prismjs/components/prism-sass.js"),
                import("prismjs/components/prism-scss.js"),
                import("prismjs/components/prism-sql.js"),
                import("prismjs/components/prism-swift.js"),
            ]);
            return m.Code as any;
        }),
    {
        ssr: true,
    }
);

const Collection = dynamic(
    () =>
        import("react-notion-x/build/third-party/collection").then(
            (m) => m.Collection as any
        ),
    {
        ssr: false,
    }
);

const PageLink: React.FC<HTMLProps<HTMLAnchorElement>> = ({
    href,
    ...props
}) => {
    const immediatePathname = href?.split("/").pop();

    return immediatePathname && validateUUID(immediatePathname) ? (
        <a href={href} {...props} />
    ) : (
        <Link href={href as string} legacyBehavior passHref>
            <a {...props} />
        </Link>
    );
};

const CustomImage: React.FC<ImageProps> = ({ alt, ...props }) => {
    return process.env.NODE_ENV === "production" &&
        props.src.toString().includes("amazonaws.com") ? (
        <Image
            alt={alt}
            unoptimized
            style={{
                maxWidth: "100%",
                height: "auto",
            }}
            {...props}
        />
    ) : (
        <Image
            alt={alt}
            priority
            style={{
                maxWidth: "100%",
                height: "auto",
            }}
            {...props}
        />
    );
};

const NotionCourse: React.FC<
    InferGetStaticPropsType<typeof getStaticProps>
> = ({ recordMap, linksMap }) => {
    const router = useRouter();

    const pageCoverURL = useMemo((): string | null => {
        if (!recordMap) return null;

        const page = Object.values((recordMap as any).block).find(
            (block: any) => {
                return block.value.type === "page";
            }
        );

        const format = (page as any)?.value?.format;
        return format?.page_cover || format?.page_icon || null;
    }, [recordMap]);

    useEffect(() => {
        Prism.highlightAll();
    }, []);

    const title = useMemo(() => {
        return recordMap ? getPageTitle(recordMap) : "Courses";
    }, [recordMap]);

    return (
        <div
            style={{ width: "100vw", overflowX: "hidden" }}
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary"
        >
            <Head>
                <title>{`${title} | C4T`}</title>
                <link
                    rel="canonical"
                    href={`https://www.code4tomorrow.org${router.asPath}`}
                />
                {pageCoverURL && (
                    <meta property="og:image" content={pageCoverURL} />
                )}
            </Head>
            <Navbar />
            {router.isFallback && (
                <div>
                    <Loader />
                </div>
            )}
            <NotionRenderer
                className="w-full !bg-dark-grey-primary"
                bodyClassName="bg-dark-grey-primary"
                recordMap={recordMap}
                showTableOfContents={true}
                showCollectionViewDropdown={true}
                darkMode={true}
                disableHeader={false}
                isImageZoomable={true}
                fullPage={true}
                mapPageUrl={(pageId: string) => {
                    const slug = linksMap[pageId] || `/${pageId}`;
                    return `/courses${slug}`;
                }}
                previewImages={true}
                components={{
                    Collection,
                    Equation,
                    Pdf,
                    Code,
                    Modal,
                    PageLink,
                    nextImage: CustomImage,
                    nextLink: Link,
                }}
            />
            <Footer className="!mt-auto" />
        </div>
    );
};

export async function getStaticPaths() {
    const courseIdsRequest = await graphQLClient.request(
        gql`
            query ($preview: Boolean, $where: CourseFilter) {
                courseCollection(preview: $preview, where: $where) {
                    items {
                        notionPageId
                    }
                }
            }
        `,
        {
            preview: config.contentful.preview,
            where: {
                notionPageId_exists: true,
            },
        }
    );

    let data = await cacheClient.getBuildCache({
        params: { key: "notion-sitemap" },
    });

    // If build cache exists, then replace with latest redis cache if available
    if (!!Object.keys(data).length && process.env.NODE_ENV === "production") {
        const redisSitemap = await cacheClient.getRedisCache({
            params: { key: ECacheKey.NOTION_SITEMAP },
        });
        if (!!Object.keys(redisSitemap).length) data = redisSitemap;
    }

    // Get Sitemap from Redis cache if build cache doesn't have it already
    if (!Object.keys(data).length && process.env.NODE_ENV === "development") {
        data = await cacheClient.getRedisCache({
            params: { key: ECacheKey.NOTION_SITEMAP },
        });
    }

    const courseIds = courseIdsRequest?.courseCollection?.items.map(
        (item: ICourse) => item.notionPageId
    );

    const paths = [];
    const allPaths = [];

    const notionRootCoursePath = {
        route: ["home"],
        blockId: config.notion.rootCoursesPageId,
    };

    paths.push(notionRootCoursePath);
    allPaths.push(notionRootCoursePath);

    if (!Object.keys(data).length) {
        for (let i = 0; i < courseIds.length; i++) {
            const response = await getSiteMap(courseIds[i]);
            paths.push(...response);
            allPaths.push(...response);
        }
    } else {
        console.log("Using Cached Notion Sitemap");
        Object.entries(data).forEach(([blockId, route]) => {
            paths.push({
                blockId,
                route: (route as string).slice(1).split("/"),
            });
            allPaths.push({
                blockId,
                route: (route as string).slice(1).split("/"),
            });
        });
    }

    const pathMap = allPaths.reduce((a, { blockId, route }) => {
        return { ...a, [blockId.replaceAll("-", "")]: `/${route.join("/")}` };
    }, {});

    await cacheClient.set({
        params: { key: ECacheKey.NOTION_SITEMAP },
        data: pathMap,
        redisCache:
            process.env.NODE_ENV === "production" &&
            process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD,
        buildCache: true,
    });

    return {
        paths: paths.map(({ route }) => ({
            params: {
                slug: [...route],
            },
        })),
        fallback: true,
    };
}

export async function getStaticProps(context: { params: { slug: string[] } }) {
    // Get Unofficial Notion API
    const notion = new NotionAPI();

    // Attempt to get Sitemap from cache
    let data = {} as { [key: string]: string };

    if (
        process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD ||
        process.env.NODE_ENV === "development"
    ) {
        data = await cacheClient.getBuildCache({
            params: { key: ECacheKey.NOTION_SITEMAP },
        });
    } else {
        data = await cacheClient.getRedisCache({
            params: { key: ECacheKey.NOTION_SITEMAP },
        });
    }

    // Get Sitemap from Redis cache if build cache doesn't have it already
    if (!Object.keys(data).length && process.env.NODE_ENV === "development") {
        data = await cacheClient.getRedisCache({
            params: { key: ECacheKey.NOTION_SITEMAP },
        });
    }

    // Attempt to retrieving notion pageId
    let pageId: string | null = parsePageId(context.params.slug[0]);

    if (data && typeof data === "object") {
        // If slug is pageId instead of human readable slug attempt redirect
        if (pageId && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
            let slug = data[pageId.replaceAll("-", "")];

            // attempt to generate a new human readable slug and page based on provided pageId
            if (!slug) {
                const newPageRecordMap = await notion
                    .getPage(pageId)
                    .catch((_) => undefined);
                if (newPageRecordMap) {
                    const crumbs =
                        getPageBreadcrumbs(newPageRecordMap, pageId) || [];
                    const routeChunks = formatNotionRoute(
                        crumbs.map((crumb) => crumb.title.toLowerCase())
                    );
                    if (
                        crumbs[0]?.pageId?.replaceAll("-", "") ===
                        config.notion.rootCoursesPageId
                    ) {
                        slug = `/${routeChunks.slice(1).join("/")}`;

                        // if human-readable slug already exists for some other page, begin slug with a compressed UUID to make the slug unique
                        const inverseObject = invert(data);
                        if (!!inverseObject[slug])
                            slug = `/${convertUUIDToBase64Compressed(
                                pageId
                            )}${slug}`;

                        data[pageId.replaceAll("-", "")] = slug;

                        // update cached site map in redis
                        await cacheClient.set({
                            params: { key: ECacheKey.NOTION_SITEMAP },
                            data,
                            redisCache: process.env.NODE_ENV === "production",
                            buildCache: process.env.NODE_ENV === "development",
                        });
                    }
                }
            }

            return {
                redirect: {
                    destination: slug
                        ? `/courses${slug}`
                        : `https://code4tomorrow.notion.site/${pageId.replaceAll(
                              "-",
                              ""
                          )}`,
                    permanent: !!slug, // only permanent if human readable path is known for notion id
                },
            };
        }

        // Else if slug is human readable and not pageId, attempt to retrieve pageId from cache
        const inverseObject = invert(data);
        const slug = `/${context.params.slug.join("/")}`;

        let encodedURI;

        try {
            encodedURI =
                decodeURIComponent(slug) === slug ? encodeURI(slug) : slug;
        } catch {
            encodedURI = encodeURI(slug);
        }

        const blockId = inverseObject[encodedURI];
        if (!!blockId) pageId = blockId;

        if (!pageId)
            pageId = convertCompressedBase64ToUUID(context.params.slug[0]);
    }

    // If slug is not an identified path from cache or an Id, redirect to course home page
    if (
        !pageId &&
        process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD &&
        !!Object.keys(data).length
    ) {
        return {
            redirect: {
                destination: `/courses`,
                permanent: false,
            },
        };
    }

    // Attempt getting page recordMap from valid notion pageId
    let isCache = false;
    let recordMap: ExtendedRecordMap | undefined;

    recordMap = await pRetry(
        async () => {
            // Only use cache during production build, not during ISR (Incremental Static Regeneration)
            if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
                const recordMapFromCache = await cacheClient.getRedisCache({
                    params: {
                        key: ECacheKey.NOTION_PAGE_RECORD_MAP,
                        pageId,
                    },
                });

                if (!!Object.keys(recordMapFromCache).length) {
                    isCache = true;
                    return recordMapFromCache;
                }
            }

            const map = await notion.getPage(pageId!, {
                gotOptions: { retry: 3 },
            });

            return map;
        },
        { retries: 3, minTimeout: 1000 }
    ).catch((e) => {
        console.log("Query Page Error: ", e.code);
    });

    if (recordMap?.block) {
        for (const block in recordMap.block) {
            const type = recordMap.block[block]?.value?.type as string;
            if (["factory", "link_to_page"].includes(type))
                delete recordMap.block[block];
        }
    }

    // Downtime between page querying to prevent exceeding notion rate limit ( ~250 ms )
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD && !isCache) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve(true);
            }, 250);
        });
    }

    // TODO: If a deleted page is restored, then cached 404 not found page will continue to display even though it shouldn't
    if (!recordMap) {
        if (
            await notionAPI.pages
                .retrieve({ page_id: addDashesToUUID(pageId!) })
                .then(() => false)
                .catch((err) => {
                    return (
                        err.code === "object_not_found" ||
                        err.code === "validation_error"
                    );
                })
        ) {
            return {
                notFound: true,
            };
        }

        throw new Error(`Failed to Query Page ${pageId}`);
    } else if (!isCache) {
        recordMap = filterRecordMap(recordMap);

        await cacheClient.set({
            redisCache: process.env.NODE_ENV === "production",
            data: recordMap,
            logs: process.env.NODE_ENV === "development",
            ttl: 60 * 60 * 24 * 30, // 30 days in seconds
            params: { key: ECacheKey.NOTION_PAGE_RECORD_MAP, pageId: pageId! },
        });
    }

    // Retrieve notion pageIds for mapping slugs
    let linksMap: { [key: string]: string } = {};

    if (data && typeof data === "object" && recordMap) {
        linksMap = Object.values(recordMap.block)
            .filter(({ value }) => value?.type === "page")
            .map(({ value }) => ({
                id: value?.id,
                route: data[value.id.replaceAll("-", "")] || null,
            }))
            .filter(({ route }) => !!route)
            .reduce(
                (a, b) => ({
                    ...a,
                    [b.id]: b.route,
                }),
                {}
            );
    }

    if (recordMap) {
        // Get placeholder images
        const previewImageMap = await getPreviewImageMap(recordMap);
        (recordMap as any).preview_images = previewImageMap;

        // replaces C# with csharp to fix code highlighting bug
        for (const blockId in recordMap.block) {
            if (recordMap.block[blockId]?.value?.type != "code") continue;
            const language =
                recordMap.block[blockId].value.properties?.language?.[0]?.[0];

            if (language === "C#")
                recordMap.block[blockId].value.properties.language[0][0] =
                    "csharp";
        }
    }

    return {
        props: {
            recordMap: recordMap || {},
            linksMap,
            pageId,
        },
        revalidate: 15 * 60, // 15 minutes
    };
}

export default NotionCourse;
