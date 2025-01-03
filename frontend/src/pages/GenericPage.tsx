import { ReactNode } from 'react';

interface GenericPageProps {
  children: ReactNode;
  image: string;
}

export default function GenericPage({ children, image }: GenericPageProps) {
  return (
    <div className="w-full">
      <div
        className={`relative w-full min-h-80 bg-cover bg-center brightness-70`}
        style={{ backgroundImage: `url('${image}')` }}
      ></div>
      <div className="relative w-[95%] lg:w-[80%] max-w-[1000px] mx-auto mt-[-100px] pb-10">
        {children}
      </div>
    </div>
  );
}
