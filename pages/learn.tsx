import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPage } from "next";
import Head from "next/head";

const Learn : NextPage = () => {
    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Learn | C4T</title>
            </Head>
            <Navbar />
            <Footer />
        </div>
    )
}

export default Learn; 