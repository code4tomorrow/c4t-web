import { ListBlockChildrenResponse} from "@notionhq/client/build/src/api-endpoints";

interface NotionRichTextProps{
    block_children: ListBlockChildrenResponse | null;
}

export default function NotionRichText({block_children} : NotionRichTextProps) {
    console.log(block_children)
    console.log("hello")
    return (
    
    <div className="flex flex-col w-full gap-4">
        {block_children?.results.map((e, index) => (
            <p key={index}>
                
            </p>
        ))}
    </div>
    
  )
}
