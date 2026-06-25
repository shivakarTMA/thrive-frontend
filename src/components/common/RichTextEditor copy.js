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

// ✅ GLOBAL SECURITY CONFIG
DOMPurify.setConfig({
  ALLOWED_URI_REGEXP: /^(https?|mailto|tel|data:image\/)/i,
  FORCE_BODY: true,
  SANITIZE_DOM: true,
});

// ✅ REMOVE EVENT HANDLERS (onclick, onerror, etc.)
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName.startsWith("on")) {
    data.keepAttr = false;
  }
});

// ✅ SAFE STYLE FILTER
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName === "style") {
    const allowedStyles = [
      "color",
      "background",
      "background-color",
      "text-align",
      "font-size",
      "font-weight",
      "text-decoration",
      "padding",
      "margin",
      "border",
      "border-bottom",   // ✅ ADD THIS
      "border-top",      // ✅ ADD THIS
      "border-left",     // ✅ ADD THIS
      "border-right",    // ✅ ADD THIS
      "border-collapse",
      "width",
      "height",
      "list-style",
      "list-style-type",
      "list-style-position",
    ];

    const cleanStyle = [];

    const styles = data.attrValue.split(";").filter(Boolean);

    styles.forEach((style) => {
      const [prop, val] = style.split(":").map((s) => s && s.trim());

      if (!prop || !val) return;

      const isAllowed = allowedStyles.includes(prop.toLowerCase());

      const isSafe =
        !val.includes("javascript:") &&
        !val.includes("expression(");
        // !val.includes("url(");

      if (isAllowed && isSafe) {
        cleanStyle.push(`${prop}: ${val}`);
      }
    });

    data.attrValue = cleanStyle.join("; ");
  }
});

const RichTextEditor = forwardRef(
  (
    {
      label,
      value = "",
      onChange = () => {},
      placeholder = "Start typing...",
      className = "",
      disabled = false,
      emitOnChange = false,
      height = 400,
      editMode = false,
    },
    ref
  ) => {
    const editorRef = useRef(null);
    const [internalValue, setInternalValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      insertText: (text) => {
        if (editorRef.current) {
          editorRef.current.selection.insertHTML(text);
        }
      },
    }));

    const config = useMemo(
      () => ({
        disabled: editMode,
        readonly: !!disabled,
        height,
        placeholder,

        toolbar: [
          "undo redo | bold italic underline | align",
          "ul ol | outdent indent | table",
          "link image | source",
        ],

        removeButtons:
          "classSpan,ai-assistant,ai-command,about,print,insertvideo,video,speech,paintformat,formatPainter,file,spellcheck",

        disablePlugins: [
          "classSpan",
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

        uploader: {
          insertImageAsBase64URI: true,
          imagesExtensions: ["jpg", "png", "jpeg", "svg", "webp"],

          url: "data:application/json;base64,eyJzdWNjZXNzIjp0cnVlfQ==",

          process: () => ({
            files: [],
            error: 0,
            msg: "",
          }),

          isSuccess: () => true,

          defaultHandlerSuccess: function (data) {
            const files = data.files || [];
            if (files.length) {
              this.selection.insertImage(files[0]);
            }
          },
        },

        events: {
          beforePaste: function (html) {
            return html;
          },

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

            if (!allowed.includes(file.type)) {
              toast.error("Only PNG, JPG, JPEG, SVG, or WebP allowed");
              return false;
            }

            if (file.size > 2 * 1024 * 1024) {
              toast.error("Image must be under 2MB");
              return false;
            }

            const reader = new FileReader();
            const editor = this;

            reader.onload = function () {
              editor.selection.insertImage(reader.result, null, 250);
            };

            reader.readAsDataURL(file);

            return false;
          },
        },

        defaultActionOnPaste: "insert_as_html",
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false, // 🔥 ADD THIS
        processPasteFromWord: false,   // 🔥 ADD THIS (optional but recommended)
        cleanHTML: {
          removeJavascript: true,
        },

        showXPathInStatusbar: false,
        showCharsCounter: false,
        showWordsCounter: false,
        hidePoweredByJodit: true,
        statusbar: false,
      }),
      [disabled, height, placeholder]
    );

    useEffect(() => {
      setInternalValue(value);
      if (!isFocused && editorRef.current) {
        try {
          editorRef.current?.setEditorValue?.(value);
        } catch {}
      }
    }, [value, isFocused]);

    const extractContent = () => {
      try {
        return (
          editorRef.current?.value ||
          editorRef.current?.getEditor?.().innerHTML ||
          internalValue
        );
      } catch {
        return internalValue;
      }
    };

    // ✅ LINK VALIDATION
    const validateLinks = (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");

      doc.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href");

        if (!href || !href.match(/^(https?:|mailto:|tel:)/i)) {
          a.removeAttribute("href");
        }

        if (a.getAttribute("target") === "_blank") {
          a.setAttribute("rel", "noopener noreferrer");
        }
      });

      return doc.body.innerHTML;
    };

    const sanitizeContent = (content) => {
      let clean = DOMPurify.sanitize(content, {
        ALLOWED_TAGS: [
          "p","strong","span","em","u","ul","ol","li","br",
          "h1","h2","h3","h4","h5","h6",
          "table","thead","tbody","tfoot","tr","td","th",
          "div","blockquote","pre","code",
          "img","a"
        ],

        ALLOWED_ATTR: [
          "border-bottom","border-top","border-left","border-right","style",
          "colspan",
          "rowspan",
          "align",
          "width",
          "height",
          "border",
          "border-bottom",
          "border-top",
          "border-left",
          "border-right",
          "cellpadding",
          "cellspacing",
          "role", // ✅ keep this
          "alt",
          "src",
          "href",
          "target",
          "rel",
        ],

        FORBID_TAGS: [
          "script","iframe","object","embed","svg","math",
          "form","input","button","textarea","select",
          "link","meta"
        ],

        KEEP_CONTENT: false,
      });

      clean = validateLinks(clean);
      return clean;
    };

    // const handleEditorChange = () => {
    //   const clean = sanitizeContent(extractContent());
    //   setInternalValue(clean);
    //   if (emitOnChange) onChange(clean);
    // };
    const handleEditorChange = () => {
      const content = extractContent();
      setInternalValue(content);
      if (emitOnChange) onChange(content);
    };

    // const handleEditorBlur = () => {
    //   const clean = sanitizeContent(extractContent());
    //   setInternalValue(clean);
    //   setIsFocused(false);
    //   onChange(clean);
    // };
    const handleEditorBlur = () => {
      const clean = sanitizeContent(extractContent());
      onChange(clean);
    };

    return (
      <div className={`rich-text-editor-wrapper ${className}`}>
        <label>
          {label} <span style={{ color: "red" }}>*</span>
        </label>

        <JoditEditor
          ref={editorRef}
          value={internalValue}
          config={config}
          onBlur={handleEditorBlur}
          onFocus={() => setIsFocused(true)}
          onChange={handleEditorChange}
        />
      </div>
    );
  }
);

RichTextEditor.displayName = "RichTextEditor";
export default RichTextEditor;