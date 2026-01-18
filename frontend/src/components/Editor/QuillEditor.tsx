import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { QuillBinding } from 'y-quill';
import * as Y from 'yjs';

// Define a type for the editor props
interface QuillEditorProps {
    ydoc: Y.Doc;
    user: any;
    // awareness?: any; // If we implement awareness later
}

const QuillEditor: React.FC<QuillEditorProps> = ({ ydoc, user }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const bindingRef = useRef<QuillBinding | null>(null);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            // Initialize Quill
            quillRef.current = new Quill(editorRef.current, {
                modules: {
                    toolbar: [
                        [{ header: [1, 2, false] }],
                        ['bold', 'italic', 'underline'],
                        ['image', 'code-block'],
                        [{ color: [] }, { background: [] }],    // dropdown with defaults from theme
                        [{ font: [] }],
                        [{ align: [] }],
                        ['clean']
                    ],
                    history: {
                        // Local history is conflicting with Yjs history usually, 
                        // but y-quill handles it if configured right.
                        // Usually better to let y-quill handle undo/redo or disable quill's history.
                        userOnly: true
                    }
                },
                placeholder: 'Start collaborating...',
                theme: 'snow'
            });

            // Bind Yjs
            const type = ydoc.getText('quill'); // 'quill' is the shared text property name

            // We don't have a standard awareness provider yet, pass null.
            // Text sync will work, cursors won't.
            bindingRef.current = new QuillBinding(type, quillRef.current, undefined);
        }

        return () => {
            // Cleanup
            if (bindingRef.current) {
                bindingRef.current.destroy();
                bindingRef.current = null;
            }
            // We generally don't destroy the quill instance itself as it removes the DOM node
        };
    }, [ydoc]);

    return (
        <div className="flex flex-col h-full">
            <div ref={editorRef} className="flex-1 bg-white text-black rounded-b-xl overflow-hidden" />
            <style>{`
                .ql-toolbar {
                    background: #f3f4f6;
                    border-top-left-radius: 0.75rem;
                    border-top-right-radius: 0.75rem;
                    border-color: #e5e7eb !important;
                }
                .ql-container {
                    border-bottom-left-radius: 0.75rem;
                    border-bottom-right-radius: 0.75rem;
                    border-color: #e5e7eb !important;
                    font-family: 'Inter', sans-serif;
                    font-size: 1rem;
                }
                .ql-editor {
                    min-height: 300px;
                }
            `}</style>
        </div>
    );
};

export default QuillEditor;
