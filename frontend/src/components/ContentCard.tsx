import { ReactNode } from 'react';

export default function ContentCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className} w-full rounded-2xl p-7 bg-white dark:bg-[#121212] border border-solid border-b-2 border-[rgba(1,1,1,0.1)] dark:border-[rgba(255,255,255,0.1)] border-b-[#1976d2] dark:border-b-[#90caf9]`}
    >
      {children}
    </div>
  );
}
