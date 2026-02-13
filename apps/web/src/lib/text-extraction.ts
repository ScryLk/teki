import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<string> {
  switch (fileType) {
    case 'pdf': {
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      await parser.destroy();
      return result.text;
    }
    case 'doc':
    case 'docx': {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }
    default:
      throw new Error(`Tipo de arquivo nao suportado: ${fileType}`);
  }
}
