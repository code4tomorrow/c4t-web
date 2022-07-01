
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import { withEmotionCache } from "tss-react/nextJs";
import { createMuiCache } from './_app';

class RootDocument extends Document {
    static async getInitialProps(ctx:DocumentContext) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html lang="en">
              <Head key="document">
                  <link rel="preconnect" href="https://fonts.googleapis.com" />
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet"></link>
                  <link href="https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
              </Head>
              <body className="dark">
                <Main />
                <NextScript />
              </body>
            </Html>
        )
    }
}

export default withEmotionCache({
  "Document": RootDocument,
  "getCaches": ()=> [ createMuiCache() ]
});