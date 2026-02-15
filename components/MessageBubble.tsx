export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-r from-pink via-coral to-gold text-white'
            : 'bg-white border border-text-300/20 text-text-800 shadow-sm'
        }`}
      >
        {!isUser && (
          <div className="text-xs font-semibold text-coral mb-1 font-body">
            MyVansh.AI
          </div>
        )}
        <div className="whitespace-pre-wrap font-body text-sm leading-relaxed">
          {message.content}
        </div>
        <div
          className={`text-[10px] mt-1 ${
            isUser ? 'text-white/60' : 'text-text-400'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
