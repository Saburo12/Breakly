import { Message } from '../types';

interface ConversationThreadProps {
  messages: Message[];
}

/**
 * ConversationThread Component
 * Displays conversation history between user and AI
 */
export function ConversationThread({ messages }: ConversationThreadProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img src="/cropped_circle_image.png" alt="Breakly" className="w-full h-full object-cover" />
            </div>
          )}

          <div
            className={`${message.role === 'user' ? 'max-w-full' : 'max-w-[80%]'} rounded-xl p-3 ${
              message.role === 'user'
                ? 'bg-[#1a1a1a] border border-[#333] text-slate-100'
                : 'bg-[#1a1a1a] border border-[#333] text-slate-100'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            {message.files && message.files.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-600/30">
                <p className="text-xs text-slate-400 mb-1">Generated {message.files.length} files</p>
                <div className="flex flex-wrap gap-1">
                  {message.files.slice(0, 3).map((file, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300"
                    >
                      {file.name}
                    </span>
                  ))}
                  {message.files.length > 3 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                      +{message.files.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-2">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
