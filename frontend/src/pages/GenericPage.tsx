import { ReactNode } from 'react';
import { useMediaQuery } from '@mui/material';

interface GenericPageProps {
  children: ReactNode;
  image?: string;
}

export default function GenericPage({
  children,
  image = '/images/test-header-image.jpg'
}: GenericPageProps) {
  const isMobile = useMediaQuery('(max-width: 992px)');
  return (
    <div className="w-full">
      {!isMobile ? (
        <div
          className={`relative w-full min-h-80 bg-cover bg-center brightness-70`}
          style={{ backgroundImage: `url('${image}')` }}
        ></div>
      ) : (
        <div
          className={`relative w-full min-h-80 bg-cover bg-center brightness-70`}
          style={{ backgroundImage: `url('${image}')` }}
        ></div>
      )}
      <div className="relative w-[90%] lg:w-[80%] max-w-[1000px] mx-auto xl:mt-[-6rem] mt-[-14rem] pb-10">
        {children}
      </div>
    </div>
  );
}
