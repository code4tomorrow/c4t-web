import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPage } from "next";
import Head from "next/head";
import VolunteerCard from "@components/Volunteer";

const Volunteer : NextPage = () => {
    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Volunteer | C4T</title>
            </Head>
            <Navbar />
            <main className="pt-16 my-6">
                <VolunteerCard />
            </main>
            <Footer />
        </div>
    )
}

export default Volunteer; 