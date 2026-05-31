import axios from "axios";
import mammoth from "mammoth";

let pdfjsLibPromise;

const ensurePdfJsRuntime = () => {
  if (!globalThis.DOMMatrix) {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor() {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
      }

      multiplySelf() {
        return this;
      }

      preMultiplySelf() {
        return this;
      }

      translateSelf() {
        return this;
      }

      scaleSelf() {
        return this;
      }

      rotateSelf() {
        return this;
      }
    };
  }

  if (!globalThis.ImageData) {
    globalThis.ImageData = class ImageData {};
  }

  if (!globalThis.Path2D) {
    globalThis.Path2D = class Path2D {};
  }
};

const loadPdfJs = async () => {
  ensurePdfJsRuntime();
  pdfjsLibPromise ||= import("pdfjs-dist/legacy/build/pdf.mjs");
  return pdfjsLibPromise;
};

const cleanText = (text) =>
  text
    .replace(/\u0000/g, "")
    .replace(/[^\x20-\x7E\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const extractTextFromBuffer = async (buffer, mimetype = "") => {
  const fileBuffer = new Uint8Array(buffer);

  if (mimetype === "application/pdf") {
    const pdfjsLib = await loadPdfJs();
    const pdf = await pdfjsLib.getDocument({
      data: fileBuffer,
    }).promise;

    let extractedText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");

      extractedText += pageText + "\n";
    }

    return cleanText(extractedText);
  }

  if (
    mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(fileBuffer),
    });

    return cleanText(result.value);
  }

  throw new Error("Unsupported file format");
};

export const extractText = async (fileUrl) => {
  try {
    // Download file from Supabase
    const response = await axios.get(fileUrl, {
      responseType: "arraybuffer",
    });

    // PDF
    if (fileUrl.toLowerCase().endsWith(".pdf")) {
      return extractTextFromBuffer(response.data, "application/pdf");
    }

    // DOCX
    if (fileUrl.toLowerCase().endsWith(".docx")) {
      return extractTextFromBuffer(
        response.data,
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    }

    throw new Error("Unsupported file format");

  } catch (err) {
    console.error("Text Extraction Error:", err);

    throw new Error(
      `Failed to extract text: ${err.message}`
    );
  }
};
