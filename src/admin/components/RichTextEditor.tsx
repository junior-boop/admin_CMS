import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface Props {
  name: string
  initialValue?: string
  placeholder?: string
}

function Btn({ onClick, active, title, children }: {
  onClick: (e: React.MouseEvent) => void
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} className={`tb-btn ${active ? 'active' : ''}`} title={title}>
      {children}
    </button>
  )
}

export default function RichTextEditor({ name, initialValue = '', placeholder = 'Commencez à écrire…' }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: initialValue,
    editorProps: {
      attributes: { class: 'prose-content' },
    },
  })

  const html = editor ? editor.getHTML() : initialValue

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <div className="tb-group">
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run() }} active={editor?.isActive('bold')} title="Gras">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run() }} active={editor?.isActive('italic')} title="Italique">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleStrike().run() }} active={editor?.isActive('strike')} title="Barré">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4C9.5 4 8 6 8 8C8 10 10 12 12 12"/><path d="M8 18C8 18 9.5 20 12 20C14.5 20 16 18 16 16C16 14 14 12 12 12"/></svg>
          </Btn>
        </div>

        <div className="tb-sep" />

        <div className="tb-group">
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 1 }).run() }} active={editor?.isActive('heading', { level: 1 })} title="Titre 1">
            <span className="tb-text">H1</span>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 2 }).run() }} active={editor?.isActive('heading', { level: 2 })} title="Titre 2">
            <span className="tb-text">H2</span>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 3 }).run() }} active={editor?.isActive('heading', { level: 3 })} title="Titre 3">
            <span className="tb-text">H3</span>
          </Btn>
        </div>

        <div className="tb-sep" />

        <div className="tb-group">
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleBulletList().run() }} active={editor?.isActive('bulletList')} title="Liste à puces">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleOrderedList().run() }} active={editor?.isActive('orderedList')} title="Liste numérotée">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="9" fill="currentColor" fontWeight="bold">1</text><text x="2" y="14" fontSize="9" fill="currentColor" fontWeight="bold">2</text><text x="2" y="20" fontSize="9" fill="currentColor" fontWeight="bold">3</text></svg>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleBlockquote().run() }} active={editor?.isActive('blockquote')} title="Citation">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 17h3l2-4V7H5v6h3l-2 4z"/><path d="M14 17h3l2-4V7h-6v6h3l-2 4z"/></svg>
          </Btn>
        </div>

        <div className="tb-sep" />

        <div className="tb-group">
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleCode().run() }} active={editor?.isActive('code')} title="Code inline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleCodeBlock().run() }} active={editor?.isActive('codeBlock')} title="Bloc de code">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 9 6 12 9 15"/><polyline points="15 9 18 12 15 15"/></svg>
          </Btn>
        </div>

        <div className="tb-sep" />

        <div className="tb-group">
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().undo().run() }} title="Annuler">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-2.12 0-4.07-.74-5.6-1.97"/></svg>
          </Btn>
          <Btn onClick={(e) => { e.preventDefault(); editor?.chain().focus().redo().run() }} title="Rétablir">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M21 13c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.12 0 4.07-.74 5.6-1.97"/></svg>
          </Btn>
        </div>
      </div>

      <div className="rte-body">
        <EditorContent editor={editor} />
      </div>

      {/* Champ caché pour la soumission du formulaire */}
      <input type="hidden" name={name} value={html} />

      <style>{`
        .rte {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--surface);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rte:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light, rgb(99 102 241 / 0.15));
        }
        .rte-toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: var(--surface-elevated);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .tb-group { display: flex; gap: 2px; }
        .tb-sep { width: 1px; height: 20px; background: var(--border); margin: 0 4px; flex-shrink: 0; }
        .tb-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .tb-btn:hover { background: var(--border); color: var(--text); }
        .tb-btn.active { background: var(--primary-light, #dbeafe); color: var(--primary); }
        .tb-text { font-size: 11px; font-weight: 700; }
        .rte-body { padding: 14px 16px; min-height: 180px; cursor: text; }
        .rte-body .ProseMirror { outline: none; min-height: 150px; font-size: 14px; line-height: 1.7; }
        .rte-body .ProseMirror > * + * { margin-top: 0.6em; }
        .rte-body .ProseMirror p { margin: 0; }
        .rte-body .ProseMirror h1 { font-size: 22px; font-weight: 700; }
        .rte-body .ProseMirror h2 { font-size: 18px; font-weight: 600; }
        .rte-body .ProseMirror h3 { font-size: 16px; font-weight: 600; }
        .rte-body .ProseMirror ul, .rte-body .ProseMirror ol { padding-left: 20px; }
        .rte-body .ProseMirror li { margin: 2px 0; }
        .rte-body .ProseMirror blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 14px;
          color: var(--text-muted);
          font-style: italic;
        }
        .rte-body .ProseMirror code {
          background: var(--surface-elevated);
          padding: 1px 5px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        .rte-body .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          overflow-x: auto;
          font-family: monospace;
          font-size: 13px;
        }
        .rte-body .ProseMirror pre code { background: transparent; padding: 0; color: inherit; }
        .rte-body .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: var(--text-light);
          pointer-events: none;
          float: left;
          height: 0;
        }
      `}</style>
    </div>
  )
}
