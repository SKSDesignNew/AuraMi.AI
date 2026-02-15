import { ToolDefinition } from './types';

export const originTools: ToolDefinition[] = [
  {
    name: 'origin_search_family',
    description:
      'Semantic and text search across all family data — persons, events, stories, photos. Use when the user asks questions about family history.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        limit: {
          type: 'number',
          description: 'Max results to return (default 10)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'origin_get_person',
    description:
      'Get full details of a specific person including relationships, events, stories, and photos.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'UUID of the person' },
        name: {
          type: 'string',
          description: 'Name to search for (if person_id not known)',
        },
      },
    },
  },
  {
    name: 'origin_add_person',
    description: 'Add a new person to the family tree.',
    input_schema: {
      type: 'object',
      properties: {
        first_name: { type: 'string', description: 'First name' },
        last_name: { type: 'string', description: 'Last name / surname' },
        middle_name: { type: 'string', description: 'Middle name' },
        nickname: { type: 'string', description: 'Nickname or alias' },
        sex: {
          type: 'string',
          enum: ['male', 'female', 'other'],
          description: 'Sex',
        },
        birth_year: { type: 'number', description: 'Year of birth' },
        birth_month: { type: 'number', description: 'Month of birth (1-12)' },
        birth_day: { type: 'number', description: 'Day of birth (1-31)' },
        birth_date: {
          type: 'string',
          description: 'Full birth date (YYYY-MM-DD)',
        },
        birth_city: { type: 'string', description: 'City of birth' },
        birth_place: {
          type: 'string',
          description: 'Free-text birth location',
        },
        birth_country_code: {
          type: 'string',
          description: 'ISO country code (e.g., IN, US)',
        },
        death_date: {
          type: 'string',
          description: 'Date of death (YYYY-MM-DD)',
        },
        notes: { type: 'string', description: 'Biography or notes' },
      },
      required: ['first_name', 'last_name'],
    },
  },
  {
    name: 'origin_update_person',
    description:
      'Update an existing person\'s details. Only provided fields will be updated.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'UUID of the person to update' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        middle_name: { type: 'string' },
        nickname: { type: 'string' },
        sex: { type: 'string', enum: ['male', 'female', 'other'] },
        birth_year: { type: 'number' },
        birth_month: { type: 'number' },
        birth_day: { type: 'number' },
        birth_date: { type: 'string' },
        birth_city: { type: 'string' },
        birth_place: { type: 'string' },
        birth_country_code: { type: 'string' },
        death_date: { type: 'string' },
        notes: { type: 'string' },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'origin_add_relationship',
    description: 'Create a relationship between two persons in the family tree.',
    input_schema: {
      type: 'object',
      properties: {
        from_person_id: {
          type: 'string',
          description: 'UUID of the subject person',
        },
        to_person_id: {
          type: 'string',
          description: 'UUID of the related person',
        },
        relation_type: {
          type: 'string',
          enum: ['parent', 'child', 'spouse', 'sibling'],
          description: 'Type of relationship',
        },
        relation_label: {
          type: 'string',
          description:
            'Cultural label (e.g., Dadi, Chacha, elder brother)',
        },
        start_date: {
          type: 'string',
          description: 'Relationship start date (e.g., marriage date)',
        },
      },
      required: ['from_person_id', 'to_person_id', 'relation_type'],
    },
  },
  {
    name: 'origin_get_family_tree',
    description:
      'Get tree structure from a starting person — ancestors and/or descendants.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'UUID of the starting person' },
        direction: {
          type: 'string',
          enum: ['ancestors', 'descendants', 'both'],
          description: 'Direction to traverse (default: both)',
        },
        depth: {
          type: 'number',
          description: 'Max depth to traverse (default: 3)',
        },
      },
      required: ['person_id'],
    },
  },
  {
    name: 'origin_add_event',
    description: 'Record a family event or milestone.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Event title' },
        event_type: {
          type: 'string',
          enum: [
            'birth',
            'death',
            'marriage',
            'migration',
            'achievement',
            'custom',
          ],
          description: 'Type of event',
        },
        event_date: { type: 'string', description: 'Full date (YYYY-MM-DD)' },
        event_year: {
          type: 'number',
          description: 'Year only (for approximate dates)',
        },
        location: { type: 'string', description: 'Where it happened' },
        description: { type: 'string', description: 'Detailed description' },
        person_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'UUIDs of persons involved',
        },
        roles: {
          type: 'array',
          items: { type: 'string' },
          description: 'Roles matching person_ids (bride, groom, attendee, etc.)',
        },
      },
      required: ['title'],
    },
  },
  {
    name: 'origin_get_events',
    description: 'List events filtered by person, type, date range, or keyword.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'Filter by person UUID' },
        event_type: { type: 'string', description: 'Filter by event type' },
        year_from: { type: 'number', description: 'Start year' },
        year_to: { type: 'number', description: 'End year' },
        keyword: { type: 'string', description: 'Search keyword' },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
    },
  },
  {
    name: 'origin_get_timeline',
    description:
      'Get a chronological family timeline from the family_timeline view.',
    input_schema: {
      type: 'object',
      properties: {
        year_from: { type: 'number', description: 'Start year filter' },
        year_to: { type: 'number', description: 'End year filter' },
      },
    },
  },
  {
    name: 'origin_search_photos',
    description: 'Search family photos and media assets.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: { type: 'string', description: 'Filter by person UUID' },
        event_id: { type: 'string', description: 'Filter by event UUID' },
        tag: { type: 'string', description: 'Filter by tag' },
        year: { type: 'number', description: 'Filter by year' },
        keyword: { type: 'string', description: 'Search keyword' },
        limit: { type: 'number', description: 'Max results (default 20)' },
      },
    },
  },
  {
    name: 'origin_add_story',
    description: 'Add a family story or narrative.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Story title' },
        content: { type: 'string', description: 'Full story content' },
        narrator_id: {
          type: 'string',
          description: 'UUID of who told the story',
        },
        era: {
          type: 'string',
          description: 'Time period (e.g., 1940s, Pre-Independence)',
        },
        location: { type: 'string', description: 'Where the story took place' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the story',
        },
        person_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'UUIDs of persons mentioned',
        },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'origin_search_stories',
    description: 'Search family stories by query, person, era, or tag.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        person_id: { type: 'string', description: 'Filter by person UUID' },
        era: { type: 'string', description: 'Filter by era' },
        tag: { type: 'string', description: 'Filter by tag' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
    },
  },
  {
    name: 'origin_get_today_history',
    description:
      'Get events and births/deaths that occurred on today\'s date in history.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'origin_generate_bio',
    description:
      'Generate a narrative biography for a person using all available data.',
    input_schema: {
      type: 'object',
      properties: {
        person_id: {
          type: 'string',
          description: 'UUID of the person to generate a bio for',
        },
      },
      required: ['person_id'],
    },
  },
];
