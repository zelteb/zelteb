"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { 
  Type, 
  FileVideo, 
  FileText, 
  Upload as UploadIcon, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  RotateCcw, 
  RotateCw, 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Quote, 
  CheckCircle2, 
  X,
  IndianRupee
} from "lucide-react";

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
    editorProps: { 
      attributes: { 
        class: "prose prose-sm focus:outline-none min-h-[150px] p-4 font-sans leading-relaxed" 
      } 
    },
    onUpdate: ({ editor }) => {
      setDescriptionHtml(editor.getHTML());
    },
  });

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setThumb(f);
    if (f) setThumbPreview(URL.createObjectURL(f));
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

    const { error: dbError } = await supabase.from("videos").insert({
      creator_id: user.id,
      title,
      description: editor?.getHTML() || "",
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* FORM AREA */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-10">
          
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Product</h1>
            <p className="text-slate-500 mt-2">Fill in the details below to list your new digital asset.</p>
          </header>

          <section className="space-y-8">
            
            {/* General Info */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Type size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-lg">Basic Information</h2>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Product Title <span className="text-indigo-600">*</span></label>
                <input 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" 
                  placeholder="e.g. Cinematic Masterclass"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-inner">
                  <div className="bg-slate-900 flex items-center gap-1 p-1.5 flex-wrap">
                    <ToolbarBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} icon={<Bold size={16} />} />
                    <ToolbarBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} icon={<Italic size={16} />} />
                    <ToolbarBtn active={editor?.isActive("underline")} onClick={() => editor?.chain().focus().toggleUnderline().run()} icon={<UnderlineIcon size={16} />} />
                    <div className="w-px h-4 bg-slate-700 mx-1" />
                    <ToolbarBtn onClick={() => {
                      const url = prompt("URL:");
                      if (url) editor?.chain().focus().setLink({ href: url }).run();
                    }} icon={<LinkIcon size={16} />} />
                    <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} icon={<Quote size={16} />} />
                    <div className="w-px h-4 bg-slate-700 mx-1" />
                    <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} icon={<RotateCcw size={16} />} />
                    <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} icon={<RotateCw size={16} />} />
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <UploadIcon size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-lg">Product File</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectCard active={type === "video"} onClick={() => setType("video")} title="Video Content" desc="MP4, MOV files" icon={<FileVideo size={18}/>} />
                <SelectCard active={type === "digital"} onClick={() => setType("digital")} title="Digital File" desc="PDF, ZIP, Ebooks" icon={<FileText size={18}/>} />
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-slate-200 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
              >
                <UploadIcon className="mx-auto mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                <p className="text-sm font-medium text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">{type === "video" ? "MP4, MOV up to 500MB" : "Any digital file up to 100MB"}</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <CheckCircle2 size={18} className="text-indigo-600" />
                    <span className="text-sm font-medium truncate text-indigo-900">{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)} className="text-indigo-400 hover:text-red-500"><X size={18}/></button>
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <IndianRupee size={20} className="text-indigo-600" />
                <h2 className="font-semibold text-lg">Pricing</h2>
              </div>
              
              <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
                <button onClick={() => setIsFree(false)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${!isFree ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Paid</button>
                <button onClick={() => setIsFree(true)} className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${isFree ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Free</button>
              </div>

              {!isFree && (
                <div className="relative max-w-[200px]">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input 
                    type="number" 
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none" 
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              )}
            </div>

            <button 
              onClick={upload}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Publish Product"}
            </button>
          </section>
        </div>
      </main>

      {/* PREVIEW SIDEBAR */}
      <aside className="hidden xl:flex w-[400px] border-l border-slate-200 bg-white/50 backdrop-blur-sm sticky top-0 h-screen p-8 flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Preview</h3>
          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> PREVIEW
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
          <div className="aspect-video bg-slate-100 relative group overflow-hidden">
            {thumbPreview ? (
              <img src={thumbPreview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                <ImageIcon size={48} strokeWidth={1} />
                <span className="text-xs mt-2">No Thumbnail</span>
              </div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-wider">
              {type}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <h4 className="text-xl font-bold leading-tight min-h-[1.4em]">
              {title || <span className="text-slate-200 italic font-normal">Product Title</span>}
            </h4>
            
            <div className="text-slate-500 text-sm line-clamp-3 overflow-hidden min-h-[3em]">
              {descriptionHtml && descriptionHtml !== "<p></p>" ? (
                <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              ) : "Describe what makes your product special..."}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className={`text-2xl font-black ${isFree ? 'text-emerald-500' : 'text-slate-900'}`}>
                {isFree ? "FREE" : price ? `₹${price}` : "₹0"}
              </span>
              <button className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-lg">Buy Now</button>
            </div>
          </div>
        </div>

        <div className="mt-auto p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <p className="text-xs text-indigo-700 leading-relaxed italic">
            "Thumbnails with high contrast and clear text typically perform 40% better."
          </p>
        </div>
      </aside>

    </div>
  );
}

/* Sub-components for cleaner code */

function ToolbarBtn({ active, onClick, icon }: { active?: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button 
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={`p-2 rounded hover:bg-slate-700 transition-colors ${active ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
    >
      {icon}
    </button>
  );
}

function SelectCard({ active, onClick, title, desc, icon }: { active: boolean, onClick: () => void, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${active ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
    >
      <div className={`mb-3 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>{icon}</div>
      <div className={`text-sm font-bold ${active ? 'text-indigo-900' : 'text-slate-700'}`}>{title}</div>
      <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">{desc}</div>
    </div>
  );
}