import {useSelector} from './useSelector.ts';

export function useEvents() {
  const events = useSelector((state) => state.events || []);
  const routerState = useSelector((state) => state.routerState);
  const currentEvent = events.find((o) => o.id === routerState.params.event_id) || null;

  return { events, currentEvent };
}