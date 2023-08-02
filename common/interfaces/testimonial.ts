import { ETestimonialType } from "common/enums/testimonial";

export interface ITestimonial {
    text?: string;
    rating?: number;
    attestant?: string;
    type?: ETestimonialType;
}
