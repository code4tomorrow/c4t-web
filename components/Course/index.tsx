import BrandButton from "@components/BrandButton";
import Paper from "@components/Paper";
import clsx from "clsx";
import { ICourse } from "pages/courses";
import React from "react";
import { useStyles } from "./styles";

interface CourseProps {
    course: ICourse
}

const Course : React.FC<CourseProps> = ({ course }) => {
    const { classes } = useStyles();

    return (
        <Paper containerClass={clsx("min-w-[300px] min-h-[300px] rounded-md bg-white overflow-visible bg-opacity-[5%]", classes.course)}>
            <div className="w-[300px] space-y-3 p-4 flex items-center flex-col">
                <h1 className="text-white text-center">{ course?.title}</h1>
                <p className="text-medium-grey-primary text-center h-[200px]">
                    { course.description}
                </p>
                {/* <BrandButton title="View Course" /> */}
            </div>
        </Paper>
    )
}

export default Course; 