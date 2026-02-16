import { query } from '@/lib/db';

interface SearchPhotosInput {
  person_id?: string;
  event_id?: string;
  tag?: string;
  year?: number;
  keyword?: string;
  limit?: number;
  householdId: string;
  userId: string;
}

export async function searchPhotos(input: SearchPhotosInput) {
  const { householdId, person_id, event_id, tag, year, keyword, limit = 20 } = input;

  // Build dynamic WHERE clause
  const conditions: string[] = ['a.household_id = $1'];
  const values: unknown[] = [householdId];
  let paramIndex = 2;

  if (event_id) {
    conditions.push(`a.linked_event_id = $${paramIndex++}`);
    values.push(event_id);
  }

  if (year) {
    conditions.push(`a.year = $${paramIndex++}`);
    values.push(year);
  }

  if (keyword) {
    const searchPattern = `%${keyword}%`;
    conditions.push(
      `(a.description ILIKE $${paramIndex} OR a.original_filename ILIKE $${paramIndex})`
    );
    values.push(searchPattern);
    paramIndex++;
  }

  if (person_id) {
    conditions.push(`EXISTS (
      SELECT 1 FROM asset_persons ap WHERE ap.asset_id = a.id AND ap.person_id = $${paramIndex}
    )`);
    values.push(person_id);
    paramIndex++;
  }

  if (tag) {
    conditions.push(`EXISTS (
      SELECT 1 FROM asset_tags at WHERE at.asset_id = a.id AND LOWER(at.tag) = LOWER($${paramIndex})
    )`);
    values.push(tag);
    paramIndex++;
  }

  values.push(limit);
  const limitParam = paramIndex;

  const assets = await query<Record<string, unknown>>(
    `SELECT a.*,
            COALESCE(
              json_agg(DISTINCT
                json_build_object(
                  'person_id', ap.person_id,
                  'name', CASE WHEN p.id IS NOT NULL
                    THEN p.first_name || ' ' || p.last_name
                    ELSE NULL
                  END
                )
              ) FILTER (WHERE ap.person_id IS NOT NULL),
              '[]'::json
            ) AS people,
            COALESCE(
              json_agg(DISTINCT atg.tag) FILTER (WHERE atg.tag IS NOT NULL),
              '[]'::json
            ) AS tags
     FROM assets a
     LEFT JOIN asset_persons ap ON ap.asset_id = a.id
     LEFT JOIN persons p ON p.id = ap.person_id
     LEFT JOIN asset_tags atg ON atg.asset_id = a.id
     WHERE ${conditions.join(' AND ')}
     GROUP BY a.id
     ORDER BY a.captured_at DESC NULLS LAST
     LIMIT $${limitParam}`,
    values
  );

  const cdnUrl = process.env.CDN_URL;

  return {
    assets: assets.map((a) => ({
      id: a.id,
      type: a.asset_type,
      description: a.description,
      captured_at: a.captured_at,
      year: a.year,
      url: cdnUrl
        ? `${cdnUrl}/${a.storage_path}`
        : `/api/data?type=asset_url&householdId=${householdId}&path=${encodeURIComponent(String(a.storage_path))}`,
      people: a.people,
      tags: a.tags,
    })),
    count: assets.length,
  };
}
