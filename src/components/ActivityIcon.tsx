import { Camera, Download, Apple, Moon, Utensils, Pill, Megaphone, Paintbrush, FileText, DoorOpen, DoorClosed, Heart } from 'lucide-react';

// Maps activity types to styled rounded-square icons matching iOS app-icon aesthetic
const ICON_MAP: Record<string, { Icon: React.ComponentType<any>; gradient: string }> = {
  foto:       { Icon: Camera,      gradient: 'from-[#2563EB] to-[#1E3A8A]' },
  comida:     { Icon: Utensils,    gradient: 'from-[#0EA5E9] to-[#0284C7]' },
  'sueño':    { Icon: Moon,        gradient: 'from-[#1E3A8A] to-[#1e2f6a]' },
  salud:      { Icon: Pill,        gradient: 'from-[#DC2626] to-[#B91C1C]' },
  nota:       { Icon: FileText,    gradient: 'from-[#2563EB] to-[#1E3A8A]' },
  actividad:  { Icon: Paintbrush,  gradient: 'from-[#0EA5E9] to-[#2563EB]' },
  aviso:      { Icon: Megaphone,   gradient: 'from-[#2563EB] to-[#1E3A8A]' },
  entry:      { Icon: DoorOpen,    gradient: 'from-[#16A34A] to-[#15803D]' },
  exit:       { Icon: DoorClosed,  gradient: 'from-[#64748B] to-[#475569]' },
  video:      { Icon: Camera,      gradient: 'from-[#1E3A8A] to-[#2563EB]' },
  download:   { Icon: Download,    gradient: 'from-[#CBD5E1] to-[#94A3B8]' },
  apple:      { Icon: Apple,       gradient: 'from-[#2563EB] to-[#1E3A8A]' },
  heart:      { Icon: Heart,       gradient: 'from-[#DC2626] to-[#B91C1C]' },
};

interface ActivityIconProps {
  type: string;
  size?: number;
  iconSize?: number;
  className?: string;
}

export default function ActivityIcon({ type, size = 44, iconSize = 20, className = '' }: ActivityIconProps) {
  const match = ICON_MAP[type] || ICON_MAP['nota'];
  const { Icon, gradient } = match;

  return (
    <div
      className={`bg-gradient-to-br ${gradient} rounded-[12px] flex items-center justify-center flex-shrink-0 shadow-soft ${className}`}
      style={{ width: size, height: size }}
    >
      <Icon size={iconSize} className="text-white" strokeWidth={2} />
    </div>
  );
}

export { ICON_MAP };
