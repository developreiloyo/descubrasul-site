'use client';
import { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

interface Props {
  cep: string;
  direccao: string;
  loc_bairro: string;
  loc_cidade: string;
  estado: string;
  onChange: (campo: string, valor: string) => void;
}

export function EnderecoCard({
  cep,
  direccao,
  loc_bairro,
  loc_cidade,
  estado,
  onChange,
}: Props) {
  const [buscando, setBuscando] = useState(false);

  const buscarCep = async () => {
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length !== 8) return;
    setBuscando(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
      const d = await res.json();
      if (d.erro) return;
      if (d.logradouro) onChange('direccao', d.logradouro);
      if (d.bairro) onChange('loc_bairro', d.bairro);
      if (d.localidade) onChange('loc_cidade', d.localidade);
      if (d.uf) onChange('estado', d.uf);
    } catch {
      // ViaCEP fora do ar — comerciante preenche manual
    } finally {
      setBuscando(false);
    }
  };

  return (
    <Card title="Endereço" icon={MapPin}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="CEP" htmlFor="cep">
          <div className="flex gap-2">
            <input
              id="cep"
              type="text"
              value={cep}
              maxLength={9}
              placeholder="88801-000"
              onChange={(e) => onChange('cep', e.target.value)}
              className={inputClass}
            />
            <button
              type="button"
              onClick={buscarCep}
              disabled={buscando}
              className="px-4 py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
            >
              {buscando ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
            </button>
          </div>
        </FormField>

        <FormField
          label="Logradouro (rua e número)"
          htmlFor="direccao"
          className="md:col-span-2"
        >
          <input
            id="direccao"
            type="text"
            value={direccao}
            onChange={(e) => onChange('direccao', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Bairro" htmlFor="loc_bairro">
          <input
            id="loc_bairro"
            type="text"
            value={loc_bairro}
            onChange={(e) => onChange('loc_bairro', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Cidade" htmlFor="loc_cidade">
          <input
            id="loc_cidade"
            type="text"
            value={loc_cidade}
            onChange={(e) => onChange('loc_cidade', e.target.value)}
            className={inputClass}
          />
        </FormField>

        <FormField label="Estado" htmlFor="estado">
          <input
            id="estado"
            type="text"
            value={estado}
            maxLength={2}
            onChange={(e) => onChange('estado', e.target.value.toUpperCase())}
            className={inputClass}
          />
        </FormField>
      </div>
    </Card>
  );
}
