import Directory from "@components/About/Directory";
import Animate from "@components/Animate";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { getDirectory, IDirectoryRow } from "@utils/notion/directory";
import { NextPage } from "next";
import Head from "next/head";

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
                                Meet Our Team
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