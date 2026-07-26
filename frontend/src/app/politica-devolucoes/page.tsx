import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Devoluções — DescubraSul",
  description:
    "DescubraSul é uma vitrina digital. Saiba como funcionam devoluções e trocas nos negócios cadastrados na plataforma.",
};

export default function PoliticaDevolucoes() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-primary underline">
        ← Voltar para o início
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-ink">
        Política de Devoluções e Trocas
      </h1>
      <p className="mt-2 text-sm text-ink/50">Vigência: 26 de julho de 2026</p>

      <Section titulo="1. O que é o DescubraSul">
        <p>
          O <strong>DescubraSul</strong> é uma vitrina digital de negócios
          locais do Sul de Santa Catarina. A plataforma conecta consumidores com
          comerciantes da região, exibindo informações de contato, produtos e
          serviços de cada estabelecimento.
        </p>
        <p>
          O DescubraSul <strong>não realiza vendas, não processa pagamentos
          e não intermedeia transações comerciais</strong> entre consumidores e
          comerciantes.
        </p>
      </Section>

      <Section titulo="2. Como funciona a compra">
        <p>
          Toda negociação — preço, disponibilidade, forma de pagamento e
          entrega — acontece <strong>diretamente entre o consumidor e o
          comerciante</strong>, por WhatsApp ou telefone.
        </p>
        <p>
          O DescubraSul disponibiliza as informações de contato do negócio para
          facilitar essa conexão, mas não participa da transação em nenhuma
          etapa.
        </p>
      </Section>

      <Section titulo="3. Devoluções e trocas">
        <p>
          Como o DescubraSul não é parte de nenhuma transação comercial:
        </p>
        <ul>
          <li>
            O DescubraSul <strong>não aceita devoluções nem trocas</strong> como
            plataforma.
          </li>
          <li>
            Eventuais solicitações de devolução ou troca devem ser tratadas{" "}
            <strong>diretamente com o comerciante</strong> pelo mesmo canal
            (WhatsApp ou telefone) usado para realizar a compra.
          </li>
          <li>
            Cada comerciante pode ter sua própria política de trocas e
            devoluções — recomenda-se consultá-la antes de finalizar a compra.
          </li>
        </ul>
      </Section>

      <Section titulo="4. Contato">
        <p>
          Para dúvidas sobre esta política:{" "}
          <a
            href="mailto:contato@descubrasul.com"
            className="text-primary underline"
          >
            contato@descubrasul.com
          </a>
        </p>
      </Section>

      <p className="mt-10 text-sm text-ink/40">
        Última atualização: 26 de julho de 2026
      </p>
    </main>
  );
}

function Section({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-ink">{titulo}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink/70 [&_ul]:ml-5 [&_ul]:list-disc [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
