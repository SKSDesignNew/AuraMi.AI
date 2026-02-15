import { query } from '@/lib/db';

interface GetFamilyTreeInput {
  person_id: string;
  direction?: 'ancestors' | 'descendants' | 'both';
  depth?: number;
  householdId: string;
  userId: string;
}

interface TreeNode {
  id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  sex?: string;
  birth_year?: number;
  death_date?: string;
  ancestors?: TreeNode[];
  descendants?: TreeNode[];
}

export async function getFamilyTree(input: GetFamilyTreeInput) {
  const { person_id, direction = 'both', depth = 3, householdId } = input;

  // Get all persons and relationships for this household (+ linked)
  const [persons, relationships] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT * FROM get_persons_across_households($1)`,
      [householdId]
    ),
    query<Record<string, unknown>>(
      `SELECT * FROM get_relationships_across_households($1)`,
      [householdId]
    ),
  ]);

  const personMap = new Map<string, Record<string, unknown>>();
  for (const p of persons) {
    personMap.set(p.id as string, p);
  }

  function buildNode(id: string): TreeNode | null {
    const p = personMap.get(id);
    if (!p) return null;
    return {
      id: p.id as string,
      first_name: p.first_name as string,
      last_name: p.last_name as string,
      nickname: p.nickname as string | undefined,
      sex: p.sex as string | undefined,
      birth_year: p.birth_year as number | undefined,
      death_date: p.death_date as string | undefined,
    };
  }

  function getAncestors(id: string, currentDepth: number): TreeNode[] {
    if (currentDepth >= depth) return [];
    const parents = relationships.filter(
      (r) => r.to_person_id === id && r.relation_type === 'parent'
    );
    return parents
      .map((r) => {
        const node = buildNode(r.from_person_id as string);
        if (!node) return null;
        node.ancestors = getAncestors(node.id, currentDepth + 1);
        return node;
      })
      .filter(Boolean) as TreeNode[];
  }

  function getDescendants(id: string, currentDepth: number): TreeNode[] {
    if (currentDepth >= depth) return [];
    const children = relationships.filter(
      (r) => r.from_person_id === id && r.relation_type === 'parent'
    );
    return children
      .map((r) => {
        const node = buildNode(r.to_person_id as string);
        if (!node) return null;
        node.descendants = getDescendants(node.id, currentDepth + 1);
        return node;
      })
      .filter(Boolean) as TreeNode[];
  }

  const root = buildNode(person_id);
  if (!root) {
    throw new Error('Person not found');
  }

  if (direction === 'ancestors' || direction === 'both') {
    root.ancestors = getAncestors(person_id, 0);
  }
  if (direction === 'descendants' || direction === 'both') {
    root.descendants = getDescendants(person_id, 0);
  }

  return { tree: root };
}
