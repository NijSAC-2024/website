import { ReactNode } from 'react';

interface TextCardProps {
  children: ReactNode;
  className?: string;
}

export default function TextCard({ children, className }: TextCardProps) {
  return (
    <div className={className + ' bg-[rgba(245,245,245,0.7)] dark:bg-[rgba(23,23,23,0.7)] rounded-xl'}>
      {children}
    </div>
  );
}
