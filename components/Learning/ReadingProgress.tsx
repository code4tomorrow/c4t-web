import React, { useEffect, useState } from "react";

/** A thin bar along the top of the page showing how far the reader has scrolled. */
const ReadingProgress: React.FC = () => {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        let frame = 0;
        const measure = () => {
            frame = 0;
            const height =
                document.documentElement.scrollHeight - window.innerHeight;
            setProgress(height > 0 ? Math.min(1, window.scrollY / height) : 0);
        };
        const onScroll = () => {
            if (!frame) frame = window.requestAnimationFrame(measure);
        };
        measure();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) window.cancelAnimationFrame(frame);
        };
    }, []);
    return (
        <div className="reading-progress" aria-hidden="true">
            <div style={{ transform: `scaleX(${progress})` }} />
        </div>
    );
};

export default ReadingProgress;
