import React from "react";
import Head from "next/head"
import BrandButton from "@components/BrandButton";
import Paper from "@components/Paper";
import Image from "next/image";
import { useStyles } from "../styles/styles";
import clsx from "clsx";
import Navbar from "@components/Navbar";
import Typist from "react-typist-component";
import LearnSVG from "@svg/learn.svg";
import TeamSVG from "@svg/team.svg";
import GiftsSVG from "@svg/gifts.svg";
import Animate from "@components/Animate";

const CODE_ITEMS = [ "Today.", "Websites.", "Games.", "Apps." ];

export default function Home() {
  const { classes } = useStyles();

  return (
    <div 
      style={{ width: "100vw", overflowX: "hidden" }}
      className="w-screen min-h-screen bg-dark-grey-primary">
      <Head>
        <title>Home | C4T</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navbar/>
      <header className="flex pt-16 flex-col space-y-6 justify-center items-center p-3">
        <h1 
          style={{ textShadow: "0px 0px 15px rgba(255,255,255,0.45)", whiteSpace: "nowrap"}} 
          className="text-white text-5xl font-bold md:text-6xl mt-16 text-center">
            Master to&nbsp;<br className="md:hidden block"/>Code&nbsp;
            <Typist cursor={<span className={classes.blinkingCursor}>|</span>} loop={true}>
                {
                  CODE_ITEMS.map((item, idx) => (
                    <span key={idx}>
                      <span>{item}</span>
                      <Typist.Delay ms={1750}/>
                      <Typist.Backspace count={item.length} />
                      <Typist.Delay ms={250}/>
                    </span>
                  ))
                }
            </Typist>
        </h1>
        <h2 className="text-xl font-medium text-medium-grey-primary text-center">
          We teach K-12 students around the globe how to code for free.
        </h2>
        <BrandButton title="Apply Today" label="100% Free" />
      </header>
      <main className="p-3 mt-10 space-y-32 flex flex-col items-center">
         <section className="w-screen p-3 md:w-[125vw] h-[80vw] md:h-[60vw] max-w-[1950px] max-h-[850px] flex items-center justify-center">
            <Animate 
                resetAfterTriggered={false}
                from={{ x: -200 }} to={{ x: 0}}
                className="hidden w-[25%] h-[100%] space-y-3 p-3 md:flex flex-col items-end justify-center">
                <Paper containerClass="w-[75%] min-h-[25%]"></Paper>
                <Paper containerClass="w-[35%] min-h-[35%]"></Paper>
            </Animate>
            <div className="w-full md:w-[70%] h-[100%] flex flex-col justify-center space-y-3">
              <div className={clsx("w-full h-[80%] z-10", classes.carouselContainer)}>
                <Paper containerClass={clsx("relative w-full h-full")}>
                    <Image
                        draggable={false}
                        src="/code.png"
                        priority
                        quality={100}
                        alt="code-example"
                        objectFit="cover"
                        layout="fill"
                    />
                </Paper>
              </div>
              <Animate resetAfterTriggered={false} from={{ y: 200 }} to={{ y: 0 }} className="h-[20%] flex space-x-3">
                  <Paper containerClass="w-[30%] h-[50%]"></Paper>
                  <Paper containerClass="w-[35%] h-[100%]"></Paper>
                  <Paper containerClass="w-[35%] h-[45%]"></Paper>
              </Animate>
            </div>
            <Animate 
              resetAfterTriggered={false}
              from={{ x: 200 }} to={{ x: 0, delay: 0.2 }}
              className="hidden w-[25%] h-[100%] space-y-3 p-3 md:flex flex-col items-start justify-center">
              <Paper containerClass="w-[75%] min-h-[25%]"></Paper>
              <Paper containerClass="w-[35%] min-h-[35%]"></Paper>
            </Animate>
         </section>
         <section className="flex py-5 flex-col-reverse md:flex-row md:items-center justify-around w-full max-w-[1250px]">
              <article className="space-y-5 flex flex-col md:max-w-[50%] px-2">
                <Animate from={{ x: -200 }} to={{ x: 0}}>
                  <h1 className="text-white text-4xl md:text-5xl font-extrabold">Begin Your Summer Adventure.</h1>
                </Animate>
                <Animate from={{ x: -200 }} to={{ x: 0}}>
                  <div className="space-y-3 md:max-w-[75%] text-lg">
                    <p className="text-medium-grey-primary">
                        C4T&apos;s summer session is open for registration now! Learn languages like Python, Java, and more—all for free!
                    </p>
                    <p className="text-medium-grey-primary">
                      The student application is open till July 3rd. Classes are twice a week from July 11th to August 22nd.
                    </p>
                  </div>
                </Animate>
                <BrandButton containerClass="mr-auto" title="Sign Up" label="Quick & Easy" />
              </article>
              <div className={"md:my-0 my-8"}>
                <LearnSVG className="w-[100%] max-w-[500px] md:max-w-[400px] md:w-[40vw] "/>
              </div>
         </section>
         <section className="flex py-10 flex-col-reverse md:flex-row-reverse md:items-center justify-around w-full max-w-[1250px]">
              <article className="space-y-5 flex flex-col md:max-w-[50%] px-2">
                <Animate from={{ x: 200 }} to={{ x: 0}}>
                  <h1 className="text-white text-4xl md:text-5xl font-extrabold">Consider Supporting a STEM Initiative.</h1>
                </Animate>
                  <div className="space-y-3 md:max-w-[75%] text-lg">
                    <Animate from={{ x: 200 }} to={{ x: 0}} className="text-medium-grey-primary">
                      If you would like to support our efforts to make STEM education accessible to all, please consider donating.
                    </Animate>
                  </div>
                <BrandButton containerClass="mr-auto" title="Donate Now" label="Every bit Matters" />
              </article>
              <div className="md:my-0 my-8">
                <GiftsSVG className="w-[100%] max-w-[500px]  md:max-w-[500px] md:w-[50vw] "/>
              </div>
         </section>
         <section className="flex py-10 flex-col-reverse md:flex-row md:items-center justify-around w-full max-w-[1250px]">
              <article className="space-y-5 flex flex-col md:max-w-[50%] px-2">
                <Animate from={{ x: -200 }} to={{ x: 0}}>
                  <h1 className="text-white text-4xl md:text-5xl font-extrabold">Let&apos;s Build a Partnership.</h1>
                </Animate>
                  <div className="space-y-3 md:max-w-[75%] text-lg">
                    <Animate as="p" from={{ x: -200 }} to={{ x: 0}} className="text-medium-grey-primary">
                      At C4T, we believe in the power of partnership. We know it will take a large coalition of change-makers in order to have the greatest impact. This is why we collaborate with other non-profit organizations to bring STEM-related opportunities to students.
                    </Animate>
                  </div>
                <BrandButton containerClass="mr-auto" title="Let's Team Up" />
              </article>
              <div className="md:my-0 my-8">
                <TeamSVG className="w-[100%] max-w-[500px]  md:max-w-[500px] md:w-[50vw] "/>
              </div>
         </section>
      </main>
    </div>
  )
}