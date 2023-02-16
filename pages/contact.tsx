import Head from "next/head";
import React, { ChangeEvent, FormEvent, ReactElement, useCallback, useEffect, useState } from "react";
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
import { makeStyles } from "tss-react/mui";
import clsx from "clsx";
import BrandButton from "@components/BrandButton";
import { PaperAirplaneIcon } from "@heroicons/react/outline";
import useEmblaCarousel from "embla-carousel-react";

interface ContactProps {
    notificationFlags: INotificationFlag[],
    departmentContacts: IDepartmentContact[]
}


const ContactPage : NextPageWithLayout<ContactProps> = ({ notificationFlags, departmentContacts }) => {
    const [ departmentId, setDepartmentId ] = useState<string | undefined>();

    const [ message, setMessage] = useState<string>("");

    const { classes } = makeStyles()(() => ({
      messageContainer: {
        WebkitAppearance: "none",
        boxShadow: `0px 0px 0px 0px #8C8796`,
        "&:focus": {
          boxShadow: "0px 0px 0px 3px #8C8796"
        }
      }
    }))();

    const handleSubmit = (e:FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const a = document.createElement("a");
      const departmentEmail = departmentContacts.find(contact => contact.sys.id === departmentId)?.email; 
      a.href = `mailto:${departmentEmail}?body=${message}`;
      a.target="_blank";
      a.click();
    }

    console.log(message);

    const [emblaRef, _emblaAPI ] = useEmblaCarousel({ }, []);

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }} 
        className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Contact | C4T</title>
            </Head>
            <Navbar notificationFlags={notificationFlags} />
            <main className="flex flex-col items-center my-5 w-full px-3">
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
                <section className="py-4 mt-5" ref={emblaRef}>
                    <div className="flex space-x-3">
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
                    </div>
                </section>
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-10">
                  <textarea maxLength={2500} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className={clsx(
                        "bg-dark-grey-secondary transition-all resize-none outline-none rounded-md min-h-[250px] text-white p-3 w-full md:w-1/2",
                        classes.messageContainer
                      )}>

                  </textarea>
                  <BrandButton 
                    disabled={!departmentId}
                    className="flex items-center"
                    onClick={() => {}}
                    title="Send Message"
                  >
                    <PaperAirplaneIcon color="#fff" className="rotate-45 -translate-y-[1px]" width={20} />
                  </BrandButton>
                </form>
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