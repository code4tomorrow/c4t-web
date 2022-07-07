import { gql } from "graphql-request";
import { graphQLClient } from "@utils/contentful";
import { NextPage } from "next";
import Head from "next/head";
import Navbar from "@components/Navbar";
import useEmblaCarousel from 'embla-carousel-react'
import Course from "@components/Course";
import Footer from "@components/Footer";
import CoursesSVG from "@svg/courses.svg";
import Animate from "@components/Animate";
import clsx from "clsx";
import { useStyles } from "./styles";

export interface ICourse {
    title?: string; 
    description?: string; 
}

interface CoursesProps {
    courses: ICourse[]
}

const Courses : NextPage<CoursesProps> = ({ courses }) => {
    const [emblaRef, _emblaAPI ] = useEmblaCarousel({ 
      axis: "y",
      skipSnaps: false,
      speed: 1,
      align: "start",
    })

    const { classes } = useStyles();

    return (
        <div style={{ width: "100vw", overflowX: "hidden" }}
            className="flex flex-col w-screen min-h-screen items-center bg-dark-grey-primary">
            <Head>
                <title>Courses | C4T</title>
            </Head>
            <Navbar />
            <Animate>
              <main className={clsx(
                "w-full pt-16 flex-col items-center space-y-6 max-w-screen-2xl px-3 h-full my-8 flex justify-center",
                "md:flex-row md:space-y-0 md:items-start md:px-8 md:space-x-6"
              )}>
                  <div className="relative">
                    <div className="sticky top-10">
                      <CoursesSVG className="w-full max-w-[250px] md:max-w-xl md:w-[35vw]"/>
                    </div>
                  </div>
                  <article className="md:w-1/2 w-full space-y-2 flex flex-col items-center">
                    <Animate.Element resetAfterTriggered={false} from={{ y: 50, opacity: 0 }} to={{ y: 0, opacity: 1 }}>
                      <h1 className="text-white text-center font-bold text-4xl">Browse our <span className="text-brand-green">Quality</span> Courses.</h1>
                    </Animate.Element>
                    <Animate.Element resetAfterTriggered={false} from={{ y: 50, opacity: 0 }} to={{ y: 0, opacity: 1, delay: 0.15 }}>
                      <h2 className="text-medium-grey-primary text-center font-medium text-lg">Choose as many as you want from Beginner to Advanced.</h2>
                    </Animate.Element>
                    <div className="!mt-8 hidden w-full lg:flex overflow-hidden max-h-[750px] justify-center" ref={emblaRef}> 
                        <div className="grid gap-3 grid-cols-2">
                            {
                                courses.map((course, i) => (
                                    <Course key={i} course={course} />
                                ))
                            }
                        </div>
                      </div>
                      <div 
                          className={clsx(
                            "lg:hidden !mt-8 w-full grid justify-items-center justify-center gap-4",
                            classes.mobileCoursesContainer
                          )}>
                          {
                            courses.map((course, i) => (
                                <Course key={i} course={course} />
                            ))
                          }
                      </div>
                  </article>
              </main>
            </Animate>
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