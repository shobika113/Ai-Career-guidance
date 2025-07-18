import { UserButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function ChatHeader() {
  return (
    <div className="border-b px-4 py-3 flex items-center justify-between">
      <h1 className="font-semibold text-lg">Career Sense</h1>
      <div className="flex items-center gap-3">
        <SignOutButton>
          <Button variant="outline" size="sm">
            Logout
          </Button>
        </SignOutButton>
        <UserButton />
      </div>
    </div>
  );
}
