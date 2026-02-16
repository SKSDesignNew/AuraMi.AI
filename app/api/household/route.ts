import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query, queryOne } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const { name } = await request.json();

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json(
      { error: 'Household name must be at least 2 characters' },
      { status: 400 }
    );
  }

  // Check if user already has a household
  const existing = await queryOne(
    `SELECT id FROM household_members WHERE user_id = $1 AND status = 'active'`,
    [userId]
  );

  if (existing) {
    return NextResponse.json(
      { error: 'You already belong to a household' },
      { status: 400 }
    );
  }

  // Create household
  const household = await queryOne<{ id: string; name: string }>(
    `INSERT INTO households (name, created_by)
     VALUES ($1, $2)
     RETURNING id, name`,
    [name.trim(), userId]
  );

  if (!household) {
    return NextResponse.json(
      { error: 'Failed to create household' },
      { status: 500 }
    );
  }

  // Add user as owner
  try {
    await query(
      `INSERT INTO household_members (household_id, user_id, role, status)
       VALUES ($1, $2, 'owner', 'active')`,
      [household.id, userId]
    );
  } catch (err) {
    // Rollback household creation
    await query(`DELETE FROM households WHERE id = $1`, [household.id]);
    const message = err instanceof Error ? err.message : 'Failed to add membership';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ household });
}
