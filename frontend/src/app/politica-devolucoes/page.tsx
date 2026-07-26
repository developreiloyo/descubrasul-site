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
          O <strong>DescubraSul</strong> é uma vitrina digital — uma plataforma
          que reúne negócios locais do Sul de Santa Catarina em um só lugar,
          permitindo que consumidores encontrem e entrem em contato com
          comerciantes da região.
        </p>
        <p>
          O DescubraSul <strong>não vende produtos, não processa pagamentos e
          não participa de nenhuma etapa da transação comercial</strong> entre
          consumidor e comerciante. Funciona como um espaço de divulgação —
          cada negócio cadastrado é responsável por suas próprias vendas,
          entregas e atendimento ao cliente.
        </p>
      </Section>

      <Section titulo="2. De quem é a responsabilidade pela venda">
        <p>
          A responsabilidade pela venda, pelo produto entregue e pelo
          cumprimento de qualquer acordo (preço, prazo, condição) é
          exclusivamente do <strong>comerciante cadastrado</strong> na
          plataforma — não do DescubraSul.
        </p>
        <p>
          Toda negociação acontece diretamente entre consumidor e comerciante,
          por WhatsApp ou telefone. O DescubraSul apenas exibe as informações
          de contato e o catálogo do negócio.
        </p>
      </Section>

      <Section titulo="3. Devoluções e trocas">
        <p>
          Como o DescubraSul não realiza vendas nem recebe pagamentos, a
          plataforma <strong>não aceita devoluções nem trocas</strong>.
        </p>
        <p>
          Caso você precise solicitar uma devolução, troca ou reembolso:
        </p>
        <ul>
          <li>
            Entre em contato <strong>diretamente com o comerciante</strong>{" "}
            pelo mesmo canal (WhatsApp ou telefone) usado na compra.
          </li>
          <li>
            Cada negócio define sua própria política de trocas e devoluções —
            consulte o comerciante antes de finalizar a compra.
          </li>
          <li>
            Os direitos do consumidor previstos no{" "}
            <strong>Código de Defesa do Consumidor (Lei 8.078/1990)</strong>{" "}
            se aplicam à relação entre você e o comerciante, não à relação
            com o DescubraSul.
          </li>
        </ul>
      </Section>

      <Section titulo="4. Responsabilidade dos comerciantes cadastrados">
        <p>
          Ao cadastrar seu negócio no DescubraSul, o comerciante concorda em
          ser o único responsável pelas transações realizadas com seus clientes,
          incluindo:
        </p>
        <ul>
          <li>Qualidade e conformidade dos produtos ou serviços oferecidos.</li>
          <li>Cumprimento dos prazos e condições acordados com o consumidor.</li>
          <li>Atendimento a solicitações de devolução, troca ou reembolso.</li>
          <li>Observ��ncia do Código de Defesa do Consumidor.</li>
        </ul>
      </Section>

      <Section titulo="5. Contato">
        <p>
          Para dúvidas sobre esta política ou sobre o funcionamento da
          plataforma:{" "}
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
