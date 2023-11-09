import "../styles/globals.css";
import ProgressBar from "@components/ProgressBar"
import { raleway } from "common/fonts/raleway";
import { Metadata } from "next"

export const metadata : Metadata = {
  title: 'C4T',
  description: 'Code 4 Tomorrow is entirely student-run, from the official website to merch design and finance management. C4T is a 501(c)(3) non-profit organization that offers free coding classes to students around the globe, as well as community service opportunities to our members and teachers.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={raleway.className}>
      <body className={`${raleway.className} dark`}>
        <ProgressBar
          options={{ showSpinner: false }}
          color={"#fff"}
          height={2}
        />
        {children}
      </body>
    </html>
  )
}
