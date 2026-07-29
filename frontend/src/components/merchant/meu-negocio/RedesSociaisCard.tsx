'use client';
import { useState, useRef, useEffect } from 'react';
import { Share2, Plus, X, ChevronDown, ExternalLink } from 'lucide-react';
import { Card } from '../Card';
import { inputClass } from '../FormField';
import { UpgradeLock } from '../UpgradeLock';
import { SocialIcon } from '@/components/ui/SocialIcon';
import type { ComponentProps } from 'react';

type RedeKey = ComponentProps<typeof SocialIcon>['rede'];

interface Rede {
  key: string;
  socialKey: RedeKey;
  label: string;
  placeholder: string;
}

const REDES: Rede[] = [
  { key: 'instagram_url', socialKey: 'instagram', label: 'Instagram',  placeholder: 'https://instagram.com/seunegocio' },
  { key: 'tiktok_url',    socialKey: 'tiktok',    label: 'TikTok',     placeholder: 'https://tiktok.com/@seunegocio'  },
  { key: 'facebook_url',  socialKey: 'facebook',  label: 'Facebook',   placeholder: 'https://facebook.com/seunegocio' },
  { key: 'youtube_url',   socialKey: 'youtube',   label: 'YouTube',    placeholder: 'https://youtube.com/@seunegocio'  },
  { key: 'linkedin_url',  socialKey: 'linkedin',  label: 'LinkedIn',   placeholder: 'https://linkedin.com/company/...' },
];

interface Props {
  instagram_url: string;
  tiktok_url: string;
  facebook_url: string;
  youtube_url: string;
  linkedin_url: string;
  isPro: boolean;
  onChange: (campo: string, valor: string) => void;
}

export function RedesSociaisCard({
  instagram_url,
  tiktok_url,
  facebook_url,
  youtube_url,
  linkedin_url,
  isPro,
  onChange,
}: Props) {
  const values: Record<string, string> = {
    instagram_url,
    tiktok_url,
    facebook_url,
    youtube_url,
    linkedin_url,
  };

  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<string | null>(null);
  const [inputTemp, setInputTemp] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
  }, []);

  const preenchidas = REDES.filter((r) => values[r.key]);
  const disponiveis = REDES.filter((r) => !values[r.key] && r.key !== emEdicao);

  function iniciarEdicao(key: string) {
    setEmEdicao(key);
    setInputTemp(values[key] || '');
    setDropdownAberto(false);
  }

  function confirmarEdicao() {
    if (emEdicao) {
      onChange(emEdicao, inputTemp.trim());
      setEmEdicao(null);
      setInputTemp('');
    }
  }

  function cancelarEdicao() {
    setEmEdicao(null);
    setInputTemp('');
  }

  function remover(key: string) {
    onChange(key, '');
  }

  const redeEmEdicao = REDES.find((r) => r.key === emEdicao);

  if (!isPro) {
    return (
      <Card title="Redes sociais" icon={Share2}>
        <UpgradeLock mensagem="Disponível nos planos Conexão Sul e Destaque Sul." />
      </Card>
    );
  }

  return (
    <Card title="Redes sociais" icon={Share2}>
      <div className="flex flex-col gap-3">
        {/* Redes já preenchidas */}
        {preenchidas.map((rede) => (
          <div
            key={rede.key}
            className="flex items-center gap-3 rounded-lg border border-[#becabc] bg-white px-3 py-2.5"
          >
            <SocialIcon rede={rede.socialKey} size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium text-[#0b1c30] w-20 flex-shrink-0">
              {rede.label}
            </span>
            <a
              href={values[rede.key]}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-[#2b3fd4] truncate hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{values[rede.key]}</span>
            </a>
            <button
              type="button"
              onClick={() => iniciarEdicao(rede.key)}
              className="text-xs text-[#6f7a6e] hover:text-[#0b1c30] px-2 py-1 rounded transition-colors"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => remover(rede.key)}
              className="text-[#6f7a6e] hover:text-red-500 transition-colors"
              aria-label={`Remover ${rede.label}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {/* Campo de edição inline */}
        {emEdicao && redeEmEdicao && (
          <div className="rounded-lg border border-[#2b3fd4] bg-[#eff4ff] p-3 flex flex-col gap-2">
            <p className="text-sm font-medium text-[#0b1c30]">
              {values[emEdicao] ? `Editar ${redeEmEdicao.label}` : `Adicionar ${redeEmEdicao.label}`}
            </p>
            <input
              autoFocus
              type="url"
              value={inputTemp}
              placeholder={redeEmEdicao.placeholder}
              onChange={(e) => setInputTemp(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmarEdicao();
                if (e.key === 'Escape') cancelarEdicao();
              }}
              className={inputClass}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelarEdicao}
                className="px-3 py-1.5 text-sm text-[#3f493f] hover:bg-[#e5eeff] rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEdicao}
                className="px-3 py-1.5 text-sm font-semibold bg-[#2b3fd4] text-white rounded-lg hover:bg-[#1e30b0] transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Botão adicionar + dropdown */}
        {disponiveis.length > 0 && !emEdicao && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownAberto((v) => !v)}
              className="flex items-center gap-2 text-sm text-[#2b3fd4] font-medium hover:text-[#1e30b0] transition-colors px-1 py-1"
            >
              <Plus className="w-4 h-4" />
              Adicionar rede social
              <ChevronDown className={`w-3 h-3 transition-transform ${dropdownAberto ? 'rotate-180' : ''}`} />
            </button>

            {dropdownAberto && (
              <div className="absolute left-0 top-full mt-1 z-10 bg-white border border-[#becabc] rounded-xl shadow-lg overflow-hidden min-w-[200px]">
                {disponiveis.map((rede) => (
                  <button
                    key={rede.key}
                    type="button"
                    onClick={() => iniciarEdicao(rede.key)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#0b1c30] hover:bg-[#eff4ff] transition-colors text-left"
                  >
                    <SocialIcon rede={rede.socialKey} size={16} className="flex-shrink-0" />
                    {rede.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {preenchidas.length === 0 && !emEdicao && (
          <p className="text-sm text-[#6f7a6e]">
            Nenhuma rede social adicionada ainda.
          </p>
        )}
      </div>
    </Card>
  );
}
