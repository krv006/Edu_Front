import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ChatHeader } from "../../components/chat/chat-header";
import { MessageList } from "../../components/chat/message-list";
import { MessageComposer } from "../../components/chat/message-composer";
import { GroupWorkspace } from "../../components/groups/group-workspace";
import { useChat } from "@/modules/message";

export function ConversationPage() {
  const { conversationId } = useParams();
  const {
    conversation,
    messages,
    sendMessage,
    retryMessage,
    updateMessage,
    deleteMessage,
    toggleReaction,
    sendTyping,
  } = useChat(conversationId);
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  if (!conversation.isLoading && !conversation.data)
    return <Navigate to="/teacher/chats" replace />;

  if (conversation.isLoading)
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

  if (conversation.data.type === "group") {
    return (
      <GroupWorkspace
        conversation={conversation.data}
        messages={messages}
        sendMessage={sendMessage}
        updateMessage={updateMessage}
        deleteMessage={deleteMessage}
        toggleReaction={toggleReaction}
        sendTyping={sendTyping}
        retryMessage={retryMessage}
      />
    );
  }

  async function handleSend(payload) {
    try {
      if (editingMessage) {
        await updateMessage.mutateAsync({
          messageId: editingMessage.id,
          text: payload.text,
        });
        setEditingMessage(null);
        toast.success("Xabar tahrirlandi");
        return;
      }
      await sendMessage.mutateAsync({
        ...payload,
        replyTo: replyMessage
          ? {
              author:
                replyMessage.senderName ||
                (replyMessage.senderId === "teacher-1"
                  ? "Siz"
                  : conversation.data.title),
              text: replyMessage.text,
            }
          : undefined,
      });
      setReplyMessage(null);
    } catch {
      toast.error("Xabar amalini bajarib bo‘lmadi. Qayta urinib ko‘ring.");
    }
  }

  async function handleDelete(message, scope) {
    try {
      await deleteMessage.mutateAsync({ messageId: message.id, scope });
      if (replyMessage?.id === message.id) setReplyMessage(null);
      if (editingMessage?.id === message.id) setEditingMessage(null);
      toast.success(
        scope === "everyone"
          ? "Xabar hamma uchun o‘chirildi"
          : "Xabar siz uchun o‘chirildi"
      );
    } catch {
      toast.error("Xabarni o‘chirib bo‘lmadi");
    }
  }

  return (
    <section className="chat-page">
      <ChatHeader conversation={conversation.data} />
      <MessageList
        messages={messages.data}
        conversation={conversation.data}
        loading={messages.isLoading}
        error={messages.isError}
        onRetry={messages.refetch}
        onReply={(message) => {
          setEditingMessage(null);
          setReplyMessage(message);
        }}
        onEdit={(message) => {
          setReplyMessage(null);
          setEditingMessage(message);
        }}
        onDelete={handleDelete}
        onReact={(message, emoji) =>
          toggleReaction.mutate({ messageId: message.id, emoji })
        }
        capabilities={{ reply: true, edit: false, delete: false, react: false }}
        onRetryMessage={retryMessage}
      />
      <MessageComposer
        key={editingMessage?.id ?? "compose"}
        onSend={handleSend}
        sending={sendMessage.isPending || updateMessage.isPending}
        replyTo={replyMessage}
        editingMessage={editingMessage}
        onCancelContext={() => {
          setReplyMessage(null);
          setEditingMessage(null);
        }}
        onTyping={sendTyping}
      />
    </section>
  );
}
