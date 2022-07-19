import Directory from "@components/About/Directory";
import Skill from "@components/About/Skill";
import Animate from "@components/Animate";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { getDirectory, IDirectoryRow } from "@utils/notion/directory";
import { NextPage } from "next";
import Head from "next/head";
import PairCoding from "@svg/pair-coding.svg";

interface AboutProps {
    directoryEntries: IDirectoryRow[]
}

const About : NextPage<AboutProps> = ({ directoryEntries }) => {
    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>About | C4T</title>
            </Head>
            <Navbar />
            <Animate>
                <main className="pt-4 md:px-6 px-4 w-full my-12 flex flex-col items-center">
                    <div className="my-6">
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
                            className="text-lg !mt-3 text-medium-grey text-center max-w-4xl">
                            During a 6 week session, learn the most <b>in-demand skills</b> with motivated students and teachers from the comfort of your home, <b>plus it's free.</b>
                        </Animate.Element>
                    </div>
                    <section className="md:[&>div]:w-1/2 md:space-x-6 w-screen flex md:flex-row flex-col-reverse p-3 sm:p-6 max-w-7xl justify-items-center">
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
                    </section>
                    <div className="my-6 mt-32">
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
                            className="text-lg !mt-3 text-medium-grey max-w-4xl text-center">
                            Together, a devoted set of High schoolers embark on making quality coding lessons <b>more accessible</b>.
                        </Animate.Element>
                    </div>
                    <Directory directoryEntries={directoryEntries} />
                </main>
            </Animate>
            <Footer />
        </div>
    )
}

export default About; 

export async function getStaticProps() {
    const directoryEntries = await getDirectory();

    return {
      props: { 
        directoryEntries
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}