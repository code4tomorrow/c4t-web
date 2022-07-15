import Directory from "@components/About/Directory";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { getDirectory, IDirectoryRow } from "@utils/notion/directory";
import { NextPage } from "next";
import Head from "next/head";

interface AboutProps {
    directoryEntries: IDirectoryRow[]
}

const About : NextPage<AboutProps> = ({ directoryEntries }) => {
    // console.log(directoryEntries);
    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>About | C4T</title>
            </Head>
            <Navbar />
            <main className="pt-4 px-6 w-full my-12 flex flex-col items-center">
                <Directory directoryEntries={directoryEntries} />
            </main>
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