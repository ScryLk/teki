/**
 * Layout base HTML para todos os emails do Mudea.
 * Usa table-based layout para máxima compatibilidade com email clients.
 */
export function emailLayout(options: {
  title: string;
  preheader?: string;
  content: string;
  footerExtra?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]>
    <style>table,td{font-family:Arial,sans-serif;}</style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#f4f4f7; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${options.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(options.preheader)}</div>` : ''}

  <!-- Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Logo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:16px 0; text-align:center;">
              <span style="font-size:28px; font-weight:700; color:#3399FF; letter-spacing:-0.5px;">
                Mudea
              </span>
            </td>
          </tr>
        </table>

        <!-- Content Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background-color:#ffffff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:32px 24px;">
              ${options.content}
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:24px 16px; text-align:center; color:#9ca3af; font-size:12px; line-height:1.5;">
              ${options.footerExtra || ''}
              <p style="margin:8px 0 0;">
                Mudea &mdash; Sua carteira digital de sa&uacute;de<br>
                Voc&ecirc; recebeu este email porque tem uma conta no Mudea.
              </p>
              <p style="margin:8px 0 0;">
                <a href="https://mudea.app/settings/notifications" style="color:#9ca3af;">Gerenciar notifica&ccedil;&otilde;es</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
