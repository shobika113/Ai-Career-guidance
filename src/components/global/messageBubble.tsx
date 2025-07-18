import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Clipboard, Download } from "lucide-react";
import { useState } from "react";

export function MessageBubble({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "response.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn("px-4 py-5 rounded-lg", {
        "ml-auto bg-primary text-primary-foreground max-w-xl": role === "user",
        "mr-auto bg-transparent max-w-xl": role === "assistant",
      })}
    >
      <ReactMarkdown>{content}</ReactMarkdown>

      {role === "assistant" &&
        content !==
          "Hi! I'm Career Sense, your career guidance counselor. How can I help you today?" && (
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Clipboard className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download .pdf
            </Button>
          </div>
        )}
    </div>
  );
}
