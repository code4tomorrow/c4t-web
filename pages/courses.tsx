import { gql } from "graphql-request";
import { graphQLClient } from "@utils/contentful";
import { NextPage } from "next";
import Head from "next/head";
import Navbar from "@components/Navbar";
import useEmblaCarousel from 'embla-carousel-react'
import Course from "@components/Course";
import Footer from "@components/Footer";

export interface ICourse {
    title?: string; 
    description?: string; 
}

interface CoursesProps {
    courses: ICourse[]
}

const Courses : NextPage<CoursesProps> = ({ courses }) => {
    const [emblaRef, emblaAPI ] = useEmblaCarousel({ align: "center", inViewThreshold: 3 })

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }}
            className="flex flex-col w-screen min-h-screen bg-dark-grey-primary">
            <Head>
                <title>Courses | C4T</title>
            </Head>
            <Navbar />
            <main className="w-full h-full flex flex-col justify-center items-center">
                <div className="w-full mt-[100px] flex justify-center" ref={emblaRef}>
                    <div className="flex w-full space-x-8 items-center justify-center">
                        {/* {
                            courses.map((course, i) => (
                                <Course key={i} course={course} />
                            ))
                        } */}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

export async function getStaticProps() {
    const response = await graphQLClient.request(gql`
      query($limit:Int) {
        courseCollection(limit:$limit) {
          items {
            title,
            description
          }
        }
      }
    `, { limit: 10 });
      
    return {
      props: { 
        courses: response?.courseCollection?.items || [],
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}

export default Courses; 