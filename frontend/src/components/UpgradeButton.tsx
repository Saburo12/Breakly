import { Zap } from 'lucide-react';

interface UpgradeButtonProps {
  onClick: () => void;
  onIntegrationsClick?: () => void;
  onPublishClick?: () => void;
}

export function UpgradeButton({ onClick, onIntegrationsClick, onPublishClick }: UpgradeButtonProps) {
  return (
    <div className="inline-flex items-center gap-3">
      {/* Integrations Button - Left (no purple, no zap) */}
      <button
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] transition-colors rounded-md border border-[#444]"
        onClick={onIntegrationsClick}
      >
        <span className="text-white font-medium">Integrations</span>
      </button>

      {/* Upgrade Button - Center (purple with zap) */}
      <button
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5b5fef] hover:bg-[#4a4dd8] transition-colors rounded-md"
        onClick={onClick}
      >
        <Zap className="size-4 fill-white text-white" />
        <span className="text-white font-medium">Upgrade</span>
      </button>

      {/* Publish Button - Right (purple, no zap) */}
      <button
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5b5fef] hover:bg-[#4a4dd8] transition-colors rounded-md"
        onClick={onPublishClick}
      >
        <span className="text-white font-medium">Publish</span>
      </button>
    </div>
  );
}
