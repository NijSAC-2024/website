import { ReactNode } from 'react';

interface TextCardProps {
  children: ReactNode;
  className?: string;
}

export default function TextCard({ children, className }: TextCardProps) {
  return (
    <div className={className + ' bg-[#ebebeb] dark:bg-[#2e2e2e] rounded-xl'}>
      {children}
    </div>
  );
}
