'use client';

interface SidebarProps {
  active: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'chat', label: 'Chat', icon: '💬' },
  { id: 'tree', label: 'Family Tree', icon: '🌳' },
  { id: 'timeline', label: 'Timeline', icon: '📅' },
  { id: 'members', label: 'Members', icon: '👥' },
  { id: 'events', label: 'Events', icon: '🎉' },
  { id: 'photos', label: 'Photos & Docs', icon: '📷' },
  { id: 'stories', label: 'Stories', icon: '📖' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="w-[260px] h-full bg-white border-r border-text-300/20 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-text-300/20">
        <h1 className="font-display text-xl font-bold">
          <span className="bg-gradient-to-r from-pink via-coral to-gold bg-clip-text text-transparent">
            MyVansh.AI
          </span>
        </h1>
        <p className="text-text-500 text-xs mt-0.5 font-body">
          Every Family Has a Story
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
                ? 'bg-coral/10 text-coral font-semibold'
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
