import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — DescubraSul",
  description:
    "Leia os Termos de Uso do DescubraSul — vitrina digital de negócios locais do Sul de Santa Catarina.",
};

export default function TermosPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-primary underline">
        ← Voltar para o início
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-ink">Termos de Uso</h1>
      <p className="mt-2 text-sm text-ink/50">Vigência: 18 de junho de 2025</p>

      <Section titulo="1. Objeto">
        <p>
          O <strong>DescubraSul</strong> (doravante "Plataforma") é um serviço
          digital de vitrina e divulgação de negócios locais do Sul de Santa
          Catarina, operado por <strong>[PENDENTE: razão social]</strong> (CNPJ{" "}
          <strong>[PENDENTE: CNPJ]</strong>).
        </p>
        <p>
          Ao se cadastrar, o usuário ("Comerciante") aceita integralmente estes
          Termos de Uso. O uso continuado da Plataforma após alterações nos
          Termos implica aceitação das novas condições.
        </p>
      </Section>

      <Section titulo="2. Cadastro e responsabilidades">
        <ul>
          <li>
            O Comerciante deve fornecer informações verdadeiras, completas e
            atualizadas sobre si e sobre seu negócio.
          </li>
          <li>
            É vedado cadastrar negócios de terceiros sem autorização expressa.
          </li>
          <li>
            O Comerciante é o único responsável pelo conteúdo publicado (textos,
            imagens, preços e informações de contato).
          </li>
          <li>
            Credenciais de acesso são pessoais e intransferíveis. Em caso de uso
            não autorizado, o Comerciante deve notificar imediatamente a
            Plataforma.
          </li>
          <li>
            A Plataforma se reserva o direito de suspender ou excluir contas com
            informações falsas, conteúdo ofensivo ou que violem estes Termos.
          </li>
        </ul>
      </Section>

      <Section titulo="3. Planos e pagamentos">
        <ul>
          <li>
            A Plataforma oferece planos pagos (Básico, Pro, Produção e Fundador)
            com benefícios progressivos de visibilidade e recursos.
          </li>
          <li>
            Pagamentos são processados pelo Mercado Pago. O Comerciante deve
            manter dados de pagamento válidos para manutenção do plano ativo.
          </li>
          <li>
            Em caso de inadimplência, o plano é rebaixado automaticamente para o
            nível Gratuito após 7 dias de atraso, sem exclusão do cadastro.
          </li>
          <li>
            Cancelamentos devem ser solicitados com até 48 horas de antecedência
            do próximo ciclo de cobrança para evitar nova cobrança.
          </li>
          <li>
            Reembolsos são analisados caso a caso; falhas técnicas comprovadas da
            Plataforma dão direito a crédito equivalente no próximo ciclo.
          </li>
        </ul>
      </Section>

      <Section titulo="4. Conteúdo do comerciante">
        <ul>
          <li>
            O Comerciante garante que possui os direitos sobre todo o conteúdo
            publicado (fotos, textos, marcas) e que ele não infringe direitos de
            terceiros.
          </li>
          <li>
            É proibido publicar conteúdo enganoso, difamatório, discriminatório,
            com práticas de SEO manipulativas (keyword stuffing, conteúdo
            duplicado) ou que viole a legislação brasileira.
          </li>
          <li>
            A Plataforma pode editar ou remover conteúdo que viole estas regras,
            sem aviso prévio, e notificar o Comerciante em seguida.
          </li>
          <li>
            Ao publicar conteúdo, o Comerciante concede à Plataforma licença
            não-exclusiva para exibi-lo, indexá-lo e distribuí-lo nos canais da
            Plataforma.
          </li>
        </ul>
      </Section>

      <Section titulo="5. Disponibilidade e limitação de responsabilidade">
        <ul>
          <li>
            A Plataforma se esforça para manter disponibilidade de 99% ao mês,
            mas não garante operação ininterrupta, especialmente em casos de
            manutenção programada ou eventos fora de seu controle.
          </li>
          <li>
            A Plataforma não se responsabiliza por negociações, transações ou
            desentendimentos entre Comerciantes e seus clientes realizados fora
            da Plataforma.
          </li>
          <li>
            Em nenhuma hipótese a responsabilidade total da Plataforma perante um
            Comerciante excederá o valor pago nos últimos 3 meses de assinatura.
          </li>
        </ul>
      </Section>

      <Section titulo="6. Propriedade intelectual">
        <p>
          A marca DescubraSul, o design, o código-fonte e os textos institucionais
          da Plataforma são de propriedade exclusiva de{" "}
          <strong>[PENDENTE: razão social]</strong>.
          É vedada a reprodução ou uso sem autorização prévia e por escrito.
        </p>
      </Section>

      <Section titulo="7. Foro">
        <p>
          Estes Termos são regidos pela legislação brasileira. Fica eleito o foro
          da comarca de <strong>Criciúma, Estado de Santa Catarina</strong>, para
          dirimir quaisquer controvérsias decorrentes deste instrumento, com
          renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
      </Section>

      <Section titulo="8. Contato">
        <p>
          Dúvidas sobre estes Termos:{" "}
          <a
            href="mailto:contato@descubrasul.com"
            className="text-primary underline"
          >
            contato@descubrasul.com
          </a>
        </p>
      </Section>

      <p className="mt-10 text-sm text-ink/40">
        A versão vigente destes Termos é sempre a publicada nesta página, com a
        data indicada no topo.
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
