import {useSelector} from './useSelector.ts';

export function useEventRegistrations() {
  const eventRegistrations = useSelector((state) => state.registrations || []);
  const userEventRegistrations = useSelector((state) => state.userEventRegistrations || [])

  return { eventRegistrations, userEventRegistrations };
}