import { Route } from './types.ts';

/**
 * This table contains a list of all named routes
 */
export const routes = [
  ['/', 'index'],
  ['/register', 'register'],
  ['/events', 'events'],
  ['/events/new', 'new_event'],
  ['/event/:id', 'event'],
  ['/event/:id/edit', 'edit_event'],
  ['/about', 'about'],
  ['/material-rental', 'material_rental'],
  ['/not-found', 'not_found'],
  ['/settings', 'settings'],
  ['/account', 'account'],
  ['/members', 'members']
];

function toRouteObject(route: string[]): Route {
  return { path: route[0], name: route[1], params: undefined };
}

export function matchName(name: string): Route | undefined {
  const route = routes.find((r) => r[1] === name);
  return route ? toRouteObject(route) : undefined;
}

function simpleMatchPath(path: string): Route | undefined {
  const route = routes.find((r) => r[0] === path);
  return route ? toRouteObject(route) : undefined;
}

export function matchPath(path: string): Route | undefined {
  if (path !== '/') {
    path = path.replace(/\/$/, ''); // ignore tailing slashes
  }

  const simple = simpleMatchPath(path);
  if (simple) {
    return simple;
  }

  for (const route of routes) {
    const match = new RegExp(
      `^${route[0].replace(/:([^\s/]+)/g, '(?<$1>[\\w-]+)')}$`
    );
    const matches = path.match(match);

    if (matches !== null) {
      return { name: route[1], path: route[0], params: matches.groups };
    }
  }
}

export function paramsToPath(route: Route, params?: { [k: string]: string }): Route {
  if (params) {
    for (const param of Object.entries(params)) {
      route.path = route.path.replaceAll(':' + param[0], param[1] as string);
    }
  }

  return route;
}

/**
 * Match route and params based on current URL
 */
export function parseLocation(location: Location): Route {
  const route = matchPath(location.pathname);
  if (!route) {
    throw new Error('Route not found: ' + location.pathname);
  }

  if (!route.params) {
    route.params = {};
  }

  const searchParams = new URLSearchParams(location.search);
  for (const param of searchParams.entries()) {
    route.params[param[0]] = param[1];
  }

  return route;
}
