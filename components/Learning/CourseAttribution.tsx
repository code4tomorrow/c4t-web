import clsx from "clsx";
import React from "react";

export interface CourseAttributionProps {
    className?: string;
}

const CourseAttribution: React.FC<CourseAttributionProps> = ({ className }) => {
    return (
        <p
            className={clsx(
                "w-full py-3 text-center text-xs text-medium-grey",
                className
            )}
        >
            Course created by Zafir Shamsi.
        </p>
    );
};

export default CourseAttribution;
