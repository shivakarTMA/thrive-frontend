import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import JoditEditor from "jodit-react";
import DOMPurify from "dompurify";


// ✅ GLOBAL SECURITY CONFIG

// Block unsafe URLs
DOMPurify.setConfig({
  ALLOWED_URI_REGEXP: /^(https?|mailto|tel):/i,
  FORCE_BODY: true,
  SANITIZE_DOM: true,
});

// ✅ Remove ALL event handlers (onclick, onerror, etc.)
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName.startsWith("on")) {
    data.keepAttr = false;
  }
});

// ✅ Allow SAFE styles only
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName === "style") {
    const cleanStyle = [];

    const allowedStyles = [
      "color",
      "background-color",
      "text-align",
      "font-size",
      "font-weight",
      "text-decoration",
      "padding",
      "margin",
      "border",
      "border-collapse",
    ];

    data.attrValue.split(";").forEach((style) => {
      const [property, value] = style.split(":").map((s) => s && s.trim());

      if (!property || !value) return;

      const isAllowedProperty = allowedStyles.includes(
        property.toLowerCase()
      );

      const isSafeValue =
        !value.includes("javascript:") &&
        !value.includes("expression(") &&
        !value.includes("url(");

      if (isAllowedProperty && isSafeValue) {
        cleanStyle.push(`${property}: ${value}`);
      }
    });

    data.attrValue = cleanStyle.join("; ");
  }
});


const RichTextEditorClub = forwardRef(
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
        readonly: !!disabled,
        height,
        placeholder,

        toolbar: [
          "undo redo | bold italic underline | align",
          "ul ol | outdent indent | table",
        ],

        removeButtons:
          "classSpan,ai-assistant,ai-command,about,print,insertvideo,video,speech,paintformat,file,image,preview",

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
          "image",
          "drag-and-drop",
          "pasteStorage",
          "preview",
        ],

        uploader: {
          insertImageAsBase64URI: false,
        },

        events: {
          beforePaste: function (html) {
            const doc = new DOMParser().parseFromString(html, "text/html");
            doc.querySelectorAll("img").forEach((img) => img.remove());
            return doc.body.innerHTML;
          },

          beforePasteFromWord: function (html) {
            return html.replace(/<img[^>]*>/g, "");
          },

          beforeInsertImage: function () {
            return false;
          },
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
        return editorRef.current?.value ||
          editorRef.current?.getEditor?.().innerHTML ||
          internalValue;
      } catch {
        return internalValue;
      }
    };

    // ✅ Link validation
    const validateLinks = (html) => {
      const doc = new DOMParser().parseFromString(html, "text/html");

      doc.querySelectorAll("a").forEach((a) => {
        const href = a.getAttribute("href");

        if (href && !href.match(/^(https?:|mailto:|tel:)/i)) {
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
          "div","blockquote","pre","code","a"
        ],

        ALLOWED_ATTR: [
          "style","class","colspan","rowspan",
          "align","width","height","border",
          "cellpadding","cellspacing","role",
          "alt","href","target","rel"
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

    const handleEditorChange = () => {
      const content = extractContent();
      const cleanContent = sanitizeContent(content);

      setInternalValue(cleanContent);
      if (emitOnChange) onChange(cleanContent);
    };

    const handleEditorBlur = () => {
      const content = extractContent();
      const cleanContent = sanitizeContent(content);

      setInternalValue(cleanContent);
      setIsFocused(false);
      onChange(cleanContent);
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

RichTextEditorClub.displayName = "RichTextEditorClub";

export default RichTextEditorClub;