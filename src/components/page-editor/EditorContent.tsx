import React from "react";
import { BlockNoteViewRaw as BlockNoteView } from "@blocknote/react";
import type { BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/style.css";
import "@blocknote/react/style.css";

interface EditorContentProps {
	editor: BlockNoteEditor;
	theme: "light" | "dark";
	onContentChange: () => void;
}

const EditorContent: React.FC<EditorContentProps> = ({
	editor,
	theme,
	onContentChange,
}) => {
	return (
		<main className="flex-1 overflow-y-auto p-4 md:p-6">
			<div className="container mx-auto">
				<BlockNoteView
					editor={editor}
					theme={theme}
					onChange={onContentChange}
				/>
			</div>
		</main>
	);
};

export default EditorContent;
