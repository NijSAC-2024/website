import { ReactNode } from 'react';

interface TextCardProps {
  children: ReactNode;
}

export default function TextCard({ children }: TextCardProps) {
  return (
    <div className="uppercase text-xs font-semibold bg-gray-300 dark:bg-gray-700 rounded-lg inline-block px-1.5 pb-0.5 pt-0.0">
      {children}
    </div>
  );
}
