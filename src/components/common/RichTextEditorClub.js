import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";
import DOMPurify from "dompurify";

const RichTextEditorClub = forwardRef(
  (
    {
      label,
      value = "",
      onChange = () => {},
      placeholder = "Start typing...",
      showHtmlToggle = true,
      className = "",
      disabled = false,
      emitOnChange = false,
      height = 400,
    },
    ref,
  ) => {
    const editorRef = useRef(null);
    const [internalValue, setInternalValue] = useState(value);
    const [showHtml, setShowHtml] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    // ✅ NEW: Expose insertText method to parent component
    useImperativeHandle(ref, () => ({
      insertText: (text) => {
        if (editorRef.current) {
          const editor = editorRef.current;
          editor.selection.insertHTML(text);
        }
      },
    }));

    const config = useMemo(
      () => ({
        readonly: !!disabled,
        height,
        placeholder,

        toolbar: [
          "undo redo | bold italic underline | align",
          "ul ol | outdent indent | table",
        ],

        removeButtons:
          "ai-assistant,ai-command,about,print,insertvideo,video,speech,paintformat,formatPainter,file,spellcheck,classSpan,image,fullsize,preview",

        disablePlugins: [
          "ai-assistant",
          "ai-command",
          "speech",
          "video",
          "print",
          "about",
          "paintformat",
          "filebrowser",
          "file",
          "image",
          "filebrowser",
          "drag-and-drop",
          "pasteStorage",
          "fullsize", // ✅ disable fullscreen
          "preview", // ✅ disable preview
        ],

        // MANUALLY handle image uploads
        // ❌ Remove uploader completely
        uploader: {
          insertImageAsBase64URI: false,
        },

        // Better approach: use events to handle image insertion
        events: {
          beforePaste: function (html) {
            // Parse HTML safely
            const doc = new DOMParser().parseFromString(html, "text/html");

            // ❌ Remove ALL images (even nested inside links)
            doc.querySelectorAll("img").forEach((img) => img.remove());

            return doc.body.innerHTML;
          },

          // ✅ Prevent pasted images also
          beforePasteFromWord: function (html) {
            return html.replace(/<img[^>]*>/g, "");
          },

          beforeInsertImage: function () {
            return false; // ❌ block any internal image insert
          },

          // ✅ NEW: Auto-center tables after insertion
          // afterInsertNode: function (node) {
          //   if (node.tagName === "TABLE") {
          //     node.style.marginLeft = "auto";
          //     node.style.marginRight = "auto";
          //     node.style.marginTop = "10px";
          //     node.style.marginBottom = "10px";
          //     node.style.borderCollapse = "collapse";

          //     const cells = node.querySelectorAll("td, th");
          //     cells.forEach((cell) => {
          //       cell.style.border = "1px solid #ddd";
          //       cell.style.padding = "8px";
          //     });
          //   }
          // },

          // ✅ NEW: Style existing tables on load and change
          // afterInit: function (editor) {
          //   const styleTables = () => {
          //     const tables = editor.editor.querySelectorAll("table");
          //     tables.forEach((table) => {
          //       table.style.marginLeft = "auto";
          //       table.style.marginRight = "auto";
          //       table.style.marginTop = "10px";
          //       table.style.marginBottom = "10px";
          //       table.style.borderCollapse = "collapse";

          //       const cells = table.querySelectorAll("td, th");
          //       cells.forEach((cell) => {
          //         cell.style.border = "1px solid #ddd";
          //         cell.style.padding = "8px";
          //       });
          //     });
          //   };

          //   styleTables();
          //   editor.events.on("change", styleTables);
          // },
        },

        defaultActionOnPaste: "insert_as_html",
        askBeforePasteHTML: false,
        cleanHTML: {
          removeJavascript: true,
          removeTags: ["img"],
        },
        showXPathInStatusbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        showPlaceholder: true,
        hidePoweredByJodit: true,
        statusbar: false,
      }),
      [disabled, height, placeholder],
    );

    useEffect(() => {
      setInternalValue(value);
      if (!isFocused && editorRef.current) {
        try {
          if (editorRef.current.setEditorValue) {
            editorRef.current.setEditorValue(value);
          } else if (editorRef.current.getEditor) {
            const ed = editorRef.current.getEditor();
            if (ed) ed.innerHTML = value;
          }
        } catch {}
      }
    }, [value, isFocused]);

    const extractContent = () => {
      try {
        if (editorRef.current?.value) return editorRef.current.value;
        if (editorRef.current?.getEditor)
          return editorRef.current.getEditor().innerHTML;
        if (editorRef.current?.editor)
          return editorRef.current.editor.innerHTML;
      } catch {}
      return internalValue;
    };

    const handleEditorChange = () => {
      const content = extractContent();
      const cleanContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          // ✅ Existing (keep them)
          "p",
          "strong",
          "span",
          "em",
          "u",
          "ul",
          "ol",
          "li",
          "br",

          // ✅ ADD these (your new requirement)
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "table",
          "thead",
          "tbody",
          "tfoot",
          "tr",
          "td",
          "th",
          "div",
          "blockquote",
          "pre",
          "code",
        ],

        ALLOWED_ATTR: [
          "style",
          "class",
          "colspan",
          "rowspan",

          // ✅ required for email HTML
          "align",
          "width",
          "height",
          "border",
          "cellpadding",
          "cellspacing",
          "role",

          // ✅ images & links
          "src",
          "alt",
          "href",
          "target",
          "rel",
        ],
      });

      setInternalValue(cleanContent);
      if (emitOnChange) onChange(cleanContent);
    };

    const handleEditorBlur = () => {
      const content = extractContent();
      const cleanContent = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          // ✅ Existing (keep them)
          "p",
          "strong",
          "span",
          "em",
          "u",
          "ul",
          "ol",
          "li",
          "br",

          // ✅ ADD these (your new requirement)
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "table",
          "thead",
          "tbody",
          "tfoot",
          "tr",
          "td",
          "th",
          "div",
          "blockquote",
          "pre",
          "code",
        ],

        ALLOWED_ATTR: [
          "style",
          "class",
          "colspan",
          "rowspan",

          // ✅ required for email HTML
          "align",
          "width",
          "height",
          "border",
          "cellpadding",
          "cellspacing",
          "role",

          // ✅ images & links
          "src",
          "alt",
          "href",
          "target",
          "rel",
        ],
      });

      setInternalValue(cleanContent);
      setIsFocused(false);
      onChange(cleanContent);
    };

    return (
      <div className={`rich-text-editor-wrapper ${className}`}>
        <div className="flex justify-between gap-2 items-center mb-2">
          <label className="block">
            {label}
            <span className="text-red-500">*</span>
          </label>
          {/* {showHtmlToggle && (
          <div className="flex justify-end ">
            <button
              type="button"
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              onClick={() => setShowHtml((s) => !s)}
            >
              {showHtml ? "Back to Editor" : "Edit HTML"}
            </button>
          </div>
        )} */}
        </div>

        {showHtml ? (
          <textarea
            className="w-full p-2 border rounded h-60 font-mono text-sm"
            value={internalValue}
            disabled={disabled}
            onChange={(e) => {
              setInternalValue(e.target.value);
              onChange(e.target.value);
            }}
          />
        ) : (
          <JoditEditor
            ref={editorRef}
            value={internalValue}
            config={config}
            onBlur={handleEditorBlur}
            onFocus={() => setIsFocused(true)}
            onChange={handleEditorChange}
          />
        )}
        {/* Scoped CSS for Tailwind resets and editor content */}
        <style>{`
  /* Fix UL / OL styling */
  .rich-text-editor-wrapper .jodit-wysiwyg ul {
    list-style-type: disc;
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .rich-text-editor-wrapper .jodit-wysiwyg ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }

  .rich-text-editor-wrapper .jodit-wysiwyg li {
    margin: 0.25rem 0;
  }

  /* Nested lists */
  .rich-text-editor-wrapper .jodit-wysiwyg ul ul {
    list-style-type: circle;
  }
  .rich-text-editor-wrapper .jodit-wysiwyg ul ul ul {
    list-style-type: square;
  }

  /* Paragraph and heading spacing */
  .rich-text-editor-wrapper .jodit-wysiwyg p {
    margin: 0.5rem 0;
  }
  .rich-text-editor-wrapper .jodit-wysiwyg h1,
  .rich-text-editor-wrapper .jodit-wysiwyg h2,
  .rich-text-editor-wrapper .jodit-wysiwyg h3,
  .rich-text-editor-wrapper .jodit-wysiwyg h4 {
    font-weight: 600;
    margin: 0.75rem 0 0.5rem;
  }

  /* Table styling */
  .rich-text-editor-wrapper .jodit-wysiwyg table {
    margin: 10px auto;
    border-collapse: collapse;
  }
  .rich-text-editor-wrapper .jodit-wysiwyg td,
  .rich-text-editor-wrapper .jodit-wysiwyg th {
    border: 1px solid #ddd;
    padding: 8px;
  }
`}</style>
      </div>
    );
  },
);

RichTextEditorClub.displayName = "RichTextEditorClub";

export default RichTextEditorClub;
