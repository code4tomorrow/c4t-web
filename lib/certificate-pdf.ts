import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import QRCode from "qrcode";

export interface CertificateData {
    certificateId: string;
    learnerName: string;
    courseTitle: string;
    completionDate: Date;
    learningHours: number;
    verificationUrl: string;
    organization?: string;
    signatoryName?: string;
    signatoryTitle?: string;
}

// A4 landscape, in points.
const WIDTH = 841.89;
const HEIGHT = 595.28;

const BRAND = rgb(0.42, 0.33, 0.85);
const INK = rgb(0.09, 0.09, 0.12);
const MUTED = rgb(0.42, 0.42, 0.48);

/**
 * Shrinks the font size until the text fits, then falls back to hard-truncating
 * with an ellipsis. Long learner and course names must never overflow the page.
 */
const fitText = (
    text: string,
    font: PDFFont,
    maxWidth: number,
    startSize: number,
    minSize = 12
): { text: string; size: number } => {
    let size = startSize;
    while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
        size -= 1;
    }

    if (font.widthOfTextAtSize(text, size) <= maxWidth) return { text, size };

    let truncated = text;
    while (
        truncated.length > 1 &&
        font.widthOfTextAtSize(`${truncated}…`, size) > maxWidth
    ) {
        truncated = truncated.slice(0, -1);
    }
    return { text: `${truncated}…`, size };
};

const drawCentered = (
    page: ReturnType<PDFDocument["addPage"]>,
    text: string,
    font: PDFFont,
    size: number,
    y: number,
    color = INK
) => {
    const width = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
        x: (WIDTH - width) / 2,
        y,
        size,
        font,
        color,
    });
};

/**
 * Renders a print-ready A4 landscape certificate. Text is real text (selectable
 * and searchable), using the PDF standard fonts so nothing depends on a font
 * file being present at runtime.
 */
export const buildCertificatePdf = async (
    data: CertificateData
): Promise<Uint8Array> => {
    const organization = data.organization ?? "Code 4 Tomorrow";

    const pdf = await PDFDocument.create();
    pdf.setTitle(`${data.courseTitle} — Certificate of Completion`);
    pdf.setAuthor(organization);
    pdf.setSubject(`Certificate ${data.certificateId}`);
    pdf.setProducer(organization);
    pdf.setCreationDate(data.completionDate);

    const page = pdf.addPage([WIDTH, HEIGHT]);

    const regular = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const oblique = await pdf.embedFont(StandardFonts.HelveticaOblique);

    // Border.
    page.drawRectangle({
        x: 24,
        y: 24,
        width: WIDTH - 48,
        height: HEIGHT - 48,
        borderColor: BRAND,
        borderWidth: 3,
    });
    page.drawRectangle({
        x: 34,
        y: 34,
        width: WIDTH - 68,
        height: HEIGHT - 68,
        borderColor: rgb(0.85, 0.83, 0.95),
        borderWidth: 1,
    });

    drawCentered(
        page,
        organization.toUpperCase(),
        bold,
        16,
        HEIGHT - 92,
        BRAND
    );
    drawCentered(page, "CERTIFICATE OF COMPLETION", bold, 30, HEIGHT - 140);
    drawCentered(page, "This certifies that", regular, 13, HEIGHT - 180, MUTED);

    const name = fitText(data.learnerName, bold, WIDTH - 160, 40, 18);
    drawCentered(page, name.text, bold, name.size, HEIGHT - 232);

    // Underline sized to the name.
    const nameWidth = bold.widthOfTextAtSize(name.text, name.size);
    page.drawLine({
        start: { x: (WIDTH - nameWidth) / 2 - 16, y: HEIGHT - 246 },
        end: { x: (WIDTH + nameWidth) / 2 + 16, y: HEIGHT - 246 },
        thickness: 1,
        color: rgb(0.8, 0.78, 0.9),
    });

    drawCentered(
        page,
        "has successfully completed all requirements for",
        regular,
        13,
        HEIGHT - 276,
        MUTED
    );

    const title = fitText(data.courseTitle, bold, WIDTH - 160, 24, 13);
    drawCentered(page, title.text, bold, title.size, HEIGHT - 314, BRAND);

    const dateText = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
    }).format(data.completionDate);

    drawCentered(
        page,
        `Completed ${dateText}  ·  Approximately ${data.learningHours} learning hours`,
        regular,
        12,
        HEIGHT - 346,
        MUTED
    );

    // QR code linking to the public verification page.
    const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
        margin: 0,
        width: 320,
        errorCorrectionLevel: "M",
    });
    const qrImage = await pdf.embedPng(qrDataUrl);
    const qrSize = 96;
    page.drawImage(qrImage, {
        x: WIDTH - 88 - qrSize,
        y: 74,
        width: qrSize,
        height: qrSize,
    });
    page.drawText("Scan to verify", {
        x: WIDTH - 88 - qrSize,
        y: 60,
        size: 8,
        font: regular,
        color: MUTED,
    });

    // Signature block.
    page.drawLine({
        start: { x: 88, y: 116 },
        end: { x: 320, y: 116 },
        thickness: 1,
        color: rgb(0.7, 0.7, 0.78),
    });
    page.drawText(data.signatoryName ?? organization, {
        x: 88,
        y: 98,
        size: 12,
        font: bold,
        color: INK,
    });
    page.drawText(
        data.signatoryTitle ?? "Authorized on behalf of the organization",
        {
            x: 88,
            y: 82,
            size: 9,
            font: regular,
            color: MUTED,
        }
    );

    // Identifier and verification URL.
    page.drawText(`Certificate ID: ${data.certificateId}`, {
        x: 88,
        y: 56,
        size: 9,
        font: bold,
        color: INK,
    });
    const urlFit = fitText(data.verificationUrl, oblique, WIDTH - 320, 9, 6);
    page.drawText(`Verify at ${urlFit.text}`, {
        x: 88,
        y: 42,
        size: urlFit.size,
        font: oblique,
        color: MUTED,
    });

    return pdf.save();
};
