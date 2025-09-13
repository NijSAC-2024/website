import { ReactNode } from 'react';

interface ContentCardProps {
  children: ReactNode;
  className?: string;
}

export default function ContentCard({ children, className }: ContentCardProps) {
  return (
    <div className={`${className} p-5 xl:p-7 w-full rounded-2xl bg-white dark:bg-[#121212] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]`}>
      {children}
    </div>
  );
}
