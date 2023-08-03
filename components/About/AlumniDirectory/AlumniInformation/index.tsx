import { IAlumniDirectoryRow } from "@utils/notion/alumniDirectory";
import { useStyles } from "../../Directory/styles";
import clsx from "clsx";
import Animate from "@components/Animate";
import NotionBlocks from "notion-block-renderer";




interface AlumniInformationProps{
    alumniInfo?: IAlumniDirectoryRow;
    onExit?: () => void;
}

export default function AlumniInformation({alumniInfo, onExit} : AlumniInformationProps) {
    const { classes } = useStyles();

    if(alumniInfo === null || alumniInfo === undefined){
        return (<></>)
    }

    return (
        <Animate.Element
            resetAfterTriggered={false}
            onDeactivatedClasses="-translate-x-36 opacity-0"
            onActivatedClasses="opacity-100"
            className="transition-all duration-500"
        >
            
            <div className="w-[500px] py-5 h-fit rounded-md bg-dark-grey-primary text-white border-dim-grey border-[1px]">
                <div className="flex justify-center items-center h-fit flex-col mx-2 gap-3">
                    <button onClick={onExit} className="absolute top-4 right-4 hover:text-gray-500">✕</button>
                    <h1 className="font-bold text-xl">{alumniInfo.name}<span className="font-thin">, {alumniInfo.graduation_year}</span></h1>
                    <div >
                        <span
                            style={{
                                background: alumniInfo.former_position?.color || undefined,
                            }}
                            data-tag
                            className={clsx("[&>div>span[data-tag]]:bg-brand-purple-secondary rounded-[0.25rem] p-[0.25rem]",
                            classes.cell)}
                            
                        >
                            {alumniInfo?.former_position?.name}
                        </span>
                    </div>

                    <div className="gap-3 flex flex-wrap justify-center">
                            {alumniInfo.former_projects?.map((d, idx) => (
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

                    {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    //@ts-ignore
                    alumniInfo.page_children && <NotionBlocks blocks={alumniInfo.page_children.results}/>
                    }
                </div>
                
                
            </div>
        </Animate.Element>
        
    )
}
