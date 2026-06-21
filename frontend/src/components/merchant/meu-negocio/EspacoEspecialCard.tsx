'use client';
import { Lock, Sparkles } from 'lucide-react';
import { Card } from '../Card';
import { inputClass } from '../FormField';

export type TipoEspaco = 'texto' | 'oferta' | 'cupom' | 'video' | '';

export interface EspacoEspecialForm {
  tipo: TipoEspaco;
  titulo: string;
  conteudo: string;
  badge: string;
  cta_texto: string;
  cta_link: string;
  desconto: string;
  codigo: string;
}

const TIPO_LABELS: Record<TipoEspaco, string> = {
  '': 'Desativado',
  texto: 'Texto em destaque',
  oferta: 'Oferta / Promoção',
  cupom: 'Cupom de desconto',
  video: 'Vídeo em destaque',
};

const labelCls = 'text-sm font-medium text-ink-muted';

interface Props {
  isPro: boolean;
  plano: string;
  espaco: EspacoEspecialForm;
  onChange: (campo: keyof EspacoEspecialForm, valor: string) => void;
}

export function EspacoEspecialCard({ isPro, plano, espaco, onChange }: Props) {
  return (
    <Card icon={Sparkles}>
      {/* Custom header — precisa do badge de plano ao lado do título */}
      <div className="flex items-center justify-between -mt-5 mb-5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-green" strokeWidth={2} />
          <h2 className="text-lg font-semibold text-ink">Espaço especial</h2>
        </div>
        {isPro ? (
          <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            {plano.charAt(0).toUpperCase() + plano.slice(1)}
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-ink/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink/40">
            Pro+
          </span>
        )}
      </div>

      <p className="text-sm text-ink-subtle mb-4">
        Seção em destaque visual na sua página pública — ideal para ofertas, cupons ou destaques.
      </p>

      {/* Bloqueio para planos gratuito/básico */}
      {!isPro ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-ink/20 bg-ink/[0.02] px-6 py-8 text-center">
          <Lock className="size-8 text-ink/20" />
          <p className="text-sm font-medium text-ink/50">
            Disponível nos planos Pro, Produção e Fundador.
          </p>
          <a
            href="/planos"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Fazer upgrade
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/[0.02] p-5">

          {/* Tipo */}
          <div className="flex flex-col gap-1.5">
            <label className={labelCls}>Tipo de conteúdo</label>
            <select
              className={inputClass}
              value={espaco.tipo}
              onChange={(e) => onChange('tipo', e.target.value)}
            >
              {(Object.entries(TIPO_LABELS) as [TipoEspaco, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Campos por tipo */}
          {espaco.tipo === '' && (
            <p className="text-sm text-ink/50">
              Selecione um tipo para ativar o espaço especial na sua página pública.
            </p>
          )}

          {espaco.tipo === 'video' && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              O vídeo em destaque é gerenciado pela equipe DescubraSul via VideoDestaque.
              Entre em contato para configurar.
            </div>
          )}

          {(espaco.tipo === 'texto' || espaco.tipo === 'oferta' || espaco.tipo === 'cupom') && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Badge (etiqueta, opcional)</label>
                <input
                  className={inputClass}
                  value={espaco.badge}
                  placeholder="Ex: Novidade, Limitado, Exclusivo"
                  onChange={(e) => onChange('badge', e.target.value)}
                />
                <span className="text-xs text-ink/40">Aparece em destaque acima do título.</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Título</label>
                <input
                  className={inputClass}
                  value={espaco.titulo}
                  placeholder={
                    espaco.tipo === 'oferta'
                      ? 'Ex: 20% off no combo de verão!'
                      : espaco.tipo === 'cupom'
                      ? 'Ex: Desconto exclusivo para você!'
                      : 'Ex: Conheça nosso serviço premium'
                  }
                  onChange={(e) => onChange('titulo', e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Texto de apoio (opcional)</label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={2}
                  value={espaco.conteudo}
                  placeholder="Descrição complementar da oferta ou destaque."
                  onChange={(e) => onChange('conteudo', e.target.value)}
                />
              </div>
            </>
          )}

          {espaco.tipo === 'oferta' && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Percentual de desconto (opcional)</label>
              <input
                className={inputClass}
                value={espaco.desconto}
                placeholder="Ex: 20%"
                onChange={(e) => onChange('desconto', e.target.value)}
              />
            </div>
          )}

          {espaco.tipo === 'cupom' && (
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Código do cupom</label>
              <input
                className={`${inputClass} font-mono tracking-widest uppercase`}
                value={espaco.codigo}
                placeholder="Ex: DESCUBRA10"
                onChange={(e) => onChange('codigo', e.target.value.toUpperCase())}
              />
              <span className="text-xs text-ink/40">
                O visitante vê e copia este código na sua página.
              </span>
            </div>
          )}

          {(espaco.tipo === 'texto' || espaco.tipo === 'oferta') && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Botão — texto (opcional)</label>
                <input
                  className={inputClass}
                  value={espaco.cta_texto}
                  placeholder="Ex: Saiba mais"
                  onChange={(e) => onChange('cta_texto', e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Botão — link (opcional)</label>
                <input
                  className={inputClass}
                  value={espaco.cta_link}
                  placeholder="https://..."
                  onChange={(e) => onChange('cta_link', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Preview vivo */}
          {espaco.tipo && espaco.tipo !== 'video' && (
            <div className="mt-1 rounded-xl bg-gradient-to-br from-primary to-teal-700 p-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/50">
                Preview
              </p>
              {espaco.badge && (
                <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                  {espaco.badge}
                </span>
              )}
              {espaco.titulo && (
                <p className="text-lg font-bold text-white">{espaco.titulo}</p>
              )}
              {espaco.conteudo && (
                <p className="mt-1 text-sm text-white/80">{espaco.conteudo}</p>
              )}
              {espaco.tipo === 'oferta' && espaco.desconto && (
                <p className="mt-2 text-3xl font-black text-white">{espaco.desconto} OFF</p>
              )}
              {espaco.tipo === 'cupom' && espaco.codigo && (
                <div className="mt-3 w-fit rounded-xl border-2 border-dashed border-white/40 bg-white/10 px-5 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    Código
                  </p>
                  <p className="text-xl font-black tracking-widest text-white">{espaco.codigo}</p>
                </div>
              )}
              {espaco.cta_texto && (
                <div className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-primary">
                  {espaco.cta_texto}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
