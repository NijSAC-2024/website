import { ReactNode } from 'react';
import {useThemeMode} from '../providers/ThemeProvider.tsx';

interface GenericPageProps {
  children: ReactNode;
  image?: string;
}

export default function GenericPage({
  children,
  image = '/images/test-header-image.jpg'
}: GenericPageProps) {
  const { checkDarkMode } = useThemeMode()
  const darkMode = checkDarkMode();
    
  return (
    <div className="w-full">
      <div
        className="relative w-full min-h-[50vh] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(to top, ${darkMode? 'rgb(18, 18, 18), rgba(18, 18, 18, 0.4)' : 'rgb(255, 255, 255), rgba(255, 255, 255, 0)'}), url('${
            image?.startsWith('https://') || image?.startsWith('/') ? image : `/api/file/${image}`
          }')`
        }}
      ></div>
      <div className="relative w-[95%] xl:w-[80%] max-w-[1000px] mx-auto xl:mt-[-28rem] mt-[-21rem] pb-20">
        {children}
      </div>
    </div>
  );
}
