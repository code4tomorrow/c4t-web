import React, { useMemo } from "react";
import { Block, BLOCKS, Document, Inline, INLINES } from '@contentful/rich-text-types';
import { documentToReactComponents, Options as DocumentOptions } from '@contentful/rich-text-react-renderer';
import { makeStyles } from "tss-react/mui";
import clsx from "clsx";
import Link from "next/link";

interface DocumentProps {
    document: Document,
    options?: DocumentOptions,
    color?: string; 
}

const withBaseStyles = <P extends object>(Component: React.ComponentType<P>, color?:string) => {
    const WithBaseStyles = ({ ...props }) => {
        return (
            <span className={clsx(color ? color : "text-medium-grey", "inline-block")}>
                <Component { ...props as P } />
            </span>
        )
    }
    return WithBaseStyles; 
}

const Text : React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <p>{ children }</p>
}

const HyperLink : React.FC<{ node: Block | Inline, children: React.ReactNode }> = ({ node, children }) => {
    const link:string = useMemo(() => node.data.uri || "", [ node ]);
    const origin = useMemo(() => typeof window === "undefined" ? null : window.location.origin, []);
    const currentPage = useMemo(() => (
        link.startsWith("/") || (origin && link.startsWith(origin))
    ), [ link, origin ]);
    
    return (
        <Link 
            href={link}
            passHref>
                <a
                   className="text-brand-purple-secondary hover:underline cursor-pointer" 
                   target={currentPage ? "_self" : "_blank"} 
                   rel="noopener nofollow noreferrer"
                >
                    { children }
                </a>
        </Link>
    )
}

const OrderedList : React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <ol className="text-medium-grey space-y-1 list-inside my-3">{ children }</ol>
}

const ListItem : React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { classes } = makeStyles({ name: "cms-document"})(() => ({
        li: {
            "& > p": {
                display: "inline-block"
            }
        }
    }))();

    return <li className={clsx("text-medium-grey list-decimal", classes.li)}>{ children }</li>
}

const Document : React.FC<DocumentProps> = ({ document, color, options = {} }) => {
    const documentOptions = useMemo<DocumentOptions>(() => {
        let base: DocumentOptions = {
            renderNode: {
                [INLINES.HYPERLINK]: (node, children) => <HyperLink node={node}>{children}</HyperLink>,
                [BLOCKS.PARAGRAPH]: (_node, children) => {
                    const TextWithColor = withBaseStyles(Text, color);
                    return <TextWithColor>{children}</TextWithColor>
                },
                [BLOCKS.OL_LIST]: (_node, children) => <OrderedList>{children}</OrderedList>,
                [BLOCKS.LIST_ITEM]: (_node, children) => <ListItem>{children}</ListItem>,
            },
        }

        return Object.assign(base, options)
    }, [ options, color ]);

    return (
        <>
            { document && documentToReactComponents(document, documentOptions) }
        </>
    )
}

export default Object.assign(Document, { Text }); 