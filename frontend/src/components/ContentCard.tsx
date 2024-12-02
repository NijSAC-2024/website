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
      className={`${className} w-full rounded-md p-7 bg-white border border-solid border-[rgba(0,0,0,0.1)] border-b-2 border-b-[brown] dark:bg-[#121212] dark:border-[rgba(255,255,255,0.1)] dark:border-b-[rgb(68,14,14)]`}
    >
      {children}
    </div>
  );
}
