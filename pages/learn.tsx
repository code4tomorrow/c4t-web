import Animate from "@components/Animate";
import Footer from "@components/Footer";
import FAQSection from "@components/Learn/FAQSection";
import Navbar from "@components/Navbar";
import { graphQLClient } from "@utils/contentful";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import config from "config";
import { gql } from "graphql-request";
import { NextPage } from "next";
import Head from "next/head";

export interface IFAQ {
    question?: string; 
    type: string; 
    answer?: {
        json?: any
    }
}

export interface GroupedFAQS {  
    [ type: string ] : IFAQ[]
 }

interface LearnProps {
    faqsGroupedByType: GroupedFAQS,
    notificationFlags: INotificationFlag[]
}

const Learn : NextPage<LearnProps> = ({ faqsGroupedByType, notificationFlags }) => {
    return ( 
        <div style={{ width: "100vw", overflowX: "clip" }} 
            className="flex flex-col w-screen sticky top-[100px] min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Learn | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags} />
            <Animate>
                <main className="w-full mt-3 p-4 px-8 flex flex-col items-center">
                    <FAQSection faqsGroupedByType={faqsGroupedByType}/>
                </main>
            </Animate>
            <Footer />
        </div>
    )
}

export async function getStaticProps() {
    const response = await graphQLClient.request(gql`
      query($preview:Boolean, $where:NotificationFlagFilter) {
        faqCollection(preview:$preview) {
            items {
                question,
                type,
                answer {
                    json
                }
            }
        }
        notificationFlagCollection(preview:$preview, where:$where) {
          items {
            notification {
              json
            },
            type,
            link
          }
        }
    }
    `, { 
        preview: config.contentful.preview,
        where: { 
            isVisible:true, 
            pages_contains_some:["/learn", "*"]
        }
    });

    const faqs:IFAQ[]= response?.faqCollection?.items || [];
    const notificationFlags:INotificationFlag[] = response?.notificationFlagCollection?.items || [];  

    const faqsGroupedByType = faqs.reduce((a, b) => {
       return { ...a, [ b.type ]: [ ...(a[b.type] || []), b] };
    }, {} as GroupedFAQS);

    return {
      props: { 
        faqsGroupedByType,
        notificationFlags
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}

export default Learn; 