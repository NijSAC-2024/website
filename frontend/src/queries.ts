export const queryKeys = {
  auth: {
    user: () => ['auth', 'user'] as const,
  },

  version: () => ['version'] as const,
  whoami: () => ['whoami'] as const,

  files: {
    all: () => ['file'] as const,
    detail: (id?: string) => ['file', id] as const,
    metadata: (id?: string) => ['file', id, 'metadata'] as const,
  },

  users: {
    all: () => ['user'] as const,
    detail: (id?: string) => ['user', id] as const,

    registrations: (id?: string) =>
      ['user', id, 'event_registrations'] as const,

    events: (id?: string) =>
      ['user', id, 'events'] as const,

    committees: (id?: string) =>
      ['user', id, 'committees'] as const,

    material: {
      list: (id?: string) =>
        ['user', id, 'material'] as const,

      userMaterials: (id: string) =>
        ['user', id, 'getMaterial'] as const,
    },
  },

  events: {
    all: () => ['event'] as const,
    detail: (id?: string) => ['event', id] as const,

    registrations: (eventId?: string) =>
      ['event', eventId, 'registration'] as const,

    registrationDetail: (
      eventId?: string,
      registrationId?: string
    ) =>
      ['event', eventId, 'registration', registrationId] as const,
  },

  locations: {
    all: () => ['location'] as const,
    detail: (id?: string) => ['location', id] as const,
    usedBy: (id?: string) =>
      ['location', id, 'used_by'] as const,
  },

  committees: {
    all: () => ['committee'] as const,
    detail: (id?: string) => ['committee', id] as const,

    members: (id?: string) =>
      ['committee', id, 'members'] as const,
  },
};