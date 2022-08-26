import React, { useMemo } from "react";
import { getSiteMap } from "@utils/notion/getSiteMap";
import { NotionRenderer } from "react-notion-x";
import { InferGetStaticPropsType } from "next";
import { NotionAPI } from 'notion-client'
import { parsePageId, getPageTitle } from "notion-utils";
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cache as cacheClient } from "@utils/cacheStaticProps"; 
import pRetry from 'p-retry';

import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

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

const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf as any),
    {
        ssr: false
    }
)

const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    {
      ssr: true
    }
  )

const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation as any)
)


const Code = dynamic(
    () => import('react-notion-x/build/third-party/code').then(async (m) => {
        await Promise.all([
            import('prismjs/components/prism-markup-templating.js'),
            import('prismjs/components/prism-markup.js'),
            import('prismjs/components/prism-bash.js'),
            import('prismjs/components/prism-c.js'),
            import('prismjs/components/prism-cpp.js'),
            import('prismjs/components/prism-csharp.js'),
            import('prismjs/components/prism-java.js'),
            import('prismjs/components/prism-markdown.js'),
            import('prismjs/components/prism-objectivec.js'),
            import('prismjs/components/prism-python.js'),
            import('prismjs/components/prism-sass.js'),
            import('prismjs/components/prism-scss.js'),
            import('prismjs/components/prism-sql.js'),
            import('prismjs/components/prism-swift.js'),
        ])
        return m.Code as any
    }),
    { 
        ssr: false
    }
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then((m) => m.Collection as any),
  {
    ssr: false
  }
)

const NotionCourse : React.FC<InferGetStaticPropsType<typeof getStaticProps>> = ({ recordMap, linksMap, pageId }) => {
    const router = useRouter()

    const title = useMemo(() => {
        return recordMap ? getPageTitle(recordMap) : "Courses"
    }, [ recordMap ]);

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>{title} | C4T</title>
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
        blockId: '785a612a6b534ec4ba34ca52905fcda9'
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
        Object.entries(data).forEach((entry) => {
            paths.push({
                blockId: entry[0],
                route: (entry[1] as string).slice(1).split("/")
            })
            allPaths.push({
                blockId: entry[0],
                route: (entry[1] as string).slice(1).split("/")
            })
        });
    }

    const pathMap = allPaths.reduce((a, { blockId, route }) => {
        return { ...a, [ blockId.replaceAll("-", '') ]: `/${route.join("/")}` }
    }, {})

    await cacheClient.set({ 
        params: { key: "notion-sitemap" },
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
    const notion = new NotionAPI();

    let data = {} as { [key:string]: string}; 

    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD || process.env.NODE_ENV === "development") {
        data = await cacheClient.getBuildCache({ 
            params: { key: "notion-sitemap" }
        });
    } else {
        data = await cacheClient.getRedisCache({ 
            params: { key: "notion-sitemap" }
        });
    }

    let pageId = parsePageId(context.params.slug[0]);

    if (data && typeof data === "object") {
        if (pageId && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
            const slug = data[pageId.replaceAll("-", '')];
            return {
                redirect: {
                    destination: slug ? `/courses${slug}` : `https://code4tomorrow.notion.site/${pageId.replaceAll("-", '')}`,
                    permanent: true
                }
            }
        }

        const inverseObject = invert(data);
        const blockId = inverseObject[encodeURI(`/${context.params.slug.join('/')}`)];
        if(!!blockId) pageId = blockId;
    }

    if (!pageId && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD && !!Object.keys(data).length) {
        return {
            redirect: {
                destination: `/courses`,
                permanent: false,
            }
        }
    } 

    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
        await new Promise((resolve) => { setTimeout(() => { resolve(true) }, 500)});
    }

    const recordMap = await pRetry(async () => {
        return await notion.getPage(pageId, { gotOptions: { retry: 3 }}).catch(() => undefined)
    }).catch(() => undefined);

    if (!recordMap) {
        throw new Error(`Failed to Query Page ${pageId}`)
    }

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

    const previewImageMap = await getPreviewImageMap(recordMap);
    (recordMap as any).preview_images = previewImageMap

    return {
        props: {
            recordMap: recordMap || {},
            linksMap,
            pageId,
        },
        revalidate: 1500
    }
}
  

export default NotionCourse; 