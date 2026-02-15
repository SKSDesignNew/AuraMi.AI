import { createSupabaseServerClient } from '@/lib/supabase-ssr';
import { supabaseAdmin } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json(
      { error: 'Household name must be at least 2 characters' },
      { status: 400 }
    );
  }

  // Check if user already has a household
  const { data: existing } = await supabaseAdmin
    .from('household_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (existing) {
    return NextResponse.json(
      { error: 'You already belong to a household' },
      { status: 400 }
    );
  }

  // Create household
  const { data: household, error: hErr } = await supabaseAdmin
    .from('households')
    .insert({ name: name.trim(), created_by: user.id })
    .select('id, name')
    .single();

  if (hErr || !household) {
    return NextResponse.json(
      { error: hErr?.message || 'Failed to create household' },
      { status: 500 }
    );
  }

  // Add user as owner
  const { error: mErr } = await supabaseAdmin
    .from('household_members')
    .insert({
      household_id: household.id,
      user_id: user.id,
      role: 'owner',
      status: 'active',
    });

  if (mErr) {
    // Rollback household creation
    await supabaseAdmin.from('households').delete().eq('id', household.id);
    return NextResponse.json(
      { error: mErr.message || 'Failed to add membership' },
      { status: 500 }
    );
  }

  return NextResponse.json({ household });
}
