import BinaryParticles from "@components/BinaryParticles";
import BrandButton from "@components/BrandButton";
import Modal from "@components/Modal";
import gsap from "gsap";
import React, { useEffect, useState } from "react";
import SplitType from 'split-type'

const MemberSignUps = () => {
    const [ open, setOpen ] = useState(false);

    useEffect(() => {
        setTimeout(() => { setOpen(true) }, 250)
    }, []);

    useEffect(() => {
        const header = new SplitType(`#header-modal`, {
            types: 'words',
            absolute: false,
        });

        if (header.words && Array.isArray(header.words)) {
            header.words.forEach(word => {
                const wrapper = document.createElement("span")
                wrapper.classList.add("overflow-hidden", "inline-block");
                wrapper.style.lineHeight = "1.2";
                word.parentNode?.insertBefore(wrapper, word);
                wrapper.appendChild(word);
            });
        } 

        gsap.from(header.words, {
            yPercent: 200,
            ease: "power4",
            stagger: 0.2,
            delay: 0.5
        })
    }, [])

    return (
        <Modal open={open} setOpen={(state:boolean) => setOpen(state)}>
            <div className="lg:w-screen overflow-hidden flex text-center relative justify-center items-center flex-col max-w-4xl sm:px-6 pt-12 pb-6">
                <BinaryParticles />
                <h1 id={"header-modal"} className="text-4xl md:text-5xl my-1 font-bold text-white">
                    Member Signups Open&nbsp;
                    <span className="text-brand-purple-secondary">
                        Now.
                    </span>
                </h1>
                <h2 className="text-xl my-1 text-center font-medium text-medium-grey">
                    Need the Volunteer Hours? Have the Skills?
                </h2>
                <BrandButton 
                    as="a"
                    target="_blank"
                    rel="nofollow noreferrer noopener"
                    href="https://tally.so/r/mVgJl3"
                    containerClass="mt-12" 
                    title="Apply Today."
                />
                <a 
                    className="mt-6 text-medium-grey hover:underline"
                    rel="noopener noreferrer nofollow"
                    target={"_blank"}
                    href="mailto:hello@code4tomorrow.org"
                >
                    <span>hello@code4tomorrow.org</span>
                </a>
            </div>
        </Modal>
    )
}

export default MemberSignUps;