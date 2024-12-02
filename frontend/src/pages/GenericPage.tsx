import { ReactNode } from 'react';

export default function GenericPage(props: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="relative w-full h-[300px] bg-cover bg-center bg-[url('/images/test-header-image.jpg')] brightness-70"></div>
      <div className="relative w-[1000px] mx-auto mt-[-100px]">{props.children}</div>
    </div>
  );
}
