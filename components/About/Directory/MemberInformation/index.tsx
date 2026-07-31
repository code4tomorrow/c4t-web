import { useStyles } from "../../AlumniDirectory/AlumniInformation/styles";
import clsx from "clsx";
import Animate from "@components/Animate";
import Bio from "@components/About/Bio";
import type { IDirectoryRow } from "common/interfaces/directory";

interface MemberInformationProps {
    memberInfo?: IDirectoryRow;
    onExit?: () => void;
}

export default function AlumniInformation({
    memberInfo,
    onExit,
}: MemberInformationProps) {
    const { classes } = useStyles();

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

                    {memberInfo.bio?.length > 0 && (
                        <div
                            className={clsx(
                                classes.scrollbar,
                                "flex max-h-96 w-full flex-col items-start justify-start overflow-x-clip overflow-y-auto px-5"
                            )}
                        >
                            <Bio blocks={memberInfo.bio} />
                        </div>
                    )}
                </div>
            </div>
        </Animate.Element>
    );
}
