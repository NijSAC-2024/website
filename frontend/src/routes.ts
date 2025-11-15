import {Route} from './router.ts';

export const routes = [
  {
    name: 'events',
    path: '/events',
    children: [
      {
        name: 'new',
        path: '/new',
      }, {
        name: 'event',
        path: '/{event_id}',
        children: [
          {
            name: 'edit',
            path: '/edit',
          }
        ],
      },
    ],
  },
  {
    name: 'register',
    path: '/register'
  },
  {
    name: 'about',
    path: '/about',
  },
  {
    name: 'material_rental',
    path: '/material-rental'
  },
  {
    name: 'index',
    path: '/'
  },
  {
    name: 'settings',
    path: '/settings'
  },
  {
    name: 'user',
    path: '/user/{user_id}'
  },
  {
    name: 'members',
    path: '/members',
  },
  {
    name: 'committees',
    path: '/committees',
    children: [
      {
        name: 'new',
        path: '/new',
      },
      {
        name: 'committee',
        path: '/{committee_id}',
        children: [
          {
            name: 'edit',
            path: '/edit'
          }
        ]
      }
    ]
  }

] as const satisfies Route[];

// Recursive type to get all the route names from the Route[]
type GetRouteNames<R extends readonly Route[], Prefix extends string = ''> = {
  [K in keyof R]: R[K] extends { name: infer Name extends string; children?: readonly Route[] }
    ?
    | (Prefix extends '' ? Name : `${Prefix}.${Name}`)
    | (R[K]['children'] extends readonly Route[]
      ? GetRouteNames<R[K]['children'], Prefix extends '' ? Name : `${Prefix}.${Name}`>
      : never)
    : never;
}[number];

export type RouteName = GetRouteNames<typeof routes>;
