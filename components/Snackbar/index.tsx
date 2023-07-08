import { createAtom } from "@utils/recoil";
import React, { ReactNode, useEffect, useRef } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { gsap } from "gsap";

const SNACK_MARGIN = 5;
const BOTTOM_MARGIN = 35;
const RESET_DELAY_MS = 2000;

export const snackBarState = createAtom<{ content: string; key: string }[]>({
    key: "snacks",
    default: [],
});

const Snack: React.FC<{ children: ReactNode; i: number; id: string }> = ({
    children,
    i,
    id,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const setSnackbar = useSetRecoilState(snackBarState);
    const isUnmounting = useRef<boolean>(false);

    useEffect(() => {
        if (!containerRef.current || isUnmounting.current) return;

        const { height } = containerRef.current.getBoundingClientRect();

        const tl = gsap
            .timeline({
                repeat: 0,
            })
            .to(containerRef.current, {
                opacity: 1,
                duration: 0.15,
                y: -(height + SNACK_MARGIN) * i - BOTTOM_MARGIN,
            });

        return () => {
            tl.kill();
        };
    }, [i]);

    useEffect(() => {
        if (!containerRef.current) return;

        const tl = gsap
            .timeline({
                repeat: 0,
            })
            .to(containerRef.current, {
                y: (gsap.getProperty(containerRef.current, "y") as number) + 15, // remove i
                duration: 0.5,
                delay: RESET_DELAY_MS / 1000,
                opacity: 0,
            })
            .eventCallback("onStart", () => {
                setTimeout(() => (isUnmounting.current = true), RESET_DELAY_MS);
            })
            .eventCallback("onComplete", () => {
                setSnackbar((snacks) =>
                    snacks.filter((snack) => snack.key !== id)
                );
            });

        return () => {
            tl.kill();
        };
    }, [id, setSnackbar]);

    return (
        <div
            ref={containerRef}
            className="bg-dark-grey-primary opacity-0 left-1/2 -translate-x-1/2 p-3 my-1 absolute rounded-full border
         border-[rgba(255,255,255,0.1)]"
        >
            <p className="text-white text-sm whitespace-nowrap">{children}</p>
        </div>
    );
};

const Snackbar = () => {
    const snacks = useRecoilValue(snackBarState);

    return (
        <div
            data-component="Snackbar"
            className="z-50 fixed w-full bottom-[7.5%] left-1/2 -translate-x-1/2"
        >
            {snacks.map(({ key, content }, index) => (
                <Snack id={key} i={snacks.length - index - 1} key={key}>
                    {content}
                </Snack>
            ))}
        </div>
    );
};

export default Snackbar;
