import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Head from "next/head";
import React, { ReactElement } from "react";

const JobBoard : NextPageWithLayout = () => {
    return (
        <div 
            style={{ width: "100vw", overflowX: "clip" }} 
            className="flex flex-col w-screen top-[100px] min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Job Board | C4T</title>
            </Head>
            <Navbar />
            <Footer/>
        </div>
    )
}

JobBoard.getLayout = (page: ReactElement ) => {
    return (
        <WatsonAssistantChat>
        { page }
        </WatsonAssistantChat>
    )
}

export default JobBoard; 