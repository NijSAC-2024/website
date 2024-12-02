import { ReactNode } from 'react';

export default function TextCard({ children }: { children: ReactNode }) {
  return (
    <div className="uppercase text-[12px] font-semibold transform scale-y-[0.9] bg-gray-300 text-[rgba(1,1,1,0.6)] rounded-md inline-block px-1 pb-0.5 pt-0.0 leading-1">
      {children}
    </div>
  );
}
