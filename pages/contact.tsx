import Head from "next/head";
import React, { ReactElement } from "react";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";

const ContactPage : NextPageWithLayout = () => {
    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
        className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Contact | C4T</title>
            </Head>
            <Navbar/>
            <main>
                
            </main>
            <Footer />
        </div>
    )
}

ContactPage.getLayout = (page: ReactElement) => {
    return (
      <WatsonAssistantChat>
        { page }
      </WatsonAssistantChat>
    )
  }


export default ContactPage; 