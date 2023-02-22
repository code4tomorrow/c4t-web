import { snackBarState } from "@components/Snackbar";
import { CheckIcon, DuplicateIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import React, { useRef, useState } from "react";
import { useSetRecoilState } from "recoil";
import { v1 } from "uuid";

interface CopyProps {
    content: string;
    snackLabel?: string;  
}

const Copy : React.FC<CopyProps> = ({ content, snackLabel = "Copied!" }) => {
    const [ checked, setChecked ] = useState(false);
    const setSnackbar = useSetRecoilState(snackBarState);

    const checkTimeout = useRef<number>(-1);

    const handleClick = () =>  {
        window.navigator.clipboard.writeText(content).then(() => {
            setChecked(true);

            if (checkTimeout.current !== -1) {
                clearTimeout(checkTimeout.current);
            } 

            if (!checked) {
                setSnackbar((oldSnacks) => [
                    ...oldSnacks,
                    {
                      key: v1(),
                      content: snackLabel
                    },
                ]);
            }

            checkTimeout.current = setTimeout(() => {
                setChecked(false);
            }, 1000) as unknown as number; 
        });
    }

    return (
        <span className="h-[20px] overflow-hidden" onClick={handleClick}>
            <div className={clsx(
                "translate-y-0 transition-transform duration-150 ease-in-out",
                checked && "-translate-y-1/2"
            )}>
                <DuplicateIcon
                    width={20}
                    className="text-medium-grey hover:text-white transition-colors"/>
                <CheckIcon
                    width={20}
                    className="text-green-300"/>
            </div>
        </span>
    )
}

export default Copy; 