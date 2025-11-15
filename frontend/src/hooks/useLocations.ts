import {useSelector} from './useSelector.ts';

export function useLocations() {
  const locations = useSelector((state) => state.locations || []);

  return { locations };
}