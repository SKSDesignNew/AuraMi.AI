import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { getPublicUrl } from '@/lib/s3';
import { NextResponse } from 'next/server';

// Generic data fetching endpoint for dashboard components
// GET /api/data?type=members&householdId=xxx
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const householdId = searchParams.get('householdId');

  if (!type || !householdId) {
    return NextResponse.json({ error: 'Missing type or householdId' }, { status: 400 });
  }

  switch (type) {
    case 'members': {
      const rows = await query(
        `SELECT hm.id, hm.role, hm.status, hm.user_id, hm.created_at,
                json_build_object(
                  'email', p.email,
                  'first_name', p.first_name,
                  'last_name', p.last_name,
                  'avatar_url', p.avatar_url
                ) as profile
         FROM household_members hm
         JOIN profiles p ON p.id = hm.user_id
         WHERE hm.household_id = $1 AND hm.status = 'active'
         ORDER BY hm.created_at ASC`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'persons': {
      const rows = await query(
        `SELECT id, first_name, last_name, nickname, sex, birth_year, death_date
         FROM persons
         WHERE household_id = $1
         ORDER BY birth_year ASC NULLS LAST`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'relationships': {
      const rows = await query(
        `SELECT id, from_person_id, to_person_id, relation_type, relation_label
         FROM relationships
         WHERE household_id = $1`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'timeline': {
      const rows = await query(
        `SELECT * FROM family_timeline
         WHERE household_id = $1
         ORDER BY sort_date ASC`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'events': {
      const rows = await query(
        `SELECT id, title, event_type, event_date, event_year, location, description, created_at
         FROM events
         WHERE household_id = $1
         ORDER BY event_year DESC NULLS FIRST`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'assets': {
      const rows = await query(
        `SELECT id, asset_type, storage_path, original_filename, description, captured_at, year, created_at
         FROM assets
         WHERE household_id = $1
         ORDER BY created_at DESC`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'stories': {
      const rows = await query(
        `SELECT s.id, s.title, s.content, s.era, s.location, s.tags, s.created_at,
                CASE WHEN s.narrator_id IS NOT NULL THEN
                  json_build_object('first_name', p.first_name, 'last_name', p.last_name)
                ELSE NULL END as narrator
         FROM stories s
         LEFT JOIN persons p ON p.id = s.narrator_id
         WHERE s.household_id = $1
         ORDER BY s.created_at DESC`,
        [householdId]
      );
      return NextResponse.json({ data: rows });
    }

    case 'asset_url': {
      const path = searchParams.get('path');
      if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 });
      const url = await getPublicUrl(path);
      return NextResponse.json({ url });
    }

    default:
      return NextResponse.json({ error: `Unknown type: ${type}` }, { status: 400 });
  }
}

// POST /api/data — for mutations from client components
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, householdId } = body;

  if (!action || !householdId) {
    return NextResponse.json({ error: 'Missing action or householdId' }, { status: 400 });
  }

  switch (action) {
    case 'update_household_name': {
      const { name } = body;
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: 'Name too short' }, { status: 400 });
      }
      await query(
        `UPDATE households SET name = $1 WHERE id = $2`,
        [name.trim(), householdId]
      );
      return NextResponse.json({ success: true });
    }

    default:
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }
}
