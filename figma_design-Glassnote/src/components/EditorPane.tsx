import { useState, useEffect, useRef } from "react";
import { Note, Theme } from "../App";
import { MarkdownPreview } from "./MarkdownPreview";
import {
  Eye,
  EyeOff,
  Calendar,
  Tag,
  Bold,
  Italic,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Sun,
  Moon,
  PanelLeft,
} from "lucide-react";

interface EditorPaneProps {
  note: Note | null;
  onUpdateNote: (
    noteId: string,
    updates: Partial<Note>,
  ) => void;
  theme: Theme;
  onToggleTheme?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function EditorPane({
  note,
  onUpdateNote,
  theme,
  onToggleTheme,
  sidebarCollapsed,
  onToggleSidebar,
}: EditorPaneProps) {
  const [localContent, setLocalContent] = useState("");
  const [localTitle, setLocalTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (note) {
      setLocalContent(note.content);
      setLocalTitle(note.title);
    }
  }, [note?.id]);

  useEffect(() => {
    if (!note) return;

    const timer = setTimeout(() => {
      if (localContent !== note.content) {
        onUpdateNote(note.id, { content: localContent });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localContent, note?.id]);

  const handleTitleBlur = () => {
    if (note && localTitle !== note.title) {
      onUpdateNote(note.id, {
        title: localTitle || "Untitled",
      });
    }
  };

  const extractFirstLine = (content: string) => {
    const firstLine = content.split("\n")[0];
    if (firstLine.startsWith("# ")) {
      return firstLine.substring(2);
    }
    return firstLine.substring(0, 50) || "Untitled";
  };

  useEffect(() => {
    if (note && localContent && !localTitle) {
      const autoTitle = extractFirstLine(localContent);
      setLocalTitle(autoTitle);
      onUpdateNote(note.id, { title: autoTitle });
    }
  }, [localContent]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const insertMarkdown = (
    before: string,
    after: string = "",
  ) => {
    if (!note) return;
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const newText = `${before}${selectedText}${after}`;

    const newContent =
      textarea.value.substring(0, start) +
      newText +
      textarea.value.substring(end);

    setLocalContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + before.length;
      textarea.selectionEnd =
        start + before.length + selectedText.length;
    }, 0);
  };

  // Handle scroll event for glassmorphic header
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 20);
    };

    container.addEventListener("scroll", handleScroll);
    return () =>
      container.removeEventListener("scroll", handleScroll);
  }, [note]);

  if (!note) {
    return (
      <div
        className={`flex-1 flex items-center justify-center ${
          theme === "dark" ? "text-slate-500" : "text-slate-400"
        }`}
      >
        <div className="text-center p-8">
          <p className="text-sm">
            Select a note to start editing
          </p>
          <p className="text-xs mt-2 opacity-60">
            or create a new one from the sidebar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Sticky glassmorphic header */}
      <div
        className={`sticky top-0 z-10 transition-all duration-300 ${
          isScrolled
            ? theme === "dark"
              ? "bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800 shadow-xl shadow-black/20"
              : "bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 shadow-lg shadow-slate-200/50"
            : "bg-transparent"
        }`}
      >
        <div className="px-6 py-3">
          <div className="flex items-center gap-3 mb-2">
            {/* Sidebar toggle button (only show when collapsed) */}
            {sidebarCollapsed && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className={`p-1.5 rounded-xl ${theme === "dark" ? "hover:bg-blue-500/10 text-blue-400/70 hover:text-blue-400" : "hover:bg-blue-100 text-blue-500/70 hover:text-blue-600"} transition-all`}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className={`flex-1 bg-transparent border-none outline-none ${
                theme === "dark"
                  ? "text-slate-100 placeholder:text-slate-600"
                  : "text-slate-900 placeholder:text-slate-400"
              } text-xl font-medium`}
              placeholder="Untitled"
            />

            {/* Formatting toolbar - only show in edit mode */}
            {!showPreview && (
              <div
                className={`flex items-center gap-0.5 px-1 py-0.5 ${
                  theme === "dark"
                    ? "bg-slate-800/50 border-slate-700/50"
                    : "bg-blue-50/70 border-blue-200"
                } rounded-2xl border backdrop-blur-xl`}
              >
                <button
                  onClick={() => insertMarkdown("# ", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Heading 1"
                >
                  <Heading1 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown("## ", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Heading 2"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <div
                  className={`w-px h-3 ${theme === "dark" ? "bg-slate-700" : "bg-blue-300"} mx-0.5`}
                />
                <button
                  onClick={() => insertMarkdown("**", "**")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown("*", "*")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown("`", "`")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Code"
                >
                  <Code className="w-3.5 h-3.5" />
                </button>
                <div
                  className={`w-px h-3 ${theme === "dark" ? "bg-slate-700" : "bg-blue-300"} mx-0.5`}
                />
                <button
                  onClick={() => insertMarkdown("- ", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown("1. ", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown("- [ ] ", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Checklist"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                </button>
                <div
                  className={`w-px h-3 ${theme === "dark" ? "bg-slate-700" : "bg-blue-300"} mx-0.5`}
                />
                <button
                  onClick={() => insertMarkdown("> ", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Quote"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => insertMarkdown("[](url)", "")}
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Link"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    insertMarkdown("![alt](url)", "")
                  }
                  className={`p-1 rounded ${
                    theme === "dark"
                      ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                      : "hover:bg-blue-100 text-slate-600 hover:text-blue-600"
                  } transition-all`}
                  title="Image"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Theme toggle button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-2xl ${
                  theme === "dark"
                    ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 border-slate-700/50"
                    : "hover:bg-blue-100 text-blue-500/70 hover:text-blue-600 border-blue-200"
                } transition-all border backdrop-blur-xl`}
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "light" ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`px-2.5 py-1 rounded-2xl ${
                theme === "dark"
                  ? "hover:bg-slate-700/50 border-slate-700/50 text-slate-300"
                  : "hover:bg-blue-100 border-blue-200 text-blue-600"
              } transition-all flex items-center gap-1.5 border backdrop-blur-xl`}
              aria-label="Toggle preview"
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span className="text-xs">Edit</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span className="text-xs">Preview</span>
                </>
              )}
            </button>
          </div>

          <div
            className={`flex items-center gap-3 ${theme === "dark" ? "text-slate-500" : "text-slate-600"} text-xs transition-all duration-300 ${
              isScrolled
                ? "opacity-0 invisible h-0 overflow-hidden"
                : "opacity-100 visible"
            }`}
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(note.updatedAt)}
            </span>
            {note.tags && note.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  {note.tags.map((tag, i) => (
                    <span key={tag}>
                      {tag}
                      {i < note.tags.length - 1 && ","}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto"
      >
        {!showPreview ? (
          <textarea
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className={`w-full min-h-full px-6 py-4 bg-transparent border-none outline-none resize-none ${
              theme === "dark"
                ? "text-slate-200 placeholder:text-slate-700"
                : "text-slate-800 placeholder:text-slate-400"
            } leading-relaxed`}
            placeholder="Start writing..."
            style={{
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif',
              fontSize: "15px",
            }}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-4">
            <MarkdownPreview
              content={localContent}
              theme={theme}
            />
          </div>
        )}
      </div>
    </div>
  );
}