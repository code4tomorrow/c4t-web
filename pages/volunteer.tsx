import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPage } from "next";
import Head from "next/head";
import VolunteerCard from "@components/Volunteer";
import { gql } from "graphql-request";
import Image from "next/image";
import { graphQLClient, IBaseContentModel } from "@utils/contentful";

export interface IVolunteerOpportunity extends IBaseContentModel {
    name?: string; 
    description?: {
        json: any; 
    },
    link?: string; 
    accentColor?: string; 
}

interface VolunteerProps {
    volunteerOpportunities: IVolunteerOpportunity[];
}

const Volunteer : NextPage<VolunteerProps> = ({ volunteerOpportunities }) => {
    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Volunteer | C4T</title>
            </Head>
            <Navbar />
            <main className="pt-4 px-6 w-full my-12 flex flex-col items-center">
                <div className="w-full relative h-[200px] mb-8">
                    <Image
                        src="/svg/volunteer-team.svg"
                        layout="fill"
                    />
                </div>
                <h1 className="text-5xl font-bold text-white text-center">Volunteer Opportunities</h1>
                <p className="text-lg !mt-3 text-medium-grey-primary text-center">
                    Apply today for an opportunity to hone your skills and help others, all while gaining 
                    &nbsp;<u>volunteer hours</u>.
                </p>
                <div 
                    style={{ gridTemplateColumns: "repeat(auto-fit, 300px)"}}
                    className="grid w-full mt-9 gap-6 justify-items-center justify-center">
                    {
                        volunteerOpportunities.map((opportunity) => (
                            <VolunteerCard key={opportunity.sys?.id} opportunity={opportunity} />
                        ))
                    }
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Volunteer; 

export async function getStaticProps() {
    const response = await graphQLClient.request(gql`
      query {
        volunteerOpportunityCollection {
            items {
                sys {
                    id
                }
                accentColor,
                name,
                link,
                description {
                    json
                }
            }
        }
      }
    `, {});

    const volunteerOpportunities:IVolunteerOpportunity[] = response?.volunteerOpportunityCollection?.items || [];
      
    return {
      props: { 
        volunteerOpportunities
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}