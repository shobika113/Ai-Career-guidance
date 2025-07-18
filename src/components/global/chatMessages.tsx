import { MessageBubble } from "./messageBubble";

type Props = {
  messages: { role: "user" | "assistant"; content: string }[];
};

export function ChatMessages({ messages }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg, idx) => (
        <MessageBubble key={idx} role={msg.role} content={msg.content} />
      ))}
    </div>
  );
}
