import { useEditor, BubbleMenu, EditorContent } from '@tiptap/react'
// import BubbleMenu from '@tiptap/extension-bubble-menu'
import StarterKit from '@tiptap/starter-kit'
import UnderLine from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import * as Icons from "../Icons";
import { Editor } from '@tiptap/core';
// import App from '../App.css'

// All the extensions (i.e. plugins not included in the StarterKit) that you want to use are mentioned here
const extensions =
  [
    StarterKit,
    UnderLine,
    Link,
    Placeholder.configure({
      placeholder: 'Tell your story...',
    }),
  ];


interface TiptapProps {
  setEditor: (editor: Editor | null) => void;
  initialContent?: string;
}

const Tiptap = ({ setEditor, initialContent }: TiptapProps) => {
  const editor = useEditor({
    extensions, // Define above
    content: initialContent || "", // Can be empty for create new, or filled with existing for editing
    onUpdate: ({ editor }) => {
      setEditor(editor);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  });

  // To ensure editor is initalized and not null
  if (!editor) {
    return null;
  }

  return (
    <>
      <div>
        {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 200 }}>
          <div className="bubble-menu w-96 bg-white focus: ring-2 ring-green-600 p-3 rounded-2xl ">


            <button
              type="button"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}><Icons.RotateRight /></button>
            <button
              type="button"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}><Icons.RotateLeft /></button>



            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''} >H1</button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''} >H2</button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''} >H3</button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active' : ''} ><Icons.Bold /></button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active' : ''} ><Icons.Italic /></button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              className={editor.isActive('underline') ? 'is-active' : ''} ><Icons.Underline /></button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active' : ''} ><Icons.Strikethrough /></button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
              className={editor.isActive('code') ? 'is-active' : ''} ><Icons.Code /></button>


            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              disabled={!editor.can().chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''} ><Icons.BulletList /></button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              disabled={!editor.can().chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''} ><Icons.OrderedList /></button>

            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive("blockquote") ? "is-active" : ""}
            ><Icons.Quote /></button>

            <button type="button" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              hr
            </button>

            <button type="button" onClick={() => editor.chain().focus().setHardBreak().run()}>br</button>


          </div>
        </BubbleMenu>}</div>

      <div><EditorContent editor={editor} className='max-h-screen ' /></div>
    </>

  )
}
export default Tiptap