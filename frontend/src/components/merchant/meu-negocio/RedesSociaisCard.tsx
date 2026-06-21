'use client';
import { Share2, Globe, Link2, AtSign, Video, Music } from 'lucide-react';
import { Card } from '../Card';
import { FormField, inputClass } from '../FormField';

interface Props {
  instagram_url: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
  x_url: string;
  onChange: (campo: string, valor: string) => void;
}

const REDES = [
  {
    key: 'instagram_url',
    label: 'Instagram',
    placeholder: 'https://instagram.com/seunegocio',
    Icon: AtSign,
  },
  {
    key: 'facebook_url',
    label: 'Facebook',
    placeholder: 'https://facebook.com/...',
    Icon: Globe,
  },
  {
    key: 'youtube_url',
    label: 'YouTube',
    placeholder: 'https://youtube.com/@...',
    Icon: Video,
  },
  {
    key: 'tiktok_url',
    label: 'TikTok',
    placeholder: 'https://tiktok.com/@...',
    Icon: Music,
  },
  {
    key: 'x_url',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/...',
    Icon: Link2,
  },
];

export function RedesSociaisCard({
  instagram_url,
  facebook_url,
  tiktok_url,
  youtube_url,
  x_url,
  onChange,
}: Props) {
  const values: Record<string, string> = {
    instagram_url,
    facebook_url,
    tiktok_url,
    youtube_url,
    x_url,
  };

  return (
    <Card title="Redes sociais" icon={Share2}>
      <div className="flex flex-col gap-4">
        {REDES.map(({ key, label, placeholder, Icon }) => (
          <div key={key} className="flex items-end gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-brand-blue flex-shrink-0">
              <Icon className="w-5 h-5" />
            </div>
            <FormField label={label} htmlFor={key} className="flex-1">
              <input
                id={key}
                type="url"
                value={values[key]}
                placeholder={placeholder}
                onChange={(e) => onChange(key, e.target.value)}
                className={inputClass}
              />
            </FormField>
          </div>
        ))}
      </div>
    </Card>
  );
}
