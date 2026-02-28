/**
 * Converte HTML para plain text para versão alternativa dos emails.
 * Garante acessibilidade e compatibilidade com clientes que não renderizam HTML.
 */
export function htmlToPlainText(html: string): string {
  let text = html;

  // Remove preheader hidden div
  text = text.replace(/<div[^>]*display:\s*none[^>]*>.*?<\/div>/gi, '');

  // Convert links: <a href="url">text</a> → text (url)
  text = text.replace(/<a\s+[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '$2 ($1)');

  // Convert headings to uppercase with newlines
  text = text.replace(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/gi, '\n$1\n');

  // Convert <br> and <br/> to newline
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Convert </p>, </div>, </tr> to newline
  text = text.replace(/<\/(p|div|tr)>/gi, '\n');

  // Convert </td> to tab (for table data)
  text = text.replace(/<\/td>/gi, '\t');

  // Convert <li> to bullet point
  text = text.replace(/<li[^>]*>/gi, '• ');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, ' '); // collapse horizontal whitespace
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n'); // max 2 consecutive newlines
  text = text.trim();

  return text;
}
