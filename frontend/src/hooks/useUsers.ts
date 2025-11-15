import {useContext} from 'react';
import {WebsiteContext} from './useState.ts';

export function useUsers() {
  const { state } = useContext(WebsiteContext);

  return { user: state.user, users: state.users || [] };
}