import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import { NextPage } from "next";
import Head from "next/head";
import VolunteerCard from "@components/Volunteer";
import { gql } from "graphql-request";
import { graphQLClient, IBaseContentModel } from "@utils/contentful";
import Animate from "@components/Animate";
import VolunteerTeamSVG from "@svg/volunteer-team.svg";

export interface IVolunteerOpportunity extends IBaseContentModel {
    name?: string; 
    description?: {
        json: any; 
    },
    link?: string; 
    buttonLabel?: string; 
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
            <Animate>
                <main className="pt-4 px-6 w-full my-12 flex flex-col items-center">
                    <Animate.Element 
                        resetAfterTriggered={false}
                        from={{ y: 30, opacity: 0 }}
                        to={{ y: 0, opacity: 1, delay: 0 }}
                        className="w-full flex justify-center items-center relative h-[200px] mb-8">
                        <VolunteerTeamSVG width={"100%"} height={"100%"} />
                    </Animate.Element>
                    <Animate.Element
                        resetAfterTriggered={false}
                        as="h1" 
                        from={{ y: 60, opacity: 0 }}
                        to={{ y: 0, opacity: 1, delay: 0.15 }}
                        className="text-5xl font-bold text-white text-center">
                            Volunteer Opportunities
                    </Animate.Element>
                    <Animate.Element
                        resetAfterTriggered={false}
                        as="p" 
                        from={{ y: 90, opacity: 0 }}
                        to={{ y: 0, opacity: 1, delay: 0.3 }}
                        className="text-lg !mt-3 text-medium-grey text-center">
                        Apply today for an opportunity to hone your skills and help others, all while gaining <b>volunteer hours</b>.
                    </Animate.Element>
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
            </Animate>
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
                buttonLabel,
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