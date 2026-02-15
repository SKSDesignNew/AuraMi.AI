'use client';

import { useState, useEffect, useCallback } from 'react';

interface Person {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  sex: string | null;
  birth_year: number | null;
  death_date: string | null;
}

interface Relationship {
  id: string;
  from_person_id: string;
  to_person_id: string;
  relation_type: string;
  relation_label: string | null;
}

interface TreeNode {
  person: Person;
  children: TreeNode[];
  spouse?: Person;
}

interface FamilyTreePageProps {
  householdId: string;
}

export default function FamilyTreePage({ householdId }: FamilyTreePageProps) {
  const [persons, setPersons] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const [rootId, setRootId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [householdId]);

  async function loadData() {
    setLoading(true);
    try {
      const [personsRes, relsRes] = await Promise.all([
        fetch(`/api/data?type=persons&householdId=${householdId}`),
        fetch(`/api/data?type=relationships&householdId=${householdId}`),
      ]);
      const personsJson = await personsRes.json();
      const relsJson = await relsRes.json();

      const p = personsJson.data || [];
      const r = relsJson.data || [];
      setPersons(p);
      setRelationships(r);

      if (p.length > 0 && !rootId) {
        setRootId(p[0].id);
      }
    } catch {
      setPersons([]);
      setRelationships([]);
    }
    setLoading(false);
  }

  const buildTree = useCallback(
    (personId: string, visited = new Set<string>()): TreeNode | null => {
      if (visited.has(personId)) return null;
      visited.add(personId);

      const person = persons.find((p) => p.id === personId);
      if (!person) return null;

      const spouseRel = relationships.find(
        (r) =>
          r.relation_type === 'spouse' &&
          (r.from_person_id === personId || r.to_person_id === personId)
      );
      const spouseId = spouseRel
        ? spouseRel.from_person_id === personId
          ? spouseRel.to_person_id
          : spouseRel.from_person_id
        : null;
      const spouse = spouseId ? persons.find((p) => p.id === spouseId) : undefined;

      const childRels = relationships.filter(
        (r) => r.relation_type === 'parent' && r.from_person_id === personId
      );
      const children = childRels
        .map((r) => buildTree(r.to_person_id, visited))
        .filter((n): n is TreeNode => n !== null);

      return { person, children, spouse: spouse || undefined };
    },
    [persons, relationships]
  );

  const tree = rootId ? buildTree(rootId) : null;

  const filteredPersons = search.trim()
    ? persons.filter(
        (p) =>
          `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
          (p.nickname && p.nickname.toLowerCase().includes(search.toLowerCase()))
      )
    : persons;

  function PersonCard({ person, isSpouse }: { person: Person; isSpouse?: boolean }) {
    const isDeceased = !!person.death_date;
    return (
      <div
        className={`px-3 py-2 rounded-lg border text-center min-w-[100px] cursor-pointer transition-all hover:shadow-md ${
          isSpouse
            ? 'bg-[rgba(240,147,251,0.04)] border-pink/20'
            : 'bg-card border-[rgba(0,245,255,0.1)] hover:border-[rgba(0,245,255,0.25)]'
        }`}
        onClick={() => setRootId(person.id)}
      >
        <p className={`text-xs font-body font-semibold ${isDeceased ? 'text-text-500' : 'text-text-800'}`}>
          {person.first_name} {person.last_name[0]}.
        </p>
        {person.birth_year && (
          <p className="text-[10px] font-body text-text-400">
            b. {person.birth_year}{isDeceased ? ' *' : ''}
          </p>
        )}
      </div>
    );
  }

  function TreeNodeView({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <PersonCard person={node.person} />
          {node.spouse && (
            <>
              <span className="text-text-300 text-xs">&mdash;</span>
              <PersonCard person={node.spouse} isSpouse />
            </>
          )}
        </div>

        {node.children.length > 0 && (
          <>
            <div className="w-px h-5 bg-[rgba(0,245,255,0.15)]" />
            {node.children.length > 1 && (
              <div
                className="h-px bg-[rgba(0,245,255,0.15)]"
                style={{
                  width: `${Math.min(node.children.length * 140, 600)}px`,
                }}
              />
            )}
            <div className="flex gap-6 pt-1">
              {node.children.map((child) => (
                <div key={child.person.id} className="flex flex-col items-center">
                  <div className="w-px h-4 bg-[rgba(0,245,255,0.15)]" />
                  <TreeNodeView node={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-400 font-body">Loading family tree...</p>
      </div>
    );
  }

  if (persons.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">{'\uD83C\uDF33'}</div>
          <h2 className="font-display text-2xl font-bold text-text-800 mb-2">No Family Members Yet</h2>
          <p className="text-text-500 font-body mb-4">
            Start by adding family members through the chat. Try saying:
            &quot;Add my grandfather Ramesh Kumar, born 1935 in Allahabad.&quot;
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-[rgba(0,245,255,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-900">Family Tree</h2>
            <p className="font-body text-text-500 text-sm">{persons.length} people in your tree</p>
          </div>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full max-w-sm px-4 py-2 rounded-xl border border-[rgba(0,245,255,0.1)] bg-bg text-text-800 placeholder:text-text-400 focus:outline-none focus:ring-2 focus:ring-pink/30 font-body text-sm"
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-56 border-r border-[rgba(0,245,255,0.08)] overflow-y-auto py-3 px-3 space-y-1">
          {filteredPersons.map((p) => (
            <button
              key={p.id}
              onClick={() => setRootId(p.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body transition-colors ${
                rootId === p.id
                  ? 'bg-[rgba(0,245,255,0.08)] text-pink font-semibold'
                  : 'text-text-600 hover:bg-bg-alt'
              }`}
            >
              {p.first_name} {p.last_name}
              {p.birth_year && (
                <span className="text-text-400 text-xs ml-1">({p.birth_year})</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-8">
          {tree ? (
            <div className="flex justify-center">
              <TreeNodeView node={tree} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-400 font-body">
              Select a person to view their tree
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
