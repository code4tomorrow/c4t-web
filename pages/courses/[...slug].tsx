import React, { HTMLProps, useEffect, useMemo } from "react";
import { getSiteMap } from "@utils/notion/getSiteMap";
import { NotionRenderer } from "react-notion-x";
import { InferGetStaticPropsType } from "next";
import { NotionAPI } from 'notion-client'
import { parsePageId, getPageTitle } from "notion-utils";
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cache as cacheClient } from "@utils/cacheStaticProps"; 
import pRetry from 'p-retry';
import Prism from "prismjs"

import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

import 'prismjs/components/prism-c.js'
import 'prismjs/components/prism-cpp.js'
import 'prismjs/components/prism-csharp.js'
import 'prismjs/components/prism-java.js'
import 'prismjs/components/prism-python.js'
import 'prismjs/components/prism-markup.js'

import dynamic from 'next/dynamic'
import Link from "next/link";
import Image from "next/image";
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

const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf as any),
    {
        ssr: false
    }
)

const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    {
      ssr: false
    }
  )

const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation as any)
)


const Code = dynamic(
    () => import('react-notion-x/build/third-party/code').then(async (m) => {
        await Promise.all([
            import('prismjs/components/prism-markup-templating.js'),
            import('prismjs/components/prism-bash.js'),
            import('prismjs/components/prism-markdown.js'),
            import('prismjs/components/prism-objectivec.js'),
            import('prismjs/components/prism-sass.js'),
            import('prismjs/components/prism-scss.js'),
            import('prismjs/components/prism-sql.js'),
            import('prismjs/components/prism-swift.js'),
        ])
        return m.Code as any
    }),
    { 
        ssr: true
    }
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then((m) => m.Collection as any),
  {
    ssr: false
  }
)

const PageLink : React.FC<HTMLProps<HTMLAnchorElement>> = ({ href, ...props }) => {
    return (
        <Link href={href as string} passHref>
            <a { ...props} />
        </Link>
    )
}

const NotionCourse : React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ recordMap, linksMap, pageId }) => {
    const router = useRouter()

    const pageCoverURL = useMemo(() : string | null => {
        if (!recordMap) return null; 

        const page =  Object.values((recordMap as any).block).find((block: any) => {
            return block.value.type === "page";
        });

        const format = (page as any)?.value?.format; 
        return format?.page_cover || format?.page_icon || null; 
    }, [ recordMap ]);

    useEffect(() => {
        Prism.highlightAll()
    }, [])

    const title = useMemo(() => {
        return recordMap ? getPageTitle(recordMap) : "Courses"
    }, [ recordMap ]);

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>{title} | C4T</title>
                <link rel="canonical" href={`https://www.code4tomorrow.org${router.asPath}`} />
                { pageCoverURL && <meta property="og:image" content={pageCoverURL} /> }
            </Head>
            <Navbar />
            {
                router.isFallback && (
                    <div>
                        <Loader />
                    </div>  
                )
            }
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
                    return `/courses${slug}`
                }}
                previewImages={true}
                components={{
                    Collection,
                    Equation,
                    Pdf,
                    Code,
                    Modal,
                    PageLink,
                    nextImage: Image,
                    nextLink: Link
                }}
            />
            <Footer className="!mt-auto" />
        </div>
    )
}

export async function getStaticPaths() {
    const courseIdsRequest = await graphQLClient.request(gql`
        query($preview:Boolean, $where:CourseFilter) {
            courseCollection(preview:$preview, where:$where) {
                items {
                    notionPageId
                }
            }
        }
    `, {
        preview: config.contentful.preview,
        where: { 
            notionPageId_exists: true
        }
    })

    const data = await cacheClient.getBuildCache({ 
        params: { key: "notion-sitemap" },
    });

    const courseIds = courseIdsRequest?.courseCollection?.items.map((item:ICourse) => item.notionPageId);

    let paths = [];
    let allPaths = [];

    const notionRootCoursePath = {
        route: ['home'],
        blockId: config.notion.rootCoursesPageId
    }

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
        Object.entries(data).forEach(([ blockId, route ]) => {
            paths.push({
                blockId,
                route: (route as string).slice(1).split("/")
            })
            allPaths.push({
                blockId,
                route: (route as string).slice(1).split("/")
            })
        });
    }

    const pathMap = allPaths.reduce((a, { blockId, route }) => {
        return { ...a, [ blockId.replaceAll("-", '') ]: `/${route.join("/")}` }
    }, {})

    await cacheClient.set({ 
        params: { key: ECacheKey.NOTION_SITEMAP },
        data: pathMap,
        redisCache: process.env.NODE_ENV === "production",
        buildCache: true
    });

    return {
      paths: paths.map(({ route }) => ({ params: {
         slug: [ ...route ]
      }})),
      fallback: true
    }
}

export async function getStaticProps(context: { params: { slug:string[] }}) {
    // Get Unofficial Notion API
    const notion = new NotionAPI();

    // Attempt to get Sitemap from cache
    let data = {} as { [key:string]: string }; 

    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD || process.env.NODE_ENV === "development") {
        data = await cacheClient.getBuildCache({ 
            params: { key: ECacheKey.NOTION_SITEMAP }
        });
    } else if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
        data = await cacheClient.getRedisCache({ 
            params: { key: ECacheKey.NOTION_SITEMAP }
        });
    }

    // Attempt to retrieving notion pageId 
    let pageId = parsePageId(context.params.slug[0]);

    if (data && typeof data === "object") {
        // If slug is pageId instead of human readable slug attempt redirect
        if (pageId && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
            const slug = data[pageId.replaceAll("-", '')];
            return {
                redirect: {
                    destination: slug ? `/courses${slug}` : `https://code4tomorrow.notion.site/${pageId.replaceAll("-", '')}`,
                    permanent: true
                }
            }
        }

        // Else if slug is human readable and not pageId, attempt to retrieve pageId from cache
        const inverseObject = invert(data);
        const blockId = inverseObject[encodeURI(`/${context.params.slug.join('/')}`)];
        if(!!blockId) pageId = blockId;
    }

    // If slug is not an identified path from cache or an Id, redirect to course home page
    if (!pageId && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && !!Object.keys(data).length) {
        return {
            redirect: {
                destination: `/courses`,
                permanent: false,
            }
        }
    } 

    // Attempt getting page recordMap from valid notion pageId
    let isCache = false; 
    let recordMap: ExtendedRecordMap | undefined; 

    recordMap = await pRetry(async () => {
        // Only use cache during production build, not during ISR
        if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
            const recordMapFromCache = await cacheClient.getRedisCache({ 
                params: {
                    key: ECacheKey.NOTION_PAGE_RECORD_MAP,
                    pageId
                }
            });
    
            if (!!Object.keys(recordMapFromCache).length) {
                isCache = true;
                return recordMapFromCache;
            }
    
        } 

        const map = await notion.getPage(pageId, { gotOptions: { retry: 3 }});
        if (map?.block) {
            for (const block in map.block) {
                const type = map.block[block]?.value?.type as string; 
                if (["factory", "link_to_page"].includes(type)) delete map.block[block];
           }
        }
        return map;
    },  { retries: 3, minTimeout: 1000 }).catch((e) => {
        console.log(e);
    });

    // Downtime between page querying to prevent exceeding notion rate limit ( ~750 ms )
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD && !isCache) {
        await new Promise((resolve) => { setTimeout(() => { resolve(true) }, 750)}); 
    }

    if (!recordMap) {
        throw new Error(`Failed to Query Page ${pageId}`)
    } else if (!isCache) {
        recordMap = filterRecordMap(recordMap);

        await cacheClient.set({
            redisCache: process.env.NODE_ENV === "production",
            data: recordMap,
            ttl: 60 * 60 * 24 * 30, // 30 days in seconds 
            params: { key: ECacheKey.NOTION_PAGE_RECORD_MAP, pageId }
        })
    }

    // Retrieve notion pageIds for mapping slugs
    let linksMap = {} 
    
    if (data && typeof data === "object" && recordMap) {
        linksMap = Object
            .values(recordMap.block)
            .filter(({ value }) => value?.type === "page")
            .map(({ value }) => ({ id: value?.id, route: data[value.id.replaceAll('-', '')] || null }))
            .filter(({ route }) => !!route)
            .reduce((a, b) => ({
                ...a, [ b.id ] : b.route
            }), {}) 
    }

    // Get placeholder images 
    if (recordMap) {
        const previewImageMap = await getPreviewImageMap(recordMap);
        (recordMap as any).preview_images = previewImageMap
    }

    return {
        props: {
            recordMap: recordMap || {},
            linksMap,
            pageId,
        },
        revalidate: 15 * 60 // 15 minutes
    }
}
  

export default NotionCourse; 