import { ReactNode } from 'react';

interface TextCardProps {
  children: ReactNode;
  className?: string;
}

export default function TextCard({ children, className }: TextCardProps) {
  return (
    <div className={className + ' bg-neutral-100 dark:bg-neutral-900 rounded-xl'}>
      {children}
    </div>
  );
}
