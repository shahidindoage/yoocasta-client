import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';

const Btn = ({ onClick, active, label, title }: { onClick: () => void; active?: boolean; label: string; title?: string }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
      active ? 'bg-[#3835A4] text-white' : 'text-[#3835A4] hover:bg-[#3835A4]/10'
    }`}
  >
    {label}
  </button>
);

const Sep = () => <div className="w-px h-6 bg-[#3835A4]/10 mx-0.5 self-center" />;

const HtmlEditor = ({ value, onChange }: { value: string; onChange: (html: string) => void }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      LinkExtension.configure({ openOnClick: false }),
      UnderlineExtension,
      TextAlignExtension.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="border border-[#3835A4]/10 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-0.5 bg-[#3835A4]/5 border-b border-[#3835A4]/10 p-1.5">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="B" title="Bold" />
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="I" title="Italic" />
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} label="U" title="Underline" />
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} label="S" title="Strikethrough" />
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} label="H1" />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} label="H2" />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} label="H3" />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editor.isActive('heading', { level: 4 })} label="H4" />
        <Btn onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} label="P" title="Paragraph" />
        <Sep />
        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} label="◀" title="Align Left" />
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} label="▶" title="Align Center" />
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} label="▶" title="Align Right" />
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} label="UL" title="Bullet List" />
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} label="OL" title="Ordered List" />
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} label="❝" title="Blockquote" />
        <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} label="<>" title="Code Block" />
        <Sep />
        <Btn onClick={addLink} active={editor.isActive('link')} label="🔗" title="Link" />
        <Sep />
        <Btn onClick={() => editor.chain().focus().undo().run()} label="↩" title="Undo" />
        <Btn onClick={() => editor.chain().focus().redo().run()} label="↪" title="Redo" />
      </div>
      <EditorContent editor={editor} className="w-full min-h-[160px] p-4 text-sm outline-none resize-y overflow-auto leading-relaxed [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[160px]" />
    </div>
  );
};

export default HtmlEditor;
