import * as Icons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export function IconRenderer({ name, className, size = 16 }: IconRendererProps) {
  const LucideIcon = (Icons as any)[name];
  
  if (!LucideIcon) {
    return <Icons.FileText className={className} size={size} />;
  }
  
  return <LucideIcon className={className} size={size} />;
}
