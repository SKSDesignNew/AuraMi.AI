import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  const formData = await request.formData();
  const householdId = formData.get('householdId') as string;
  const files = formData.getAll('files') as File[];

  if (!householdId || files.length === 0) {
    return NextResponse.json({ error: 'Missing householdId or files' }, { status: 400 });
  }

  const uploaded: { id: string; filename: string }[] = [];

  for (const file of files) {
    const ext = file.name.split('.').pop() || 'bin';
    const key = `${householdId}/${crypto.randomUUID()}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadFile(key, buffer, file.type);

    // Determine asset type
    let assetType = 'document';
    if (file.type.startsWith('image/')) assetType = 'photo';
    else if (file.type.startsWith('video/')) assetType = 'video';
    else if (file.type.startsWith('audio/')) assetType = 'audio';

    const row = await query<{ id: string }>(
      `INSERT INTO assets (household_id, asset_type, storage_bucket, storage_path, original_filename, mime_type, created_by)
       VALUES ($1, $2, 'aurami-family-assets', $3, $4, $5, $6)
       RETURNING id`,
      [householdId, assetType, key, file.name, file.type, userId]
    );

    if (row[0]) {
      uploaded.push({ id: row[0].id, filename: file.name });
    }
  }

  return NextResponse.json({
    uploaded: uploaded.length,
    files: uploaded,
  });
}
