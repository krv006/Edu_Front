import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/app/providers";
import { ChatHeader } from "@/components/chat/chat-header";
import { MessageComposer } from "@/components/chat/message-composer";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/modules/message";
import { StudentGroupWorkspace } from "@/modules/student";

export function StudentConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.id ?? "student-1";
  const { conversation, messages, sendMessage, retryMessage, updateMessage, deleteMessage, toggleReaction, sendTyping } = useChat(conversationId, { role: "student", senderId: currentUserId });
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  if (!conversation.isLoading && !conversation.data) return <Navigate to="/student/chats" replace />;
  if (conversation.isLoading) return <div className="chat-page"><div className="chat-header-skeleton" /><div className="message-loading"><div className="message-skeleton" /><div className="message-skeleton right" /><div className="message-skeleton" /></div></div>;
  if (conversation.data.type === "group") return <StudentGroupWorkspace conversation={conversation.data} messages={messages} sendMessage={sendMessage} retryMessage={retryMessage} updateMessage={updateMessage} deleteMessage={deleteMessage} toggleReaction={toggleReaction} sendTyping={sendTyping} currentUserId={currentUserId} />;

  async function handleSend(payload) {
    try {
      if (editingMessage) { await updateMessage.mutateAsync({ messageId: editingMessage.id, text: payload.text }); setEditingMessage(null); toast.success("Xabar tahrirlandi"); return; }
      await sendMessage.mutateAsync({ ...payload, replyTo: replyMessage ? { author: replyMessage.senderId === currentUserId ? "Siz" : conversation.data.title, text: replyMessage.text } : undefined });
      setReplyMessage(null);
    } catch { toast.error("Xabar amalini bajarib bo‘lmadi"); }
  }

  async function handleDelete(message, scope) {
    try { await deleteMessage.mutateAsync({ messageId: message.id, scope }); toast.success("Xabar o‘chirildi"); }
    catch { toast.error("Xabarni o‘chirib bo‘lmadi"); }
  }

  return <section className="chat-page"><ChatHeader conversation={conversation.data} backTo="/student/chats" /><MessageList messages={messages.data} conversation={conversation.data} loading={messages.isLoading} error={messages.isError} onRetry={messages.refetch} onRetryMessage={retryMessage} currentUserId={currentUserId} onReply={(message) => { setEditingMessage(null); setReplyMessage(message); }} onEdit={(message) => { setReplyMessage(null); setEditingMessage(message); }} onDelete={handleDelete} onReact={(message, emoji) => toggleReaction.mutate({ messageId: message.id, emoji })} capabilities={{ reply: true, edit: false, delete: false, react: false }} /><MessageComposer key={editingMessage?.id ?? "student-direct-compose"} onSend={handleSend} onTyping={sendTyping} sending={sendMessage.isPending || updateMessage.isPending} replyTo={replyMessage} editingMessage={editingMessage} currentUserId={currentUserId} onCancelContext={() => { setReplyMessage(null); setEditingMessage(null); }} /></section>;
}
