import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/modules/auth";
import { ChatHeader } from "@/modules/conversation";
import { MessageComposer, MessageList, useChat } from "@/modules/message";
import type { ChatMessage, SendMessagePayload } from "@/shared/types";
import { StudentGroupWorkspace } from "@/widgets/student-group-workspace";

export function StudentConversationPage() {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const {
    conversation,
    messages,
    sendMessage,
    retryMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    sendTyping,
  } = useChat(conversationId, { role: "student", senderId: currentUserId });
  const [replyMessage, setReplyMessage] = useState<ChatMessage | null>(null);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);

  const activeConversation = conversation.data;

  if (!conversation.isLoading && !activeConversation)
    return <Navigate to="/student/chats" replace />;

  if (conversation.isLoading || !activeConversation)
    return (
      <div className="chat-page">
        <div className="chat-header-skeleton" />
        <div className="message-loading">
          <div className="message-skeleton" />
          <div className="message-skeleton right" />
          <div className="message-skeleton" />
        </div>
      </div>
    );

  if (activeConversation.type === "group")
    return (
      <StudentGroupWorkspace
        conversation={activeConversation}
        messages={messages}
        sendMessage={sendMessage}
        retryMessage={retryMessage}
        sendTyping={sendTyping}
        currentUserId={currentUserId ?? undefined}
      />
    );

  async function handleSend(payload: SendMessagePayload) {
    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({ messageId: editingMessage.id, text: payload.text });
        setEditingMessage(null);
        toast.success("Xabar tahrirlandi");
        return;
      }
      await sendMessage.mutateAsync({
        ...payload,
        replyTo: replyMessage
          ? {
              author: replyMessage.senderId === currentUserId ? "Siz" : activeConversation!.title,
              text: replyMessage.text,
            }
          : undefined,
      });
      setReplyMessage(null);
    } catch {
      toast.error("Xabar amalini bajarib bo‘lmadi");
    }
  }

  async function handleDelete(message: ChatMessage, scope: "me" | "everyone") {
    try {
      await deleteMessage.mutateAsync({ messageId: message.id, scope });
      toast.success("Xabar o‘chirildi");
    } catch {
      toast.error("Xabarni o‘chirib bo‘lmadi");
    }
  }

  return (
    <section className="chat-page">
      <ChatHeader conversation={activeConversation} backTo="/student/chats" />
      <MessageList
        messages={messages.data}
        conversation={activeConversation}
        loading={messages.isLoading}
        error={messages.isError}
        onRetry={messages.refetch}
        onRetryMessage={retryMessage}
        currentUserId={currentUserId}
        onReply={(message) => {
          setEditingMessage(null);
          setReplyMessage(message);
        }}
        onEdit={(message) => {
          setReplyMessage(null);
          setEditingMessage(message);
        }}
        onDelete={handleDelete}
        onReact={(message, emoji) => toggleReaction.mutate({ messageId: message.id, emoji })}
        capabilities={{ reply: true, edit: false, delete: false, react: false }}
      />
      <MessageComposer
        key={editingMessage?.id ?? "student-direct-compose"}
        onSend={handleSend}
        onTyping={sendTyping}
        sending={sendMessage.isPending || updateMessage.isPending}
        replyTo={replyMessage}
        editingMessage={editingMessage}
        currentUserId={currentUserId}
        onCancelContext={() => {
          setReplyMessage(null);
          setEditingMessage(null);
        }}
      />
    </section>
  );
}
