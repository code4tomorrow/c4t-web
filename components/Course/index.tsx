import BrandButton from "@components/BrandButton";
import Paper from "@components/Paper";
import { getCloudinaryURL } from "@utils/cloudinary-loader";
import clsx from "clsx";
import { ICourse } from "pages/courses";
import React from "react";
import { useStyles } from "./styles";
import CodeLogo from "@svg/code.svg";
import NextImage from "@components/NextImage";

interface CourseProps {
    course: ICourse
}

const Course : React.FC<CourseProps> = ({ course }) => {
    const { classes } = useStyles();

    return (
        <Paper containerClass={clsx("max-w-[300px] md:max-w-none w-full min-h-[300px] rounded-md", classes.course)}>
            <div className="w-full h-full relative space-y-3 p-4 flex items-center flex-col">
                <div className="w-[100px] h-[100px] relative flex justify-center items-center">
                    {
                        !!course.image ? (
                            <NextImage 
                                src={getCloudinaryURL(course.image.src)}
                                layout={"fill"}
                                fallbackSrc={"/svg/code.svg"}
                                objectFit={"contain"}
                            />
                        ) : (
                            <CodeLogo width={100}/>
                        )
                    }
                </div>
                <h1 className="text-white text-center font-semibold">
                    { course?.title}
                </h1>
                {
                    course.promotionalLabel && (
                        <div className="!mt-1 space-x-1 flex items-baseline">
                            <img className="-rotate-[13deg]" src="/svg/arrow.svg" />
                            <span 
                                style={{ color: course.promotionalLabel?.color }}
                                className="uppercase text-xs font-semibold text-orange-400">
                                    { course?.promotionalLabel.label }
                            </span>
                        </div>
                    )
                }
                <p className="!mb-4 text-medium-grey-primary text-center overflow-auto h-[150px]">
                    { course.description }
                </p>
                <BrandButton 
                    as="a"
                    target={"_blank"}
                    rel="nofollow noreferrer noopener"
                    href={course.learnMoreLink}
                    disabled={!!!course.learnMoreLink}
                    containerClass="!mt-auto"
                    title="Learn More" 
                />
            </div>
        </Paper>
    )
}

export default Course; 