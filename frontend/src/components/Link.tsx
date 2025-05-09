import React from 'react';
import { matchName } from '../router';
import { useAppState } from '../providers/AppStateProvider.tsx';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  routeName?: string;
  params?: Record<string, string>;
  keepParams?: boolean;
  onClick?: () => void;
}

export default function Link({
  routeName,
  params,
  keepParams,
  className,
  onClick,
  ...props
}: LinkProps) {
  const { navigate, route: currentRoute } = useAppState();
  const currentParams = currentRoute.params;

  const targetRouteName = routeName || currentRoute.name;
  const targetParams = keepParams
    ? { ...currentParams, ...(params || {}) }
    : params || {};
  const route = matchName(targetRouteName);
  const active = currentRoute.name === targetRouteName;
  const fullClassName = `${className || ''} ${active ? 'active' : ''}`.trim();
  const click = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    navigate(targetRouteName, targetParams);
  };
  return (
    <a
      {...props}
      href={route?.path || '/not-found'}
      className={fullClassName}
      onClick={click}
    >
      {props.children}
    </a>
  );
}
