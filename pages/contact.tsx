import Head from "next/head";
import React, { ReactElement, useState } from "react";
import { NextPageWithLayout } from "common/interfaces/nextPageWithLayout";
import WatsonAssistantChat from "@layouts/WatsonAssistantChat";
import Footer from "@components/Footer";
import Navbar from "@components/Navbar";
import DepartmentContact from "@components/Contact/DepartmentContact";
import { graphQLClient } from "@utils/contentful";
import { gql } from "graphql-request";
import config from "config";
import { INotificationFlag } from "common/interfaces/navigationFlag";
import { IDepartmentContact } from "common/interfaces/departmentContact";

interface ContactProps {
    notificationFlags: INotificationFlag[],
    departmentContacts: IDepartmentContact[]
}


const ContactPage : NextPageWithLayout<ContactProps> = ({ notificationFlags, departmentContacts }) => {
    const [ departmentId, setDepartmentId ] = useState<string | undefined>();

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
        className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Contact | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags} />
            <main className="flex flex-col items-center my-5 w-full">
                <h1 
                    style={{
                       textShadow: "5px 5px #5A4CAD"
                    }}
                    className="text-7xl md:text-8xl text-brand-purple-secondary text-center space-x-6 flex md:flex-row flex-col font-semibold">
                        <span>Contact</span>
                        <span className="text-white">C4T</span>
                </h1>
                {/* <h2
                    className="text-7xl mt-5 text-white font-semibold">Code4Tomorrow.org</h2> */}
                <section className="py-4 mt-5 flex space-x-3">
                    {
                        departmentContacts.map((contact) => (
                            <DepartmentContact 
                                contact={contact}
                                onClick={(id) => setDepartmentId(id)}
                                selected={contact.sys.id === departmentId}
                                key={contact.sys.id} 
                            />
                        ))
                    }
                </section>
                <textarea maxLength={2500} 
                    className="bg-dark-grey-secondary outline-none rounded-md min-h-[250px] text-white p-3 w-1/2">

                </textarea>
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

  export async function getStaticProps() {
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
      contactCollection(preview:$preview) {
        items {
            name,
            email,
            description,
            sys {
                id
            }
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
    const departmentContacts = response?.contactCollection?.items || []; 

    return {
      props: { 
        departmentContacts,
        notificationFlags
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}

export default ContactPage; 