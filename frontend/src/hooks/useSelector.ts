import { useContext } from 'react';
import { State } from '../types';
import {WebsiteContext} from './useState.ts';

export function useSelector<T>(selector: (state: State) => T): NonNullable<T> {
  const { state } = useContext(WebsiteContext);
  const selectedState = selector(state);

  if (selectedState === null || selectedState === undefined) {
    throw new Error('Selector returned undefined. Ensure the selector is correct and returns a valid value.');
  }

  return selectedState;
}
