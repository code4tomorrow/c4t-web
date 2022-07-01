import Head from "next/head"
import { getStoryblokApi } from "@storyblok/react"
import BrandButton from "../components/BrandButton";
import Paper from "../components/Paper";
import Image from "next/image";
import { useStyles } from "../styles/styles";
import clsx from "clsx";
import Navbar from "../components/Navbar";
 
export default function Home(props:any) {
  const { classes } = useStyles();

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-dark-grey-primary to-dark-blue-primary">
      <Head>
        <title>Home | C4T</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar/>
      <header className="flex flex-col space-y-6 justify-center items-center p-3">
        <h1 
          style={{ textShadow: "0px 0px 15px rgba(255,255,255,0.45)"}} 
          className="text-white text-5xl md:text-6xl mt-16 text-center">
            Master to Code Today.
        </h1>
        <h2 className="text-xl font-medium text-medium-grey-primary text-center">
          We teach K-12 students around the globe how to code for free.
        </h2>
        <BrandButton title="Apply Today" label="100% Free" />
      </header>
      <main className="p-3 mt-10 flex flex-col items-center">
         <div className="w-screen p-3 md:w-[125vw] h-[80vw] md:h-[60vw] max-w-[1950px] max-h-[850px] flex items-center justify-center">
            <div className="hidden w-[25%] h-[100%] space-y-3 p-3 md:flex flex-col items-end justify-center">
              <Paper containerClass="w-[75%] min-h-[25%]"></Paper>
              <Paper containerClass="w-[35%] min-h-[35%]"></Paper>
            </div>
            <div className="w-full md:w-[70%] h-[100%] flex flex-col justify-center space-y-3">
              <div className={clsx("w-full h-[80%]", classes.carouselContainer)}>
                <Paper containerClass={clsx("relative w-full h-full")}>
                    <Image
                        draggable={false}
                        src="/code.png"
                        priority
                        alt="code-example"
                        objectFit="cover"
                        layout="fill"
                    />
                </Paper>
              </div>
              <div className="h-[20%] flex space-x-3">
                  <Paper containerClass="w-[30%] h-[50%]"></Paper>
                  <Paper containerClass="w-[35%] h-[100%]"></Paper>
                  <Paper containerClass="w-[35%] h-[45%]"></Paper>
              </div>
            </div>
            <div className="hidden w-[25%] h-[100%] space-y-3 p-3 md:flex flex-col items-start justify-center">
              <Paper containerClass="w-[75%] min-h-[25%]"></Paper>
              <Paper containerClass="w-[35%] min-h-[35%]"></Paper>
            </div>
         </div>
      </main>
    </div>
  )
}
 
export async function getStaticProps() {
  // home is the default slug for the homepage in Storyblok
  let slug = "home";
 
  // load the draft version
  let sbParams = {
    version: "draft" //  process.env.NODE_ENV === "production" ? "published" : "draft", // or 'published'
  };
 
  const storyblokApi = getStoryblokApi();
  let { data } = await storyblokApi.get(`cdn/stories/${slug}`, sbParams).catch(e => {
    console.log(e);
    return { data: null };
  });
 
  return {
    props: {
      story: data ? data.story : false,
      key: data ? data.story.id : false,
    },
    revalidate: 3600, // revalidate every hour
  };
}