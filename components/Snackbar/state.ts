import { createAtom } from "@utils/store";

/**
 * Queue of toast messages.
 *
 * Kept apart from the Snackbar component because the component pulls in gsap
 * for its animations. Anything that only needs to *push* a message (the copy
 * button, the contact form) imports this module instead, so gsap stays out of
 * bundles that never render a toast.
 */
export const snackBarState = createAtom<{ content: string; key: string }[]>({
    key: "snacks",
    default: [],
});
