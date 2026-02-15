import { searchFamily } from './handlers/search-family';
import { getPerson } from './handlers/get-person';
import { addPerson } from './handlers/add-person';
import { updatePerson } from './handlers/update-person';
import { addRelationship } from './handlers/add-relationship';
import { getFamilyTree } from './handlers/get-family-tree';
import { addEvent } from './handlers/add-event';
import { getEvents } from './handlers/get-events';
import { getTimeline } from './handlers/get-timeline';
import { searchPhotos } from './handlers/search-photos';
import { addStory } from './handlers/add-story';
import { searchStories } from './handlers/search-stories';
import { getTodayHistory } from './handlers/get-today-history';
import { generateBio } from './handlers/generate-bio';

const toolHandlers: Record<string, Function> = {
  origin_search_family: searchFamily,
  origin_get_person: getPerson,
  origin_add_person: addPerson,
  origin_update_person: updatePerson,
  origin_add_relationship: addRelationship,
  origin_get_family_tree: getFamilyTree,
  origin_add_event: addEvent,
  origin_get_events: getEvents,
  origin_get_timeline: getTimeline,
  origin_search_photos: searchPhotos,
  origin_add_story: addStory,
  origin_search_stories: searchStories,
  origin_get_today_history: getTodayHistory,
  origin_generate_bio: generateBio,
};

export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  householdId: string,
  userId: string
): Promise<string> {
  const handler = toolHandlers[toolName];

  if (!handler) {
    return JSON.stringify({ error: `Unknown tool: ${toolName}` });
  }

  try {
    const result = await handler({ ...toolInput, householdId, userId });
    return JSON.stringify(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return JSON.stringify({
      error: message,
      suggestion: 'Try rephrasing your request or check if the data exists.',
    });
  }
}
