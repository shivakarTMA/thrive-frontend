import React, { useState, useRef, useEffect, useMemo } from "react";
import JoditEditor from "jodit-react";
import { toast } from "react-toastify";

const RichTextEditor = ({
  label,
  value = "",
  onChange = () => {},
  placeholder = "Start typing...",
  showHtmlToggle = true,
  className = "",
  disabled = false,
  emitOnChange = false,
  height = 400,
}) => {
  const editorRef = useRef(null);
  const [internalValue, setInternalValue] = useState(value);
  const [showHtml, setShowHtml] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const config = useMemo(
    () => ({
      readonly: !!disabled,
      height,
      placeholder,

      toolbar: [
        "undo redo | bold italic underline | align",
        "ul ol | outdent indent | table",
        "link image | source",
      ],

      removeButtons:
        "ai-assistant,ai-command,about,print,insertvideo,video,speech,paintformat,formatPainter,file",

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
      ],

      // MANUALLY handle image uploads
      uploader: {
        insertImageAsBase64URI: true,
        imagesExtensions: ["jpg", "png", "jpeg", "svg", "webp"],

        // This prevents the AJAX request
        url: "data:application/json;base64,eyJzdWNjZXNzIjp0cnVlfQ==",

        // Handle file upload
        process: (resp) => {
          // Return false to prevent default processing
          return {
            files: [],
            error: 0,
            msg: "",
          };
        },

        // Validate before upload
        isSuccess: function (resp) {
          return true;
        },

        // Handle the actual file selection
        defaultHandlerSuccess: function (data, resp) {
          const files = data.files || [];
          if (files && files.length) {
            this.selection.insertImage(files[0]);
          }
        },

        // Error handler
        error: function (e) {
          this.events.fire("errorMessage", e.message, "error", 4000);
        },
      },

      // Better approach: use events to handle image insertion
      events: {
        beforeImageUpload: function (files) {
          const file = files?.[0];
          if (!file) return false;

          const allowed = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "image/svg+xml",
            "image/webp",
          ];

          // ❌ INVALID FILE TYPE
          if (!allowed.includes(file.type)) {
            // Use setTimeout to ensure toast shows outside Jodit's event cycle
            setTimeout(() => {
              toast.error(
                "Only PNG, JPG, JPEG, SVG, or WebP images are allowed.",
                {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                }
              );
            }, 0);
            return false; // Prevent upload
          }

          // ✅ VALID — Convert to Base64 manually
          const reader = new FileReader();
          const editor = this;

          reader.onload = function () {
            editor.selection.insertImage(reader.result, null, 250);
          };

          reader.onerror = function () {
            setTimeout(() => {
              toast.error("Failed to read image file.", {
                position: "top-right",
                autoClose: 3000,
              });
            }, 0);
          };

          reader.readAsDataURL(file);

          return false; // Prevent default upload behavior
        },
      },

      defaultActionOnPaste: "insert_as_html",
      askBeforePasteHTML: false,
      cleanHTML: false,
      showXPathInStatusbar: false,
      showCharsCounter: false,
      showWordsCounter: false,
      showPlaceholder: true,
      hidePoweredByJodit: true,
      statusbar: false,
    }),
    [disabled, height, placeholder]
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
      if (editorRef.current?.editor) return editorRef.current.editor.innerHTML;
    } catch {}
    return internalValue;
  };

  const handleEditorChange = () => {
    const content = extractContent();
    setInternalValue(content);
    if (emitOnChange) onChange(content);
  };

  const handleEditorBlur = () => {
    const content = extractContent();
    setInternalValue(content);
    setIsFocused(false);
    onChange(content);
  };

  return (
    <div className={`rich-text-editor-wrapper ${className}`}>
      <div className="flex justify-between gap-2 items-center mb-2">
        <label className="block">
          {label}
          <span className="text-red-500">*</span>
        </label>
        {showHtmlToggle && (
          <div className="flex justify-end ">
            <button
              type="button"
              className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
              onClick={() => setShowHtml((s) => !s)}
            >
              {showHtml ? "Back to Editor" : "Edit HTML"}
            </button>
          </div>
        )}
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
    </div>
  );
};

export default RichTextEditor;
