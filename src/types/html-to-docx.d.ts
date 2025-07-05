declare module "html-to-docx" {
  function htmlToDocx(html: string, options?: any): Promise<Buffer>;
  export = htmlToDocx;
}
