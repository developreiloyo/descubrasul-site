'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Resumo {
  total_views: number;
  total_whatsapp: number;
  total_shares: number;
  taxa_conversao: number;
}

interface GraficoPonto {
  data: string;
  total_views: number;
  total_whatsapp: number;
}

interface Origem {
  nome: string;
  emoji: string;
  valor: number;
  pct: number;
}

interface TabelaLinha {
  data: string;
  total_views: number;
  total_whatsapp: number;
  total_shares: number;
  taxa_conversao: string;
}

interface DashboardData {
  is_pro: boolean;
  plano_display: string;
  resumo?: Resumo;
  grafico?: GraficoPonto[];
  origens?: Origem[];
  tabela?: TabelaLinha[];
}

function formatarData(dataStr: string): string {
  const [, mes, dia] = dataStr.split('-');
  return `${dia}/${mes}`;
}

export default function MetricasPage() {
  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/proxy/analytics/dashboard')
      .then((r) => r.json())
      .then(setDados)
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3 text-ink-muted">
          <div className="w-8 h-8 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Carregando métricas...</p>
        </div>
      </div>
    );
  }

  // Plano gratuito — banner de upgrade
  if (!dados?.is_pro) {
    return (
      <>
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-ink">Minhas Métricas</h1>
        </header>
        <div className="rounded-2xl border-2 border-dashed border-secondary/40 bg-secondary/5 p-8 text-center">
          <p className="text-4xl">📊</p>
          <h2 className="mt-4 text-xl font-bold">
            Descubra como seu negócio está performando
          </h2>
          <p className="mt-2 text-ink/60 max-w-md mx-auto">
            Com o Plano Pro você vê quantas pessoas visitaram sua página,
            de onde vieram, quantas entraram em contato e muito mais.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-4 max-w-sm mx-auto opacity-40 select-none">
            <div className="rounded-xl bg-white border p-4">
              <p className="text-2xl font-bold text-primary">—</p>
              <p className="text-xs text-ink/60 mt-1">Visualizações</p>
            </div>
            <div className="rounded-xl bg-white border p-4">
              <p className="text-2xl font-bold text-green-600">—</p>
              <p className="text-xs text-ink/60 mt-1">WhatsApp</p>
            </div>
            <div className="rounded-xl bg-white border p-4">
              <p className="text-2xl font-bold text-secondary">—</p>
              <p className="text-xs text-ink/60 mt-1">Conversão</p>
            </div>
          </div>
          <Link
            href="/painel/planos"
            className="mt-6 inline-block rounded-full bg-secondary px-8 py-3 font-bold text-white hover:opacity-90"
          >
            Fazer upgrade para o Pro →
          </Link>
          <p className="mt-3 text-sm text-ink/40">
            Plano atual: {dados?.plano_display}
          </p>
        </div>
      </>
    );
  }

  const { resumo, grafico, origens, tabela } = dados;

  return (
    <>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Minhas Métricas</h1>
        <p className="mt-1 text-ink-muted text-sm">
          Últimos 30 dias · {dados.plano_display}
        </p>
      </header>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-xl border border-ink/10 bg-white shadow-card p-5">
          <p className="text-sm text-ink-muted">Visualizações</p>
          <p className="mt-1 text-3xl font-bold text-brand-green">
            {resumo?.total_views.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white shadow-card p-5">
          <p className="text-sm text-ink-muted">Contatos WhatsApp</p>
          <p className="mt-1 text-3xl font-bold text-green-600">
            {resumo?.total_whatsapp.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white shadow-card p-5">
          <p className="text-sm text-ink-muted">Taxa de Conversão</p>
          <p className="mt-1 text-3xl font-bold text-secondary">
            {resumo?.taxa_conversao}%
          </p>
        </div>
        <div className="rounded-xl border border-ink/10 bg-white shadow-card p-5">
          <p className="text-sm text-ink-muted">Compartilhamentos</p>
          <p className="mt-1 text-3xl font-bold text-ink">
            {resumo?.total_shares.toLocaleString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Gráfico */}
      {grafico && grafico.length > 0 && (
        <section className="rounded-xl border border-ink/10 bg-white shadow-card p-6 mb-6">
          <h2 className="mb-4 text-lg font-semibold">Evolução dos últimos 30 dias</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={grafico.map((p) => ({
                ...p,
                data: formatarData(p.data),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="data" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="total_views"
                name="Visualizações"
                stroke="#1a7a3c"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="total_whatsapp"
                name="WhatsApp"
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Origens */}
      {origens && origens.length > 0 && (
        <section className="rounded-xl border border-ink/10 bg-white shadow-card p-6 mb-6">
          <h2 className="mb-4 text-lg font-semibold">De onde vêm seus visitantes</h2>
          <div className="flex flex-col gap-3">
            {origens.map((o) => (
              <div key={o.nome} className="flex items-center gap-3">
                <span className="text-xl w-8">{o.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{o.nome}</span>
                    <span className="text-ink-muted">
                      {o.valor} visitas · {o.pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div
                      className="h-2 rounded-full bg-brand-green transition-all"
                      style={{ width: `${o.pct}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Tabela últimos 7 dias */}
      {tabela && tabela.length > 0 && (
        <section className="rounded-xl border border-ink/10 bg-white shadow-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Últimos 7 dias</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-ink-muted">
                  <th className="pb-2 pr-4">Data</th>
                  <th className="pb-2 pr-4">Views</th>
                  <th className="pb-2 pr-4">WhatsApp</th>
                  <th className="pb-2 pr-4">Shares</th>
                  <th className="pb-2">Conversão</th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((linha) => (
                  <tr key={linha.data} className="border-b border-ink/5 last:border-0">
                    <td className="py-2 pr-4 font-medium">{formatarData(linha.data)}</td>
                    <td className="py-2 pr-4">{linha.total_views}</td>
                    <td className="py-2 pr-4 text-green-600 font-medium">
                      {linha.total_whatsapp}
                    </td>
                    <td className="py-2 pr-4">{linha.total_shares}</td>
                    <td className="py-2">{linha.taxa_conversao}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
