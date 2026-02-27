"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [type, setType] = useState<"video" | "digital">("video");
  const [file, setFile] = useState<File | null>(null);
  const [thumb, setThumb] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [descriptionHtml, setDescriptionHtml] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: "",
    editorProps: { attributes: { class: "tiptap-editor" } },
    onUpdate: ({ editor }) => {
      setDescriptionHtml(editor.getHTML());
    },
  });

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setThumb(f);
    if (f) setThumbPreview(URL.createObjectURL(f));
  };

  const addLink = () => {
    const url = prompt("Enter URL:");
    if (!url) return;
    editor?.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (!url) return;
    editor?.chain().focus().setImage({ src: url }).run();
  };

  const upload = async () => {
    if (!file) return alert("Select a file");
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Login first"); setLoading(false); return; }

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(`${type}/${user.id}-${Date.now()}-${file.name}`, file);

    if (error) { alert(error.message); setLoading(false); return; }

    let thumbnailPath = null;
    if (thumb) {
      const { data: tData, error: tError } = await supabase.storage
        .from("videos")
        .upload(`thumbs/${user.id}-${Date.now()}-${thumb.name}`, thumb);
      if (!tError && tData) thumbnailPath = tData.path;
    }

    const description = editor?.getHTML() || "";

    const { error: dbError } = await supabase.from("videos").insert({
      creator_id: user.id,
      title,
      description,
      price: isFree ? 0 : Number(price),
      video_path: data.path,
      product_type: type,
      thumbnail_url: thumbnailPath,
      is_free: isFree,
    });

    if (dbError) { alert(dbError.message); setLoading(false); return; }

    alert("Product created!");
    setLoading(false);
    setTitle(""); setPrice(""); setFile(null); setThumb(null);
    setThumbPreview(null); setIsFree(false); setType("video");
    editor?.commands.clearContent();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-layout { display: flex; min-height: 100vh; background: #f4f4f6; font-family: 'Inter', system-ui, sans-serif; color: #18181b; }

        .up-wrap { flex: 1; padding: 48px 32px 48px 48px; overflow-y: auto; max-width: 700px; }
        .up-inner { display: flex; flex-direction: column; gap: 12px; }
        .up-header { margin-bottom: 8px; }
        .up-header h1 { font-family: 'Inter', system-ui, sans-serif; font-size: 1.75rem; font-weight: 800; color: #18181b; letter-spacing: -0.03em; line-height: 1.2; }
        .up-header p { font-size: 0.875rem; color: #71717a; margin-top: 4px; font-weight: 400; }
        .up-card { background: #fff; border: 1px solid #e4e4e7; border-radius: 14px; overflow: hidden; }
        .up-card-header { display: flex; align-items: center; gap: 10px; padding: 18px 24px; border-bottom: 1px solid #f0f0f2; user-select: none; }
        .up-card-header svg { color: #a1a1aa; }
        .up-card-header h2 { font-size: 0.9375rem; font-weight: 600; color: #18181b; flex: 1; font-family: 'Inter', system-ui, sans-serif; }
        .up-card-header .required { color: #7c3aed; margin-left: 2px; }
        .up-card-body { padding: 20px 24px; }
        .up-label { display: block; font-size: 0.8125rem; font-weight: 500; color: #3f3f46; margin-bottom: 6px; font-family: 'Inter', system-ui, sans-serif; }
        .up-label .req { color: #7c3aed; }
        .up-input { width: 100%; background: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 10px 14px; font-size: 0.9rem; font-family: 'Inter', system-ui, sans-serif; color: #18181b; outline: none; transition: border-color 0.15s, box-shadow 0.15s; resize: vertical; }
        .up-input::placeholder { color: #a1a1aa; }
        .up-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
        .up-hint { font-size: 0.78rem; color: #a1a1aa; margin-top: 6px; font-weight: 400; font-family: 'Inter', system-ui, sans-serif; }
        .up-editor-wrap { border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; background: #fafafa; transition: border-color 0.15s, box-shadow 0.15s; }
        .up-editor-wrap:focus-within { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
        .up-toolbar { display: flex; align-items: center; gap: 2px; padding: 8px 10px; background: #18181b; flex-wrap: wrap; }
        .up-toolbar-btn { background: none; border: none; color: #d4d4d8; cursor: pointer; width: 30px; height: 30px; border-radius: 5px; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; transition: background 0.12s, color 0.12s; font-family: 'Inter', system-ui, sans-serif; }
        .up-toolbar-btn:hover { background: #3f3f46; color: white; }
        .up-toolbar-btn.active { background: #7c3aed; color: white; }
        .up-toolbar-divider { width: 1px; height: 18px; background: #3f3f46; margin: 0 4px; flex-shrink: 0; }
        .tiptap-editor { min-height: 140px; padding: 12px 14px; font-size: 0.9rem; font-family: 'DM Sans', sans-serif; color: #18181b; outline: none; line-height: 1.6; }
        .tiptap-editor p { margin-bottom: 6px; }
        .tiptap-editor strong { font-weight: 700; }
        .tiptap-editor em { font-style: italic; }
        .tiptap-editor u { text-decoration: underline; }
        .tiptap-editor s { text-decoration: line-through; }
        .tiptap-editor blockquote { border-left: 3px solid #7c3aed; padding-left: 12px; color: #71717a; margin: 8px 0; font-style: italic; }
        .tiptap-editor a { color: #7c3aed; text-decoration: underline; }
        .tiptap-editor img { max-width: 100%; border-radius: 6px; margin: 6px 0; }
        .tiptap-editor ul { padding-left: 20px; margin: 6px 0; }
        .tiptap-editor ol { padding-left: 20px; margin: 6px 0; }
        .up-select-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .up-select-card { border: 1.5px solid #e4e4e7; border-radius: 10px; padding: 14px 16px; cursor: pointer; transition: border-color 0.15s, background 0.15s; position: relative; background: #fafafa; }
        .up-select-card.active { border-color: #7c3aed; background: #faf5ff; }
        .up-select-card-title { font-size: 0.9rem; font-weight: 600; color: #18181b; margin-bottom: 3px; font-family: 'Inter', system-ui, sans-serif; }
        .up-select-card-desc { font-size: 0.78rem; color: #71717a; font-weight: 400; line-height: 1.4; font-family: 'Inter', system-ui, sans-serif; }
        .up-check-icon { position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; border-radius: 50%; background: #7c3aed; display: flex; align-items: center; justify-content: center; }
        .up-check-icon svg { width: 11px; height: 11px; stroke: white; stroke-width: 2.5; fill: none; }
        .up-dropzone { border: 1.5px dashed #d4d4d8; border-radius: 10px; padding: 28px 20px; text-align: center; cursor: pointer; transition: border-color 0.15s, background 0.15s; background: #fafafa; }
        .up-dropzone:hover { border-color: #7c3aed; background: #faf5ff; }
        .up-dropzone-icon { width: 40px; height: 40px; border-radius: 50%; background: #f0f0f2; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
        .up-dropzone p { font-size: 0.85rem; color: #71717a; font-weight: 400; font-family: 'Inter', system-ui, sans-serif; }
        .up-dropzone a { color: #7c3aed; font-weight: 500; text-decoration: none; }
        .up-dropzone-sub { font-size: 0.75rem; color: #a1a1aa; margin-top: 4px; font-family: 'Inter', system-ui, sans-serif; }
        .up-file-chosen { display: flex; align-items: center; gap: 10px; background: #f4f4f6; border-radius: 8px; padding: 10px 14px; margin-top: 10px; font-size: 0.83rem; color: #3f3f46; font-family: 'Inter', system-ui, sans-serif; }
        .up-file-chosen svg { color: #7c3aed; flex-shrink: 0; }
        .up-price-input-wrap { margin-top: 14px; }
        .up-price-symbol { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.9rem; color: #71717a; pointer-events: none; font-family: 'Inter', system-ui, sans-serif; }
        .up-price-input { padding-left: 24px; }
        .up-thumb-preview { width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-top: 12px; border: 1px solid #e4e4e7; }
        .up-submit-row { display: flex; justify-content: flex-end; padding-top: 4px; }
        .up-btn { background: #7c3aed; color: white; border: none; border-radius: 9px; padding: 11px 28px; font-size: 0.9rem; font-weight: 600; font-family: 'Inter', system-ui, sans-serif; cursor: pointer; transition: background 0.15s, transform 0.1s, box-shadow 0.15s; box-shadow: 0 2px 8px rgba(124,58,237,0.25); letter-spacing: 0.01em; }
        .up-btn:hover:not(:disabled) { background: #6d28d9; box-shadow: 0 4px 16px rgba(124,58,237,0.35); transform: translateY(-1px); }
        .up-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .up-spinner { display: inline-block; width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* PREVIEW PANEL */
        .preview-panel { width: 360px; flex-shrink: 0; background: #fff; border-left: 1px solid #e4e4e7; position: sticky; top: 0; height: 100vh; overflow-y: auto; display: flex; flex-direction: column; }
        .preview-header { padding: 16px 20px; border-bottom: 1px solid #f0f0f2; display: flex; align-items: center; justify-content: space-between; background: #fafafa; flex-shrink: 0; }
        .preview-header h3 { font-size: 0.8125rem; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.06em; font-family: 'Inter', system-ui, sans-serif; }
        .preview-live-dot { display: flex; align-items: center; gap: 5px; font-size: 0.75rem; color: #22c55e; font-weight: 500; font-family: 'Inter', system-ui, sans-serif; }
        .preview-live-dot::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: pulse 1.5s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        .preview-body { flex: 1; padding: 24px 20px; }
        .pv-card { border: 1px solid #e4e4e7; border-radius: 16px; overflow: hidden; background: white; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .pv-thumb { width: 100%; height: 180px; background: linear-gradient(135deg, #f4f4f6 0%, #e4e4e7 100%); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
        .pv-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .pv-thumb-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #a1a1aa; }
        .pv-thumb-placeholder span { font-size: 0.75rem; font-weight: 400; font-family: 'Inter', system-ui, sans-serif; }
        .pv-type-badge { position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.6); color: white; font-size: 0.7rem; font-weight: 600; padding: 3px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em; backdrop-filter: blur(4px); font-family: 'Inter', system-ui, sans-serif; }
        .pv-content { padding: 18px; }
        .pv-title { font-family: 'Inter', system-ui, sans-serif; font-size: 1.1rem; font-weight: 700; color: #18181b; line-height: 1.3; margin-bottom: 8px; min-height: 1.5em; letter-spacing: -0.02em; }
        .pv-title-placeholder { color: #d4d4d8; font-style: italic; font-weight: 400; }
        .pv-description { font-size: 0.82rem; color: #71717a; line-height: 1.6; margin-bottom: 16px; font-weight: 400; font-family: 'Inter', system-ui, sans-serif; }
        .pv-description p { margin-bottom: 4px; }
        .pv-description strong { font-weight: 600; color: #3f3f46; }
        .pv-description blockquote { border-left: 2px solid #7c3aed; padding-left: 8px; color: #a1a1aa; font-style: italic; margin: 4px 0; }
        .pv-description a { color: #7c3aed; }
        .pv-desc-placeholder { font-style: italic; color: #d4d4d8; }
        .pv-divider { height: 1px; background: #f0f0f2; margin: 14px 0; }
        .pv-price-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .pv-price { font-size: 1.4rem; font-weight: 700; color: #18181b; font-family: 'Inter', system-ui, sans-serif; }
        .pv-price.free { color: #16a34a; font-size: 1rem; font-weight: 600; background: #f0fdf4; padding: 4px 10px; border-radius: 20px; }
        .pv-price-placeholder { color: #d4d4d8; font-size: 1rem; font-style: italic; font-family: 'Inter', system-ui, sans-serif; }
        .pv-file-info { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; color: #a1a1aa; margin-bottom: 14px; font-family: 'Inter', system-ui, sans-serif; }
        .pv-buy-btn { width: 100%; padding: 12px; background: #18181b; color: white; border: none; border-radius: 10px; font-size: 0.9rem; font-weight: 600; font-family: 'Inter', system-ui, sans-serif; cursor: default; text-align: center; }
        .pv-buy-btn.free-btn { background: #16a34a; }
      `}</style>

      <div className="page-layout">

        {/* FORM */}
        <div className="up-wrap">
          <div className="up-inner">

            <div className="up-header">
              <h1>Define your product</h1>
              <p>Add product info, pricing structure, thumbnail and images.</p>
            </div>

            {/* Details */}
            <div className="up-card">
              <div className="up-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <h2>Details</h2>
              </div>
              <div className="up-card-body">
                <label className="up-label">Title <span className="req">*</span></label>
                <input className="up-input" placeholder="Enter product title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <div style={{ height: 14 }} />
                <label className="up-label">Description</label>
                <div className="up-editor-wrap">
                  <div className="up-toolbar">
                    <button className={`up-toolbar-btn ${editor?.isActive("bold") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBold().run(); }} title="Bold"><strong>B</strong></button>
                    <button className={`up-toolbar-btn ${editor?.isActive("italic") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleItalic().run(); }} title="Italic"><em>I</em></button>
                    <button className={`up-toolbar-btn ${editor?.isActive("underline") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleUnderline().run(); }} title="Underline" style={{ textDecoration: "underline" }}>U</button>
                    <button className={`up-toolbar-btn ${editor?.isActive("strike") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleStrike().run(); }} title="Strikethrough" style={{ textDecoration: "line-through" }}>S</button>
                    <div className="up-toolbar-divider" />
                    <button className={`up-toolbar-btn ${editor?.isActive("blockquote") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().toggleBlockquote().run(); }} title="Quote">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
                    </button>
                    <div className="up-toolbar-divider" />
                    <button className={`up-toolbar-btn ${editor?.isActive("link") ? "active" : ""}`} onMouseDown={(e) => { e.preventDefault(); addLink(); }} title="Insert Link">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                    <button className="up-toolbar-btn" onMouseDown={(e) => { e.preventDefault(); addImage(); }} title="Insert Image">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </button>
                    <div className="up-toolbar-divider" />
                    <button className="up-toolbar-btn" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().undo().run(); }} title="Undo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
                    </button>
                    <button className="up-toolbar-btn" onMouseDown={(e) => { e.preventDefault(); editor?.chain().focus().redo().run(); }} title="Redo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
                    </button>
                  </div>
                  <EditorContent editor={editor} />
                </div>
                <p className="up-hint">A clear description helps customers understand your product.</p>
              </div>
            </div>

            {/* Product File */}
            <div className="up-card">
              <div className="up-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                <h2>Product file <span className="required">*</span></h2>
              </div>
              <div className="up-card-body">
                <div className="up-select-grid" style={{ marginBottom: 16 }}>
                  <div className={`up-select-card ${type === "video" ? "active" : ""}`} onClick={() => { setType("video"); setFile(null); }}>
                    {type === "video" && <span className="up-check-icon"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>}
                    <div className="up-select-card-title">Video</div>
                    <div className="up-select-card-desc">Upload a video file for buyers</div>
                  </div>
                  <div className={`up-select-card ${type === "digital" ? "active" : ""}`} onClick={() => { setType("digital"); setFile(null); }}>
                    {type === "digital" && <span className="up-check-icon"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>}
                    <div className="up-select-card-title">Digital Product</div>
                    <div className="up-select-card-desc">PDF, ZIP, or any digital file</div>
                  </div>
                </div>
                <div className="up-dropzone" onClick={() => fileInputRef.current?.click()}>
                  <div className="up-dropzone-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                  </div>
                  <p>Drag it here, or <a onClick={(e) => e.stopPropagation()}>click to browse</a></p>
                  <p className="up-dropzone-sub">{type === "video" ? "MP4, MOV, AVI supported" : "PDF, ZIP, any file accepted"}</p>
                  <input ref={fileInputRef} type="file" accept={type === "video" ? "video/*" : "*"} style={{ display: "none" }} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                {file && (
                  <div className="up-file-chosen">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</span>
                    <button onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", color: "#a1a1aa", flexShrink: 0, borderRadius: "4px" }} onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")} onMouseLeave={e => (e.currentTarget.style.color = "#a1a1aa")} title="Remove file">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Pricing */}
            <div className="up-card">
              <div className="up-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <h2>Pricing</h2>
              </div>
              <div className="up-card-body">
                <p className="up-hint" style={{ marginBottom: 14 }}>Choose a pricing structure that's suitable for you.</p>
                <div className="up-select-grid">
                  <div className={`up-select-card ${!isFree ? "active" : ""}`} onClick={() => setIsFree(false)}>
                    {!isFree && <span className="up-check-icon"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>}
                    <div className="up-select-card-title">Regular price</div>
                    <div className="up-select-card-desc">Charge a regular fee</div>
                  </div>
                  <div className={`up-select-card ${isFree ? "active" : ""}`} onClick={() => setIsFree(true)}>
                    {isFree && <span className="up-check-icon"><svg viewBox="0 0 12 12"><polyline points="2 6 5 9 10 3"/></svg></span>}
                    <div className="up-select-card-title">Lead magnet</div>
                    <div className="up-select-card-desc">Give it away for free</div>
                  </div>
                </div>
                {!isFree && (
                  <div className="up-price-input-wrap">
                    <label className="up-label" style={{ marginBottom: 8 }}>Price <span className="req">*</span></label>
                    <div style={{ position: "relative" }}>
                      <span className="up-price-symbol">₹</span>
                      <input className="up-input up-price-input" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail */}
            <div className="up-card">
              <div className="up-card-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <h2>Thumbnail</h2>
              </div>
              <div className="up-card-body">
                <p className="up-hint" style={{ marginBottom: 14 }}>Upload a thumbnail of your product.</p>
                <div className="up-dropzone" onClick={() => thumbInputRef.current?.click()}>
                  <div className="up-dropzone-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                  </div>
                  <p>Drag it here, or <a onClick={(e) => e.stopPropagation()}>click to browse</a></p>
                  <p className="up-dropzone-sub">Supports JPEG, PNG, GIF, WEBP</p>
                  <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbChange} />
                </div>
                {thumbPreview && (
                  <div style={{ position: "relative", marginTop: 12 }}>
                    <img src={thumbPreview} alt="Thumbnail preview" className="up-thumb-preview" style={{ marginTop: 0 }} />
                    <button
                      onClick={() => { setThumb(null); setThumbPreview(null); if (thumbInputRef.current) thumbInputRef.current.value = ""; }}
                      style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", backdropFilter: "blur(4px)" }}
                      title="Remove thumbnail"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="up-submit-row">
              <button className="up-btn" onClick={upload} disabled={loading}>
                {loading && <span className="up-spinner" />}
                {loading ? "Uploading..." : "Create product"}
              </button>
            </div>

          </div>
        </div>

        {/* LIVE PREVIEW */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3>Preview</h3>
            <span className="preview-live-dot">Live</span>
          </div>
          <div className="preview-body">
            <div className="pv-card">
              <div className="pv-thumb">
                {thumbPreview ? (
                  <img src={thumbPreview} alt="thumbnail" />
                ) : (
                  <div className="pv-thumb-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4d4d8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>No thumbnail yet</span>
                  </div>
                )}
                <span className="pv-type-badge">{type === "video" ? "🎬 Video" : "📁 Digital"}</span>
              </div>
              <div className="pv-content">
                <div className="pv-title">
                  {title ? title : <span className="pv-title-placeholder">Your product title...</span>}
                </div>
                <div className="pv-description">
                  {descriptionHtml && descriptionHtml !== "<p></p>" ? (
                    <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                  ) : (
                    <span className="pv-desc-placeholder">Your description will appear here...</span>
                  )}
                </div>
                <div className="pv-divider" />
                {file && (
                  <div className="pv-file-info">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    {file.name}
                  </div>
                )}
                <div className="pv-price-row">
                  {isFree ? (
                    <span className="pv-price free">Free</span>
                  ) : price ? (
                    <span className="pv-price">₹{price}</span>
                  ) : (
                    <span className="pv-price-placeholder">Set a price...</span>
                  )}
                </div>
                <div className={`pv-buy-btn ${isFree ? "free-btn" : ""}`}>
                  {isFree ? "Get for Free" : price ? `Buy for ₹${price}` : "Buy Now"}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}