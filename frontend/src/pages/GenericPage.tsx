import { ReactNode } from 'react';

interface GenericPageProps {
  children: ReactNode;
}

export default function GenericPage({ children }: GenericPageProps) {
  return (
    <div className="w-full">
      <div className="relative w-full min-h-80 bg-cover bg-center bg-[url('/images/test-header-image.jpg')] brightness-70"></div>
      <div className="relative w-[90%] lg:w-[80%] max-w-[1000px] mx-auto mt-[-100px]">
        {children}
      </div>
    </div>
  );
}
