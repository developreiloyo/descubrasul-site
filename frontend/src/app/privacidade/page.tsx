import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — DescubraSul",
  description:
    "Saiba como o DescubraSul coleta, usa e protege seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/" className="text-sm text-primary underline">
        ← Voltar para o início
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-ink">
        Política de Privacidade
      </h1>
      <p className="mt-2 text-sm text-ink/50">Vigência: 18 de junho de 2025</p>

      <Section titulo="1. Quem somos">
        <p>
          O <strong>DescubraSul</strong> é uma vitrina digital de negócios locais
          do Sul de Santa Catarina, operado por{" "}
          <strong>[PENDENTE: razão social]</strong> (CNPJ{" "}
          <strong>[PENDENTE: CNPJ]</strong>), com sede em Içara/SC.
        </p>
      </Section>

      <Section titulo="2. Dados que coletamos">
        <ul>
          <li>
            <strong>Comerciantes:</strong> nome, e-mail, telefone/WhatsApp, nome
            e informações do negócio, endereço, redes sociais e imagens enviadas.
          </li>
          <li>
            <strong>Visitantes:</strong> dados de navegação (páginas acessadas,
            origem do tráfego, cliques) coletados de forma anonimizada via Google
            Analytics.
          </li>
          <li>
            <strong>Pagamentos:</strong> transações processadas pelo Mercado Pago
            — não armazenamos dados de cartão.
          </li>
        </ul>
      </Section>

      <Section titulo="3. Finalidade do tratamento">
        <ul>
          <li>Exibir o negócio cadastrado na vitrina pública e nos resultados de busca.</li>
          <li>Enviar comunicações sobre planos, atualizações e novidades da plataforma.</li>
          <li>Processar pagamentos de assinaturas.</li>
          <li>Analisar o tráfego e melhorar a experiência da plataforma.</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
      </Section>

      <Section titulo="4. Base legal (LGPD — Lei 13.709/2018)">
        <ul>
          <li>
            <strong>Execução de contrato</strong> (art. 7º, V): para prestar os
            serviços contratados ao comerciante.
          </li>
          <li>
            <strong>Consentimento</strong> (art. 7º, I): para envio de
            comunicações de marketing e uso de cookies de análise.
          </li>
          <li>
            <strong>Legítimo interesse</strong> (art. 7º, IX): para análise
            interna de tráfego e segurança da plataforma.
          </li>
          <li>
            <strong>Cumprimento de obrigação legal</strong> (art. 7º, II): para
            fins fiscais e contábeis.
          </li>
        </ul>
      </Section>

      <Section titulo="5. Compartilhamento de dados">
        <p>Não vendemos seus dados. Compartilhamos apenas com:</p>
        <ul>
          <li>
            <strong>Google Analytics:</strong> dados de navegação anonimizados
            para análise de tráfego.
          </li>
          <li>
            <strong>Mercado Pago:</strong> dados necessários para processar
            pagamentos.
          </li>
          <li>
            <strong>Autoridades públicas:</strong> quando exigido por lei.
          </li>
        </ul>
      </Section>

      <Section titulo="6. Seus direitos como titular">
        <p>
          Nos termos da LGPD, você pode, a qualquer momento, solicitar:
        </p>
        <ul>
          <li>Acesso aos seus dados pessoais.</li>
          <li>Correção de dados incompletos ou desatualizados.</li>
          <li>Exclusão dos dados (quando não houver obrigação legal de retenção).</li>
          <li>Portabilidade dos dados para outro fornecedor.</li>
          <li>Revogação do consentimento para comunicações de marketing.</li>
          <li>Informação sobre o compartilhamento de dados.</li>
        </ul>
      </Section>

      <Section titulo="7. Retenção de dados">
        <p>
          Dados de comerciantes são mantidos durante a vigência da conta e por até
          5 anos após o encerramento, para fins legais e fiscais. Dados de
          navegação são retidos por 26 meses no Google Analytics.
        </p>
      </Section>

      <Section titulo="8. Segurança">
        <p>
          Adotamos medidas técnicas e organizacionais para proteger seus dados:
          criptografia TLS em trânsito, acesso restrito por função, armazenamento
          em servidor com firewall configurado e monitoramento contínuo.
        </p>
      </Section>

      <Section titulo="9. Cookies">
        <p>
          Utilizamos cookies de análise (Google Analytics) e cookies funcionais
          para manter sua sessão autenticada. Ao continuar navegando no site, você
          consente com o uso de cookies. Você pode gerenciá-los nas configurações
          do seu navegador.
        </p>
      </Section>

      <Section titulo="10. Contato e DPO">
        <p>
          Para exercer seus direitos ou esclarecer dúvidas sobre privacidade,
          entre em contato:
        </p>
        <p className="mt-2">
          <strong>E-mail:</strong>{" "}
          <a
            href="mailto:privacidade@descubrasul.com"
            className="text-primary underline"
          >
            privacidade@descubrasul.com
          </a>
        </p>
        <p>
          <strong>Endereço:</strong> Içara, SC — Brasil
        </p>
      </Section>

      <p className="mt-10 text-sm text-ink/40">
        Esta política pode ser atualizada periodicamente. A versão vigente é
        sempre a publicada nesta página, com a data indicada no topo.
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
