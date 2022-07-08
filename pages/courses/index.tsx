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
import { useCallback, useEffect, useState } from "react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { useMemo } from "react";

export interface ICourse {
    title?: string; 
    description?: string; 
    learnMoreLink?: string; 
    promotionalLabel?: {
      label: string; 
      color?: string; 
    },
    image?: {
      src: string; 
    }
}

interface CoursesProps {
    courses: ICourse[]
}

function* pair<T>(iterable:Iterable<T>) : Iterable<Iterable<T>> {
    const iterator = iterable[Symbol.iterator]();
    let curr = iterator.next();
    let next:IteratorResult<T> | undefined = iterator.next();
    while (!curr.done) {
      const nextPair = [ curr.value ];
      if (next?.value) nextPair.push(next.value);
      yield nextPair; 

      curr = iterator.next(); 
      next = !curr.done ? iterator.next() : undefined;
    }
}

const Courses : NextPage<CoursesProps> = ({ courses }) => {
    const [emblaRef, emblaAPI ] = useEmblaCarousel({ 
      axis: "y",
      skipSnaps: false,
      align: "start",
    })

    const [ carouselMeta, setCarouselMeta ] = useState<{
        currentIndex: number,
        hasNext: boolean,
        hasPrev: boolean,
    }>({
        currentIndex: 0,
        hasNext: false,
        hasPrev: false,
    });

  const onSelect = useCallback(() => {
      if (!emblaAPI) return; 
      setCarouselMeta({ 
          currentIndex: emblaAPI.selectedScrollSnap(),
          hasNext: emblaAPI.canScrollNext(),
          hasPrev: emblaAPI.canScrollPrev(),
      })
  }, [ emblaAPI ]);

    useEffect(() => {
      onSelect();
  }, [ onSelect ]);

  const handleLeft = () => {
      if (emblaAPI?.canScrollPrev()) {
          emblaAPI?.scrollPrev();
      }
  }

  const handleRight = () => {
      if (emblaAPI?.canScrollNext()) {
          emblaAPI?.scrollNext();
      }
  }

  useEffect(() => {
      if (!emblaAPI) return; 
      emblaAPI.on("select", onSelect);
      return () => {
          emblaAPI.off("select", onSelect)
      }
  }, [ emblaAPI, onSelect ]);

  const coursesPaired = useMemo(() => {
    const iterable = pair(courses); 
    const iterator = iterable[Symbol.iterator]();
    const result = [];
    let next = iterator.next(); 
    while (!next.done) {
      result.push(Array.from(next.value));
      next = iterator.next();
    }
    return result; 
  }, [ courses ]);

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
                  <div className="sticky top-10">
                    <div className="sticky top-10">
                      <CoursesSVG className="w-full max-w-[250px] md:max-w-xl md:w-[35vw]"/>
                    </div>
                  </div>
                  <article className="md:w-1/2 w-full relative space-y-2 flex flex-col items-center">
                    <Animate.Element resetAfterTriggered={false} from={{ y: 50, opacity: 0 }} to={{ y: 0, opacity: 1 }}>
                      <h1 className="text-white text-center font-bold text-4xl">Browse our <span className="text-brand-green">Quality</span> Courses.</h1>
                    </Animate.Element>
                    <Animate.Element resetAfterTriggered={false} from={{ y: 50, opacity: 0 }} to={{ y: 0, opacity: 1, delay: 0.15 }}>
                      <h2 className="text-medium-grey-primary text-center font-medium text-lg">Choose as many as you want from Beginner to Advanced.</h2>
                    </Animate.Element>
                    <div 
                        style={{
                          WebkitMaskImage: "-webkit-gradient(linear, left 75%, left 100%, from(rgba(0,0,0,1)), to(rgba(0,0,0,0)))"
                        }}
                        className="!mt-8 hidden w-full relative lg:flex overflow-y-hidden max-h-[750px] justify-center" ref={emblaRef}> 
                        <div className="flex flex-col gap-3">
                            {
                                coursesPaired.map((coursePaired, i) => (
                                    <div className="flex gap-3" key={i}>
                                      {
                                        coursePaired.map((course, i) => (
                                          <Course key={i} course={course} />
                                        ))
                                      }
                                    </div>
                                ))
                            }
                        </div>
                      </div>
                      <div 
                          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))"}}
                          className={clsx(
                            "lg:hidden !mt-8 w-full grid justify-items-center justify-center gap-4",
                          )}>
                          {
                            courses.map((course, i) => (
                              <Course key={i} course={course} />
                            ))
                          }
                      </div>
                      <div 
                        style={{ transform: "translate(calc(100% + 16px), -50%)"}}
                        className="hidden !w-8 !top-[50%] absolute right-0 lg:flex flex-col items-center">
                        <ChevronUpIcon 
                          className={clsx(
                            "hover:opacity-50 transition-opacity cursor-pointer",
                            !carouselMeta.hasPrev && "!opacity-50 cursor-not-allowed"
                          )}
                          onClick={handleLeft} 
                          color="#fff" 
                          width={25} 
                        />
                        <div className="space-y-2">
                          {
                            coursesPaired.map((_, i) => (
                              <span 
                                className={clsx(
                                  "w-1 h-4 block rounded-full transition-all",
                                  carouselMeta.currentIndex === i ? "bg-brand-green" : "bg-medium-grey-primary"
                                )}
                                key={i} 
                              />
                            ))
                          }
                        </div>
                        <ChevronDownIcon 
                          className={clsx(
                            "hover:opacity-50 transition-opacity cursor-pointer",
                            !carouselMeta.hasNext && "!opacity-50 cursor-not-allowed"
                          )}
                          onClick={handleRight} 
                          color="#fff" 
                          width={25} 
                        />
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
      query {
        courseCollection {
          items {
            title,
            description,
            learnMoreLink,
            promotionalLabel {
              label,
              color
            },
            image {
              src
            }
          }
        }
      }
    `, {});

    const courses:ICourse[] = response?.courseCollection?.items || [];

    // Sorts the courses first by whether it has a promotional label and 
    // retains the default order (sys_publishedAt) by Contentful 
    courses.sort((a, b) => {
       const rankOne = a.promotionalLabel?.label !== undefined ? 1 : 0; 
       const rankTwo = b.promotionalLabel?.label !== undefined ? 1 : 0; 
       return rankTwo - rankOne; 
    });
      
    return {
      props: { 
        courses
      },
      // - At most once every 15 minutes
      revalidate: 60 * 15, // In seconds
    }
}

export default Courses; 