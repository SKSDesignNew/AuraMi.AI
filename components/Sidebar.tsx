'use client';

interface SidebarProps {
  active: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'chat', label: 'Chat', icon: '\uD83D\uDCAC' },
  { id: 'tree', label: 'Family Tree', icon: '\uD83C\uDF33' },
  { id: 'timeline', label: 'Timeline', icon: '\uD83D\uDCC5' },
  { id: 'members', label: 'Members', icon: '\uD83D\uDC65' },
  { id: 'events', label: 'Events', icon: '\uD83C\uDF89' },
  { id: 'photos', label: 'Photos & Docs', icon: '\uD83D\uDCF7' },
  { id: 'stories', label: 'Stories', icon: '\uD83D\uDCD6' },
  { id: 'settings', label: 'Settings', icon: '\u2699\uFE0F' },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[256px] h-full bg-card border-r border-[rgba(0,245,255,0.08)] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[rgba(0,245,255,0.08)]">
        <h1 className="font-display text-xl font-extrabold">
          <span className="brand-aura">Aura</span>
          <span className="gradient-text font-extrabold">Mi</span>
          <span className="gradient-text font-medium">.AI</span>
        </h1>
        <p className="text-text-500 text-xs mt-0.5 font-body">
          Your Family&apos;s Essence, Preserved
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-colors ${
              active === item.id
                ? 'bg-[rgba(0,245,255,0.08)] text-pink font-semibold'
                : 'text-text-600 hover:bg-bg-alt'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
