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
            ? 'bg-[rgba(0,245,255,0.06)] border border-[rgba(0,245,255,0.1)] text-text-800'
            : 'bg-bg-alt border border-[rgba(0,245,255,0.06)] text-text-700 shadow-sm'
        }`}
      >
        {!isUser && (
          <div className="text-xs font-semibold text-pink mb-1 font-body">
            AuraMi.AI
          </div>
        )}
        <div className="whitespace-pre-wrap font-body text-sm leading-relaxed">
          {message.content}
        </div>
        <div
          className={`text-[10px] mt-1 ${
            isUser ? 'text-text-400' : 'text-text-400'
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
