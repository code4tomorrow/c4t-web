import React, { useId } from "react";
import Particles from "react-tsparticles";

const BinaryParticles = () => {
    const id = useId();
    
    return (
        <Particles 
            id={`${id}-binary-particles`}
            className="z-0"
            options={{
                fullScreen: {
                    enable: false,
                    zIndex: 0
                },
                style: {
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                },
                autoPlay: true,
                fpsLimit: 60,
                particles: {
                    color: { value: "#267F40" },
                    move: {
                        attract: { enable: false, rotateX: 600, rotateY: 1200 },
                        bounce: false,
                        direction: "top",
                        enable: true,
                        out_mode: "out",
                        random: false,
                        speed: 1,
                        straight: true
                    },
                    number: { density: { enable: true, area: 800 }, value: 100 },
                    opacity: {
                    animation: { enable: true, minimumValue: 0.5, speed: 1, sync: false },
                    random: false,
                    value: 1
                    },
                    shape: {
                    character: [
                        {
                        fill: true,
                        font: "Verdana",
                        style: "",
                        value: "0".split(""),
                        weight: "400"
                        },
                        {
                        fill: true,
                        font: "Verdana",
                        style: "",
                        value: "1".split(""),
                        weight: "400"
                        }
                    ],
                    polygon: { nb_sides: 5 },
                    stroke: { color: "random", width: 1 },
                    type: "char"
                    },
                    size: {
                        random: { minimumValue: 6, enable: true },
                        value: 12
                    }
                },
                detectRetina: true
            }}
        />
    )
}

export default BinaryParticles;