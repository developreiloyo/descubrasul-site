import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card } from '../Card';

const DICAS = [
  <>Adicione fotos reais para ter até <strong>2x mais visualizações</strong>.</>,
  <>Mantenha seu <strong>WhatsApp</strong> atualizado para receber pedidos.</>,
  <>Complete sua <strong>descrição</strong> com palavras-chave do seu setor.</>,
  <>Use o <strong>Espaço Especial</strong> Pro+ para destacar ofertas e cupons.</>,
];

export function DicasCard() {
  return (
    <Card title="Dicas" icon={Lightbulb}>
      <ul className="flex flex-col gap-3">
        {DICAS.map((dica, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink-muted">
            <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0 mt-0.5" />
            <span>{dica}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
