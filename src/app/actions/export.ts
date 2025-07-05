"use server";

import htmlToDocx from "html-to-docx";

export async function generateDocx(htmlContent: string): Promise<string> {
  const fileBuffer = await htmlToDocx(htmlContent, {
    margins: { top: 720, bottom: 720, left: 720, right: 720 },
  });

  // The html-to-docx library returns a Buffer in Node.js
  if (Buffer.isBuffer(fileBuffer)) {
    return fileBuffer.toString("base64");
  }

  // This is a fallback for other environments where it might return a Blob.
  if (typeof (fileBuffer as any).arrayBuffer === "function") {
    const arrayBuffer = await (fileBuffer as any).arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
  }

  throw new Error("Failed to generate DOCX file: Unexpected buffer type.");
}
