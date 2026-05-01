import { useState, useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'

interface RichTextEditorProps {
  name: string
  initialValue?: string
  placeholder?: string
}

function ToolbarButton({ onClick, isActive, children, title }: { 
  onClick: (e: React.MouseEvent) => void
  isActive?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button type="button" onClick={onClick} className={`toolbar-btn ${isActive ? 'active' : ''}`} title={title}>
      {children}
    </button>
  )
}

export default function RichTextEditor({ name, initialValue = '', placeholder = 'Commencez à écrire...' }: RichTextEditorProps) {
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<Editor | null>(null)

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return

    const hiddenInput = document.querySelector<HTMLInputElement>(`input[name="${name}"]`)
    
    const editor = new Editor({
      element: containerRef.current,
      extensions: [
        StarterKit,
        Placeholder.configure({ placeholder }),
      ],
      content: initialValue,
      onUpdate: () => {
        if (hiddenInput) {
          hiddenInput.value = editor.getHTML()
        }
      },
    })

    editorRef.current = editor

    if (hiddenInput) {
      hiddenInput.value = editor.getHTML()
    }

    return () => {
      editor.destroy()
      editorRef.current = null
    }
  }, [name])

  const editor = editorRef.current

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run() }}
            isActive={editor?.isActive('bold')}
            title="Gras"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run() }}
            isActive={editor?.isActive('italic')}
            title="Italique"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleStrike().run() }}
            isActive={editor?.isActive('strike')}
            title="Barré"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4C9.5 4 8 6 8 8C8 10 10 12 12 12"/><path d="M8 18C8 18 9.5 20 12 20C14.5 20 16 18 16 16C16 14 14 12 12 12"/></svg>
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 1 }).run() }}
            isActive={editor?.isActive('heading', { level: 1 })}
            title="Titre 1"
          ><span className="text-btn">H1</span></ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 2 }).run() }}
            isActive={editor?.isActive('heading', { level: 2 })}
            title="Titre 2"
          ><span className="text-btn">H2</span></ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleHeading({ level: 3 }).run() }}
            isActive={editor?.isActive('heading', { level: 3 })}
            title="Titre 3"
          ><span className="text-btn">H3</span></ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleBulletList().run() }}
            isActive={editor?.isActive('bulletList')}
            title="Liste à puces"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor"/><circle cx="4" cy="12" r="1.5" fill="currentColor"/><circle cx="4" cy="18" r="1.5" fill="currentColor"/></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleOrderedList().run() }}
            isActive={editor?.isActive('orderedList')}
            title="Liste numérotée"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="3" y="8" fontSize="8" fill="currentColor" fontWeight="bold">1</text><text x="3" y="14" fontSize="8" fill="currentColor" fontWeight="bold">2</text><text x="3" y="20" fontSize="8" fill="currentColor" fontWeight="bold">3</text></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleBlockquote().run() }}
            isActive={editor?.isActive('blockquote')}
            title="Citation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 17h3l2-4V7H5v6h3l-2 4z"/><path d="M14 17h3l2-4V7h-6v6h3l-2 4z"/></svg>
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleCode().run() }}
            isActive={editor?.isActive('code')}
            title="Code inline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().toggleCodeBlock().run() }}
            isActive={editor?.isActive('codeBlock')}
            title="Bloc de code"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 9 6 12 9 15"/><polyline points="15 9 18 12 15 15"/></svg>
          </ToolbarButton>
        </div>

        <div className="toolbar-separator" />

        <div className="toolbar-group">
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().undo().run() }}
            title="Annuler"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M3 13c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-2.12 0-4.07-.74-5.6-1.97"/></svg>
          </ToolbarButton>
          <ToolbarButton
            onClick={(e) => { e.preventDefault(); editor?.chain().focus().redo().run() }}
            title="Rétablir"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M21 13c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.12 0 4.07-.74 5.6-1.97"/></svg>
          </ToolbarButton>
        </div>
      </div>

      <input type="hidden" name={name} defaultValue={initialValue} />

      <div 
        className={`editor-content ${isFocused ? 'focused' : ''}`}
        onClick={() => editor?.commands.focus()}
      >
        <div className="editor-target" data-name={name} />
      </div>

      <style>{`
        .rich-text-editor {
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
          background: var(--surface);
          transition: all 0.2s ease;
        }
        .rich-text-editor:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-light);
        }
        .editor-toolbar {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: var(--surface-elevated);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .toolbar-group { display: flex; gap: 2px; }
        .toolbar-separator { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }
        .toolbar-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 6px;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .toolbar-btn:hover { background: var(--border); color: var(--text); }
        .toolbar-btn.active { background: var(--primary-light); color: var(--primary); }
        .toolbar-btn .text-btn { font-size: 12px; font-weight: 700; }
        .editor-content { padding: 16px; min-height: 200px; cursor: text; }
        .editor-content .ProseMirror {
          outline: none;
          min-height: 168px;
        }
        .editor-content .ProseMirror p { margin: 0 0 8px; }
        .editor-content .ProseMirror p:last-child { margin-bottom: 0; }
        .editor-content .ProseMirror h1 { font-size: 24px; font-weight: 700; margin: 16px 0 8px; }
        .editor-content .ProseMirror h2 { font-size: 20px; font-weight: 600; margin: 14px 0 6px; }
        .editor-content .ProseMirror h3 { font-size: 16px; font-weight: 600; margin: 12px 0 4px; }
        .editor-content .ProseMirror strong { font-weight: 600; }
        .editor-content .ProseMirror em { font-style: italic; }
        .editor-content .ProseMirror ul, .editor-content .ProseMirror ol { padding-left: 20px; margin: 8px 0; }
        .editor-content .ProseMirror li { margin: 4px 0; }
        .editor-content .ProseMirror blockquote {
          border-left: 3px solid var(--primary);
          padding-left: 16px;
          margin: 12px 0;
          color: var(--text-muted);
          font-style: italic;
        }
        .editor-content .ProseMirror code {
          background: var(--surface-elevated);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 13px;
        }
        .editor-content .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 12px 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 12px 0;
        }
        .editor-content .ProseMirror pre code { background: transparent; padding: 0; color: inherit; }
        .editor-content .ProseMirror p.is-editor-empty:first-child::before {
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