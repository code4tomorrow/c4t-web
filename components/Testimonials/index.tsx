import React, { useCallback, useEffect, useRef, useState } from "react";
import TestimonialsCard from "./TestimonialCard";
import { ITestimonial } from "common/interfaces/testimonial";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from "embla-carousel-autoplay";
import clsx from "clsx";
import { useStyles } from "./styles";

export const Testimonials = ({ testimonials } : { testimonials: ITestimonial[] }) => {
    const autoplay = useRef(
        Autoplay({ 
            delay: 5000, 
            stopOnInteraction: false, 
            playOnInit: true
        })
    );

    const [ carouselMeta, setCarouselMeta ] = useState<{
        currentIndex: number,
    }>({
        currentIndex: 0,
    });

    const [emblaRef, emblaAPI ] = useEmblaCarousel({
        loop: true, skipSnaps: false, align: 'center'
    }, [ autoplay.current ]);

    const onSelect = useCallback(() => {
        if (!emblaAPI) return; 
        setCarouselMeta({ 
            currentIndex: emblaAPI.selectedScrollSnap()
        })
    }, [ emblaAPI ]);
  

    const { classes } = useStyles();

    useEffect(() => {
        if (!emblaAPI) return; 
        emblaAPI.on("select", onSelect);
        return () => {
            emblaAPI.off("select", onSelect)
        }
    }, [ emblaAPI, onSelect ]);

    const handleSlideChange = (slide:number) => () => {
        emblaAPI?.scrollTo(slide);
    };

    return (
        <div
            className={clsx("max-w-7xl overflow-x-clip overflow-y-visible", classes.sliderContainer)} ref={emblaRef}>
            <div 
                className={clsx("flex")}>
                {
                    testimonials.map((testimonial, i) => (
                        <TestimonialsCard selected={carouselMeta.currentIndex === i} key={i} testimonial={testimonial} />
                    ))
                }
            </div>
            <div className="space-x-2 mt-3 flex justify-center items-center">
                {
                    testimonials.map((_, i) => (
                    <span 
                        onClick={handleSlideChange(i)}
                        className={clsx(
                        "w-4 h-1 block cursor-pointer rounded-full transition-all",
                        carouselMeta.currentIndex === i ? "bg-brand-purple-secondary" : "bg-dim-grey"
                        )}
                        key={i} 
                    />
                    ))
                }
            </div>
        </div>
    )
}

export default Testimonials;