import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Italic,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type TiptapEditorProps = {
    value: string;
    onChange: (value: string) => void;
};

export default function TiptapEditor({ value, onChange }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            Underline,
            TextAlign.configure({
                types: ['paragraph'],
            }),
        ],
        content: value,
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    // Sync external value changes into the editor
    useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();

    if (value !== currentHTML) {
        editor.commands.setContent(value || '', {
            emitUpdate: false,
        });
    }
}, [value, editor]);


    if (!editor) return null;

    return (
        <div className="rounded-lg border">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
                {/* Bold */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('bold') ? 'default' : 'outline'}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </Button>

                {/* Italic */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('italic') ? 'default' : 'outline'}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </Button>

                {/* Underline */}
                <Button
                    type="button"
                    size="sm"
                    variant={editor.isActive('underline') ? 'default' : 'outline'}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    title="Underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Button>

                {/* Bullet */}
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive('bulletList') ? 'default' : 'outline'
                    }
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </Button>

                {/* Numbered List */}
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive('orderedList') ? 'default' : 'outline'
                    }
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    title="Numbered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="mx-1 h-6 w-px bg-border" />

                {/* Align Left */}
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive({ textAlign: 'left' })
                            ? 'default'
                            : 'outline'
                    }
                    onClick={() =>
                        editor.chain().focus().setTextAlign('left').run()
                    }
                    title="Align Left"
                >
                    <AlignLeft className="h-4 w-4" />
                </Button>

                {/* Align Center */}
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive({ textAlign: 'center' })
                            ? 'default'
                            : 'outline'
                    }
                    onClick={() =>
                        editor.chain().focus().setTextAlign('center').run()
                    }
                    title="Align Center"
                >
                    <AlignCenter className="h-4 w-4" />
                </Button>

                {/* Align Right */}
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive({ textAlign: 'right' })
                            ? 'default'
                            : 'outline'
                    }
                    onClick={() =>
                        editor.chain().focus().setTextAlign('right').run()
                    }
                    title="Align Right"
                >
                    <AlignRight className="h-4 w-4" />
                </Button>

                {/* Justify */}
                <Button
                    type="button"
                    size="sm"
                    variant={
                        editor.isActive({ textAlign: 'justify' })
                            ? 'default'
                            : 'outline'
                    }
                    onClick={() =>
                        editor.chain().focus().setTextAlign('justify').run()
                    }
                    title="Justify"
                >
                    <AlignJustify className="h-4 w-4" />
                </Button>
            </div>

            {/* Editor */}
            <div className="p-3">
                <EditorContent editor={editor} className="max-w-none" />
            </div>
        </div>
    );
}
