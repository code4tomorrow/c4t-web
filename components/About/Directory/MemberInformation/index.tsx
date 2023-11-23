import { useStyles } from "../../AlumniDirectory/AlumniInformation/styles";
import clsx from "clsx";
import Animate from "@components/Animate";
import { IDirectoryRow } from "@utils/notion/directory";
import { useEffect } from "react";
import dynamic from "next/dynamic";

const NotionBlocks = dynamic(() => import("notion-block-renderer"));

interface MemberInformationProps {
    memberInfo?: IDirectoryRow;
    onExit?: () => void;
}

export default function AlumniInformation({
    memberInfo,
    onExit,
}: MemberInformationProps) {
    const { classes } = useStyles();

    useEffect(() => {
        const links = document.querySelectorAll("a.nbr-link ");

        // Set the target attribute to "_blank" for each anchor tag with the class name "nbr-link " - a notion link
        links.forEach((link) => {
            link.setAttribute("target", "_blank");
        });
    }, []);

    if (memberInfo === null || memberInfo === undefined) {
        return <></>;
    }

    return (
        <Animate.Element
            resetAfterTriggered={false}
            onDeactivatedClasses="-translate-x-36 opacity-0"
            onActivatedClasses="opacity-100"
            className="transition-all duration-300"
        >
            <div className="w-[300px] sm:w-[500px] py-5 h-fit rounded-md bg-dark-grey-primary text-white border-dim-grey border-[1px] shadow-md shadow-dark-grey-primary">
                <div className="flex justify-center items-center h-fit flex-col mx-2 gap-3">
                    <button
                        onClick={onExit}
                        className="absolute top-4 right-4 hover:text-gray-500"
                    >
                        ✕
                    </button>
                    <h1 className="font-bold text-xl">{memberInfo.name}</h1>
                    <div>
                        <span
                            style={{
                                background:
                                    memberInfo.position?.color || undefined,
                            }}
                            data-tag
                            className={clsx(
                                "[&>div>span[data-tag]]:bg-brand-purple-secondary rounded-[0.25rem] p-[0.25rem]"
                            )}
                        >
                            {memberInfo.position?.name}
                        </span>
                    </div>

                    <div className="gap-3 flex flex-wrap justify-center">
                        {memberInfo.projects?.map((d, idx) => (
                            <span
                                key={idx}
                                data-tag
                                style={{ background: d.color || undefined }}
                                className={"rounded-[0.25rem] p-[0.25rem]"}
                            >
                                {d.name}
                            </span>
                        ))}
                    </div>

                    {memberInfo.page_children && (
                        <div
                            className={clsx(
                                classes.root,
                                classes.scrollbar,
                                "flex flex-col items-start justify-start w-full px-5 max-h-96 overflow-y-scroll overflow-x-clip"
                            )}
                        >
                            {
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                <NotionBlocks
                                    blocks={
                                        memberInfo.page_children
                                            .results as unknown as any
                                    }
                                />
                            }
                        </div>
                    )}
                </div>
            </div>
        </Animate.Element>
    );
}
