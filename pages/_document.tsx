import React from "react";
import Document, {
    Html,
    Head,
    Main,
    NextScript,
    DocumentContext,
} from "next/document";
import { withEmotionCache } from "tss-react/nextJs";
import { createMuiCache } from "./_app";

class RootDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx);
        return { ...initialProps };
    }
    render() {
        return (
            <Html lang="en">
                {/* Raleway is self-hosted by next/font in _app.tsx. The old
                    render-blocking fonts.googleapis.com stylesheet (and its
                    two preconnects) is deliberately gone. */}
                <Head key="document" />
                <body className="dark">
                    <Main />
                    <NextScript />
                </body>
            </Html>
        );
    }
}

export default withEmotionCache({
    Document: RootDocument,
    getCaches: () => [createMuiCache()],
});
