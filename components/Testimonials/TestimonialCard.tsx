import Paper from "@components/Paper";
import React from "react";
import QuoteSVG from "@svg/quote.svg";
import { StarIcon as StarIconSolid } from "@heroicons/react/solid";
import clsx from "clsx";
import { useStyles } from "./styles";
import { ITestimonial } from "common/interfaces/testimonial";

const TestimonalsCard = ({ testimonial, selected } : { testimonial: ITestimonial, selected:boolean }) => {
    const { classes } = useStyles();

    return (
        <div>
            <Paper containerClass={clsx(
                "min-w-[350px] transition-all duration-300 flex mx-8 flex-col p-5 z-10 space-y-3 justify-center items-center min-h-[275px]",
                classes.cardContainer,
                selected && "-translate-y-[25px]"
            )}>
                <QuoteSVG width={50} fill="#7892EE" />
                <div className="flex">
                    {
                        new Array(testimonial.rating).fill(0).map((_, i) => (
                            <StarIconSolid key={i} className="text-yellow-500" width={20} />
                        ))
                    }
                </div>
                <blockquote className="text-medium-grey !mb-3 text-center text-lg">
                    &quot;{testimonial.text}&quot;
                </blockquote>
                <p className="text-dim-grey bg-white bg-opacity-5 py-1 px-2 rounded-full !mt-auto font-semibold">
                    {testimonial.attestant}
                </p>
            </Paper>
        </div>
    )
}

export default TestimonalsCard;