import { createFileRoute } from "@tanstack/react-router";
import { Editor } from "@/features/editor/components/editor";

export const Route = createFileRoute("/_memos/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-8">
      <Editor />
    </div>
  );
}
