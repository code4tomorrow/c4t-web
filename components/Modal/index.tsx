import React, { ReactElement, useEffect } from "react";
import { XIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import { modalState } from "common/atoms";
import { useRecoilState } from "recoil";

export interface ModalProps {
    open: boolean,
    fullWidth?: boolean; 
    setOpen: (e:boolean) => void; 
    children?: ReactElement,
}

const Modal : React.FC<ModalProps> = ({ open, setOpen, children, fullWidth = false }) => {
    const [ _modalOpen, setModalOpen ] = useRecoilState(modalState);

    useEffect(() => {
        setModalOpen(open);

        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflowY = "auto";

        return () => {
            document.body.style.overflowY = "auto";
            setModalOpen(false);
        }
    }, [ open, setModalOpen ]);

    return (
        <div 
            aria-hidden={!open}
            style={{ 
                WebkitPerspective: 1000,
                WebkitFontSmoothing: "antialiased",
                WebkitTransformStyle: "preserve-3d",
                WebkitBackfaceVisibility: "hidden",
                MozTransition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                WebkitTransition: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                backgroundColor: "rgba(0, 0, 0, 0.25)"
            }} 
            onClick={() => setOpen(false)}
            className={clsx(
                "flex top-0 scrollbar-hide opacity-0 overflow-hidden transition-all overflow-y-auto fixed h-screen right-0 left-0 z-50 justify-center items-center md:inset-0 h-modal",
                open ? "!opacity-100 pointer-events-auto" : "pointer-events-none" 
            )}>
            <div className="flex justify-center relative px-4 py-[15px] h-screen w-full">
                <div 
                    style={{
                        WebkitPerspective: 1000,
                        WebkitFontSmoothing: "antialiased",
                        WebkitTransformStyle: "preserve-3d",
                        WebkitBackfaceVisibility: "hidden",
                        transform: `${open ? "translateY(0)" : "translateY(100px)"} translateZ(0)`,
                        WebkitTransform: `${open ? "translateY(0)" : "translateY(100px)"} translateZ(0)`,
                    }}
                    className={clsx(
                        `transition-transform duration-300 justify-center flex items-center overflow-auto relative rounded-lg`,
                        fullWidth && "w-full"
                    )}>
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{ borderColor: "rgba(255, 255, 255, 0.1)" }} 
                        className={clsx(
                            "h-min p-3 relative bg-dark-grey-primary my-auto rounded-md shadow border-[1px] border-solid",
                            fullWidth && "w-full"
                        )}>
                        <div className="flex z-50 justify-between [&>*]:transition-opacity [&>*]:hover:opacity-50 items-center p-3 absolute top-0 right-0">
                            <button 
                                aria-label="hide modal"
                                name="hide modal"
                                onClick={() => { setOpen(false) }} 
                                type="button" 
                                className="text-gray-400 bg-transparent border-b-4 border-transparent rounded-lg text-sm p-1.5 ml-auto inline-flex items-center" data-modal-toggle="small-modal">
                                <XIcon style={{ width: 22.5 }} />  
                            </button>
                        </div>
                        {
                            children && children
                        }
                    </div>
                </div>
            </div>
        </div> 
    )
}

export default Modal; 