import { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
}

export default function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div className={`p-5 xl:p-7 w-full rounded-2xl bg-[rgba(255,255,255,0.9)] dark:bg-[rgba(18,18,18,0.7)] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9] ${className}`}>
      {children}
    </div>
  );
}
