"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import { EditorToolbar } from "./editor-toolbar";
import { useEffect, useState } from "react";
import { supabase } from "../../backend/supabaseClient";
import { Input } from "../components/ui/input"; // Added missing import
import { Button } from "../components/ui/button"; // Added missing import

export function Editor({ pageId = "default" }) {
  const [docName, setDocName] = useState("Untitled Document");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({
        levels: [1, 2, 3],
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base max-w-full focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save or mark as unsaved. For now, we leave it for manual saving.
    },
  });

  const saveDocument = async () => {
    const content = editor.getHTML();
    const { error } = await supabase
      .from("api.documents")
      .upsert({ id: pageId, name: docName, content });
    if (error) console.error("Save document error:", error);
    else alert("Document saved!");
    // Optionally notify Sidebar about title change via API.
  };

  useEffect(() => {
    if (editor) {
      window.editor = editor; // Make editor globally available
    }
  }, [editor]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header with renamable title and Save button */}
      <div className="flex items-center justify-between p-2 border-b">
        <Input
          value={docName}
          onChange={(e) => setDocName(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={saveDocument}>Save</Button>
      </div>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="min-h-[200px]" />
    </div>
  );
}
