import Directory from "@components/About/Directory";
import Skill from "@components/About/Skill";
import Animate from "@components/Animate";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { getDirectory, IDirectoryRow } from "@utils/notion/directory";
import { NextPage } from "next";
import Head from "next/head";
import PairCoding from "@svg/pair-coding.svg";
import MissionImage from "@svg/mission.svg"
import Book from "@svg/book.svg"
import { useRef } from "react";
import { graphQLClient } from "@utils/contentful";
import { gql } from "graphql-request";
import config from "config";
import { INotificationFlag } from "common/interfaces/navigationFlag";

interface AboutProps {
    directoryEntries: IDirectoryRow[],
    notificationFlags: INotificationFlag[]
}

const About : NextPage<AboutProps> = ({ directoryEntries, notificationFlags }) => {
    const missionRef = useRef<HTMLDivElement | null>(null);

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>About | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags} />
            <Animate>
                <main className="pt-4 md:px-6 px-4 w-full my-8 flex flex-col items-center">
                    <section className="my-6 flex flex-col items-center">
                        <Animate.Element 
                            resetAfterTriggered={false}
                            from={{ y: 30, opacity: 0}}
                            to={{ y: 0, opacity: 1 }}
                            className="w-full max-w-md mb-16">
                            <Book className="w-full"/>
                        </Animate.Element>
                        <Animate.Element
                            resetAfterTriggered={false}
                            as="h1" 
                            from={{ y: 60, opacity: 0 }}
                            to={{ y: 0, opacity: 1 }}
                            className="md:text-6xl text-4xl font-bold text-white text-center">
                                What is <span className="text-brand-purple-secondary">Code4Tomorrow</span>?
                        </Animate.Element>
                        <Animate.Element
                            resetAfterTriggered={false}
                            as="p" 
                            from={{ y: 90,  opacity: 0 }}
                            to={{ y: 0, opacity: 1, delay: 0.15 }}
                            className="text-lg !mt-3 text-medium-grey text-center max-w-4xl">
                            Code 4 Tomorrow&apos;s uniqueness lies in the fact that we are entirely student-run, from the official website to merch design and finance management. Fiscally sponsored by Irvine LIGHTS, C4T is a 501(c)(3) non-profit organization that offers free coding classes to students around the globe, as well as community service opportunities to our members and teachers.
                        </Animate.Element>
                    </section>
                    <section ref={missionRef} className="md:[&>div]:w-1/2 mt-32 md:space-x-6 w-screen flex md:flex-row flex-col-reverse p-3 sm:p-20 max-w-7xl justify-items-center">
                        <div className="my-10">
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="h1" 
                                from={{ y: 60, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white">
                                    Our <span className="text-brand-purple-secondary">Mission</span>
                            </Animate.Element>
                            <br></br>
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="p" 
                                from={{ y: 90,  opacity: 0 }}
                                to={{ y: 0, opacity: 1, delay: 0.15 }}
                                className="text-lg !mt-3 text-medium-grey max-w-4xl">
                                C4T aims to provide a bridge that connects students worldwide to their future by linking professionals and executives to mentor students, and providing a dynamic, driven team of high school students to teach topics from the humanities to STEM. We aim to inspire the next generation to consider career paths in Computer Science or STEM.
                            </Animate.Element>
                        </div>
                        <Animate.Scrub 
                            ref={missionRef}
                            start="top bottom"
                            end="bottom bottom"
                            from={{ y: 300 }}
                            to={{ y: 0 }}
                            className="flex flex-col justify-center">
                            <MissionImage className="w-full"/>
                        </Animate.Scrub>
                    </section>
                    <section className="flex mt-32 flex-col items-center">
                        <div className="my-6 max-w-4xl">
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="h1" 
                                from={{ y: 60, opacity: 0 }}
                                to={{ y: 0, opacity: 1 }}
                                className="text-5xl font-bold text-white text-center">
                                    A <span className="text-brand-purple-secondary">Crucial</span> Experience
                            </Animate.Element>
                            <Animate.Element
                                resetAfterTriggered={false}
                                as="p" 
                                from={{ y: 90,  opacity: 0 }}
                                to={{ y: 0, opacity: 1, delay: 0.15 }}
                                className="text-lg !mt-3 text-medium-grey text-center ">
                                During a 6 week session, learn the most <b>in-demand skills</b> with motivated students and teachers from the comfort of your home, <b>plus it&apos;s free.</b>
                            </Animate.Element>
                        </div>
                        <div className="md:[&>div]:w-1/2 md:space-x-6 w-screen flex md:flex-row flex-col-reverse p-3 sm:p-6 max-w-7xl justify-items-center">
                            <div style={{ gridTemplateColumns: "1fr 1fr"}} className="grid md:pt-0 pt-12 sm:gap-6 gap-3 justify-center items-center">
                                <Skill stat={"2800+"} label="Alumni Students">
                                    Just under a month and a half students are taught priceless skills by qualified teachers.
                                </Skill>
                                <Skill stat={"134+"} label="Teachers">
                                    Over a hundred dedicated high-school teachers pouring their knowledge to k-12 students.
                                </Skill>
                                <Skill stat={"20+"} label="Cities">
                                    Our organization has reached over 20 cities globally attempting to provide quality coding guidance and training.
                                </Skill>
                                <Skill stat={"139+"} label="Classes Taught">
                                    Just under a month and a half students are taught priceless skills by qualified teachers.
                                </Skill>
                            </div>
                            <div className="flex flex-col justify-center">
                                <PairCoding className="w-full"/>
                            </div>
                        </div>
                    </section>
                    <section className="flex my-32 w-full flex-col items-center">
                        <div className="my-6 max-w-4xl">
                                <Animate.Element
                                    resetAfterTriggered={false}
                                    as="h1" 
                                    from={{ y: 60, opacity: 0 }}
                                    to={{ y: 0, opacity: 1 }}
                                    className="text-5xl font-bold text-white text-center">
                                        Meet Our <span className="text-brand-purple-secondary">Dedicated</span> Team
                                </Animate.Element>
                                <Animate.Element
                                    resetAfterTriggered={false}
                                    as="p" 
                                    from={{ y: 90,  opacity: 0 }}
                                    to={{ y: 0, opacity: 1, delay: 0.15 }}
                                    className="text-lg !mt-3 text-medium-grey text-center">
                                    Together, a devoted set of High schoolers embark on making quality coding lessons <b>more accessible</b>.
                                </Animate.Element>
                            </div>
                            <Directory directoryEntries={directoryEntries} />
                    </section>
                </main>
            </Animate>
            <Footer />
        </div>
    )
}

export default About; 

export async function getStaticProps() {
    const directoryEntries = await getDirectory();

    const response = await graphQLClient.request(gql`
    query($preview:Boolean, $where:NotificationFlagFilter) {
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
        pages_contains_some:["/about", "*"]
      }}
    );

  const notificationFlags:INotificationFlag[] = response?.notificationFlagCollection?.items || [];
  

    return {
      props: { 
        directoryEntries,
        notificationFlags
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}