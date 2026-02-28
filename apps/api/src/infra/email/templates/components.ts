/**
 * Componentes reutilizáveis para templates de email.
 * Todos usam table-based layout e inline styles para máxima compatibilidade.
 */

/** Botão de ação principal (CTA) */
export function emailButton(text: string, url: string, color = '#3399FF'): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td align="center" style="background-color:${color}; border-radius:8px;">
          <a href="${url}" target="_blank" style="display:inline-block; padding:14px 32px; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; border-radius:8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Botão secundário (outline) */
export function emailSecondaryButton(text: string, url: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td align="center" style="border:2px solid #d1d5db; border-radius:8px;">
          <a href="${url}" target="_blank" style="display:inline-block; padding:12px 28px; color:#374151; font-size:14px; font-weight:500; text-decoration:none; border-radius:8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>`;
}

/** Divisor horizontal */
export function emailDivider(): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="border-top:1px solid #e5e7eb;"></td>
      </tr>
    </table>`;
}

const INFO_BOX_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
  danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
  success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
};

/** Texto de destaque (info box) */
export function emailInfoBox(text: string, type: 'info' | 'warning' | 'danger' | 'success' = 'info'): string {
  const style = INFO_BOX_STYLES[type];
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:16px; background-color:${style.bg}; border:1px solid ${style.border}; border-radius:8px; color:${style.text}; font-size:14px; line-height:1.6;">
          ${text}
        </td>
      </tr>
    </table>`;
}

/** Tabela de dados (key-value) */
export function emailDataTable(rows: { label: string; value: string }[]): string {
  const rowsHtml = rows
    .map(
      (row) => `
      <tr>
        <td style="padding:8px 12px; color:#6b7280; font-size:13px; white-space:nowrap; vertical-align:top;">${row.label}</td>
        <td style="padding:8px 12px; color:#111827; font-size:13px; vertical-align:top;">${row.value}</td>
      </tr>`
    )
    .join('');

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
      ${rowsHtml}
    </table>`;
}

/** Heading (h1, h2, h3) */
export function emailHeading(text: string, level: 1 | 2 | 3 = 1): string {
  const styles: Record<number, string> = {
    1: 'font-size:24px; font-weight:700; color:#111827; margin:0 0 16px; line-height:1.3;',
    2: 'font-size:20px; font-weight:600; color:#111827; margin:0 0 12px; line-height:1.3;',
    3: 'font-size:16px; font-weight:600; color:#374151; margin:0 0 8px; line-height:1.3;',
  };
  return `<h${level} style="${styles[level]}">${text}</h${level}>`;
}

/** Parágrafo com estilo padrão */
export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px; color:#374151; font-size:15px; line-height:1.6;">${text}</p>`;
}

/** Nota de rodapé/disclaimer */
export function emailDisclaimer(text: string): string {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr>
        <td style="padding:12px 0; border-top:1px solid #e5e7eb; color:#9ca3af; font-size:12px; line-height:1.5;">
          ${text}
        </td>
      </tr>
    </table>`;
}

/** Código/token em destaque (ex: PIN, código de verificação) */
export function emailCode(code: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="padding:16px 32px; background-color:#f3f4f6; border-radius:8px; font-family:'Courier New',Courier,monospace; font-size:28px; font-weight:700; color:#111827; letter-spacing:4px; text-align:center;">
          ${code}
        </td>
      </tr>
    </table>`;
}
