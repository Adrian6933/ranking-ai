export const FILE_MAP: Record<string, string> = {
  'Anthropic': 'anthropic.svg',
  'OpenAI': 'openai.svg',
  'Google': 'google.svg',
  'DeepSeek': 'deepseek.svg',
  'Alibaba': 'alibaba.svg',
  'Meta': 'meta.svg',
  'Mistral': 'mistral.svg',
  'xAI': 'xai.svg',
  'Z.AI': 'z-ai.svg',
  'MiniMax': 'minimax.svg',
  'Moonshot AI': 'moonshot-ai.svg',
  'Cohere': 'cohere.svg',
  'NVIDIA': 'nvidia.svg',
  'MiMo': 'mimo.svg',
  'OpenCode': 'opencode.svg',
};

export function getIconUrl(provider: string): string | null {
  const f = FILE_MAP[provider];
  return f ? `/icons/${f}` : null;
}

export default function ProviderIcon({ provider, size = 24 }: { provider: string; size?: number }) {
  const filename = FILE_MAP[provider];
  
  if (!filename) {
    return (
      <div
        class="rounded flex items-center justify-center font-bold font-mono shrink-0"
        style={{ width: size, height: size, fontSize: size * 0.4, backgroundColor: '#333', color: '#888' }}
        title={provider}
      >
        {provider.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <div
      class="shrink-0 flex items-center justify-center overflow-hidden"
      style={{
        width: size,
        height: size,
        backgroundColor: 'white',
        borderRadius: '6px',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.5) inset'
      }}
      title={provider}
    >
      <img
        src={`/icons/${filename}`}
        alt={provider}
        style={{
          width: '82%',
          height: '82%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
