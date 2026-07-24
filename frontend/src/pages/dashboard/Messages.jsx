import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Send } from 'lucide-react';
import Card from '../../components/ui/Card';
import { useConversations, useMessages, useSendMessage } from '../../features/chat/useChat';
import { useConversationRoom, useTypingIndicator } from '../../features/realtime/useRealtimeConnection';

function timeLabel(dateStr) {
  const date = new Date(dateStr);
  const isToday = date.toDateString() === new Date().toDateString();
  return isToday
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ConversationList({ conversations, isLoading, activeId, onSelect }) {
  if (isLoading) return <p className="p-4 text-sm text-graphite-dark">Loading...</p>;
  if (!conversations || conversations.length === 0) {
    return <p className="p-4 text-sm text-graphite-dark">No conversations yet.</p>;
  }

  return (
    <div className="divide-y divide-ink-line overflow-y-auto">
      {conversations.map((conv) => {
        const other = conv.otherParticipants?.[0];
        return (
          <button
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
              activeId === conv._id ? 'bg-signal/10' : 'hover:bg-white/5'
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-signal-soft text-sm font-medium text-signal">
              {other?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-paper">{other?.name || 'Unknown'}</p>
                {conv.lastMessageAt && (
                  <span className="shrink-0 text-xs text-graphite-dark">{timeLabel(conv.lastMessageAt)}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {conv.isUnread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />}
                <p className="truncate text-xs text-graphite-dark">
                  {conv.lastMessage?.content || (conv.gig ? `About: ${conv.gig.title}` : 'Say hello')}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatWindow({ conversationId, conversation }) {
  const { user } = useSelector((state) => state.auth);
  const { data: messages, isLoading } = useMessages(conversationId);
  const sendMessage = useSendMessage(conversationId);
  const { othersTyping, setTyping } = useTypingIndicator(conversationId, user?._id);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useConversationRoom(conversationId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, othersTyping]);

  const handleChange = (e) => {
    setDraft(e.target.value);
    setTyping(true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTyping(false), 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage.mutate(draft.trim());
    setDraft('');
    setTyping(false);
    clearTimeout(typingTimeout.current);
  };

  const other = conversation?.otherParticipants?.[0];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-ink-line px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-soft text-xs font-medium text-signal">
          {other?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <p className="text-sm font-medium text-paper">{other?.name || 'Conversation'}</p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {isLoading && <p className="text-sm text-graphite-dark">Loading messages...</p>}
        {messages?.map((msg) => {
          const isMine = msg.sender?._id === user?._id;
          return (
            <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMine ? 'bg-signal text-white' : 'bg-ink-raised text-paper'
                }`}
              >
                {msg.content}
                <p className={`mt-1 text-[10px] ${isMine ? 'text-white/70' : 'text-graphite-dark'}`}>
                  {timeLabel(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        {othersTyping && <p className="text-xs italic text-graphite-dark">Typing...</p>}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-ink-line p-4">
        <input
          value={draft}
          onChange={handleChange}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-ink-line bg-ink px-4 py-2.5 text-sm text-paper placeholder:text-graphite-dark focus:border-signal focus:outline-none focus:ring-1 focus:ring-signal"
        />
        <button
          type="submit"
          disabled={!draft.trim() || sendMessage.isPending}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal text-white transition-colors hover:bg-signal-hover disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function Messages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: conversations, isLoading, isError } = useConversations();
  const activeId = searchParams.get('conversation');

  useEffect(() => {
    if (!activeId && conversations?.length > 0) {
      setSearchParams({ conversation: conversations[0]._id }, { replace: true });
    }
  }, [activeId, conversations, setSearchParams]);

  const activeConversation = conversations?.find((c) => c._id === activeId);

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col">
      <h1 className="font-display text-2xl font-medium text-paper">Messages</h1>

      {isError && (
        <Card dark className="mt-6 p-6">
          <p className="text-sm text-graphite-dark">
            Couldn&apos;t load your conversations — this needs a connected database and Socket.IO running,
            both covered in the README.
          </p>
        </Card>
      )}

      {!isError && (
        <Card dark className="mt-6 flex flex-1 overflow-hidden p-0">
          <div className="w-72 shrink-0 border-r border-ink-line">
            <ConversationList
              conversations={conversations}
              isLoading={isLoading}
              activeId={activeId}
              onSelect={(id) => setSearchParams({ conversation: id })}
            />
          </div>
          <div className="flex-1">
            {activeId ? (
              <ChatWindow conversationId={activeId} conversation={activeConversation} />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-graphite-dark">
                  {isLoading ? 'Loading...' : 'Select a conversation to start chatting.'}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

export default Messages;
