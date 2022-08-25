import React, { useMemo } from "react";
import { getSiteMap } from "@utils/notion/getSiteMap";
import { NotionRenderer } from "react-notion-x";
import { InferGetStaticPropsType } from "next";
import { NotionAPI } from 'notion-client'
import { parsePageId, getPageTitle } from "notion-utils";
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cache as staticStaticPropsClient } from "@utils/cacheStaticProps"; 
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

const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf as any),
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
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection as any
  )
)

const Modal = dynamic(
  () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
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
                darkMode={true}
                disableHeader={false}
                fullPage={true}
                mapPageUrl={(pageId: string) => {
                    const slug = linksMap[pageId] || `/${pageId}`;
                    return `/courses${slug}`
                }}
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

    const data = await staticStaticPropsClient.get({ 
        params: { key: "notion-sitemap" }
    });

    const courseIds = courseIdsRequest?.courseCollection?.items.map((item:ICourse) => item.notionPageId);

    let paths = [];
    let allPaths = [];


    if (!Object.keys(data).length) {
        for (let i = 0; i < courseIds.length; i++) {
            const response = await getSiteMap(courseIds[i]); 
            paths.push(...response.slice(0,45));
            allPaths.push(...response);
        }

        const pathMap = allPaths.reduce((a, { blockId, route }) => {
            return { ...a, [ blockId.replaceAll("-", '') ]: `/${route.join("/")}` }
        }, {})
    
        await staticStaticPropsClient.set({ 
            params: { key: "notion-sitemap" },
            data: pathMap
        });
    } else {
        console.log("Using Cached Notion Sitemap");
        Object.values(data).forEach((val:any) => {
            paths.push({
                route: val.slice(1).split("/")
            })
        });
    }

    paths = paths.slice(0, 300);

    return {
      paths: paths.map(({ route }) => ({ params: {
         slug: [ ...route ]
      }})),
      fallback: true
    }
}

export async function getStaticProps(context: { params: { blockId: string, slug:string[] }}) {
    const notion = new NotionAPI();

    const data = await staticStaticPropsClient.get({ 
        params: { key: "notion-sitemap" }
    });

    let pageId = parsePageId(context.params.slug[0]);

    if (data && typeof data === "object") {
        if (pageId && context.params.slug.length > 1) {
            const slug = data[pageId.replaceAll("-", '')];
            return {
                redirect: {
                    destination: slug ? `courses/${slug}` : `https://code4tomorrow.notion.site/${pageId.replaceAll("-", '')}`,
                    permanent: true
                }
            }
        }    
        const inverseObject = invert(data);
        const blockId = inverseObject[`/${context.params.slug.join('/')}`];
        if(!!blockId) pageId = blockId;
    }

    if (!pageId) {
        return {
            redirect: {
                destination: `/courses`,
                permanent: false,
            }
        }
    } 

    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
        await new Promise((resolve) => { setTimeout(() => { resolve(true) }, 1000)});
    }

    const recordMap = await pRetry(async () => {
        return await notion.getPage(pageId, { gotOptions: { retry: 3 }}).catch(() => undefined)
    }).catch(() => undefined);

    if (!recordMap) {
        console.log(`Failed to Query Page ${pageId}`);
        return {
            notFound: true,
        }
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