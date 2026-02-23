import { CodeBlock } from '../components/CodeBlock';
import { NavPrevNext } from '../components/NavPrevNext';

export const metadata = {
  title: 'Base de Conhecimento — Teki Docs',
};

export default function KnowledgeBasePage() {
  return (
    <article>
      <h1 className="text-3xl font-bold text-[#fafafa] mb-2">Base de Conhecimento</h1>
      <p className="text-lg text-[#a1a1aa] mb-8">
        Faça upload de documentos para que o agente consulte durante as respostas.
      </p>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-4 mt-8">Formatos suportados</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { ext: 'PDF', limit: '10 MB' },
          { ext: 'DOCX', limit: '10 MB' },
          { ext: 'TXT', limit: '5 MB' },
          { ext: 'MD', limit: '5 MB' },
        ].map((f) => (
          <div
            key={f.ext}
            className="rounded-lg border border-[#3f3f46] bg-[#18181b] p-3 text-center"
          >
            <div className="text-sm font-bold text-[#2A8F9D]">.{f.ext.toLowerCase()}</div>
            <div className="text-xs text-[#71717a] mt-1">max {f.limit}</div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Upload de documento</h2>
      <CodeBlock
        language="bash"
        code={`curl -X POST https://api.teki.com.br/v1/agents/agent_net01/documents \\
  -H "Authorization: Bearer tk_live_..." \\
  -F "file=@runbook-nginx.pdf" \\
  -F "name=Runbook Nginx"`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Resposta</h2>
      <CodeBlock
        language="json"
        code={`{
  "id": "doc_abc123",
  "name": "Runbook Nginx",
  "filename": "runbook-nginx.pdf",
  "size": 245120,
  "status": "processing",
  "createdAt": "2026-02-22T14:05:00Z"
}`}
      />

      <div className="my-4 rounded-lg border border-[#f5a524]/30 bg-[#f5a524]/5 px-4 py-3">
        <p className="text-sm text-[#f5a524]">
          <strong>Nota:</strong> O processamento leva alguns segundos. Use o campo{' '}
          <code className="font-mono text-xs">status</code> para verificar:{' '}
          <code className="font-mono text-xs">processing</code> → <code className="font-mono text-xs">ready</code>.
        </p>
      </div>

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Listar documentos</h2>
      <CodeBlock
        language="bash"
        code={`curl https://api.teki.com.br/v1/agents/agent_net01/documents \\
  -H "Authorization: Bearer tk_live_..."`}
      />

      <h2 className="text-xl font-semibold text-[#fafafa] mb-3 mt-8">Remover documento</h2>
      <CodeBlock
        language="bash"
        code={`curl -X DELETE https://api.teki.com.br/v1/agents/agent_net01/documents/doc_abc123 \\
  -H "Authorization: Bearer tk_live_..."`}
      />

      <NavPrevNext
        prev={{ label: 'Agentes', href: '/docs/agents' }}
        next={{ label: 'OpenClaw', href: '/docs/openclaw' }}
      />
    </article>
  );
}
