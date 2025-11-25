import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, Camera, XCircle, 
  Image as ImageIcon, Wand2, Type, Monitor, 
  Box, Upload, ScanEye, Sparkles, ChevronDown, ChevronUp, Mountain,
  Pipette, Key, ExternalLink, AlertCircle, Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('builder'); 
  const fileInputRef = useRef(null);
  
  // API Key & Model State
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-1.5-pro'); 
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  const [formData, setFormData] = useState({
    aspectRatio: '--ar 1:1',
    artType: 'Realistic (สมจริง/ภาพถ่าย)',
    subjectType: 'Person (คน)', 
    subjectDetail: '',
    shotType: 'Portrait (Close-up)',
    action: '',
    background: '', 
    lighting: 'Soft Light (แสงนุ่ม)',
    camera: '85mm Lens (เลนส์ถ่ายคนสวย)',
    composition: 'Center (จัดกึ่งกลาง)',
    colorTone: 'Vibrant (สดใส)',
    headtext: '',
    headtextColor: '',
    subtext: '',
    subtextColor: '',
    detailtext: '',
    detailtextColor: '',
    texture: '8K Resolution',
    negative: 'text, watermark, blurry, low quality, distorted, bad anatomy, ugly',
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // --- Database of Options ---
  const options = {
    ratios: [
      { label: "1:1 Square", value: "--ar 1:1" },
      { label: "16:9 Landscape", value: "--ar 16:9" },
      { label: "9:16 TikTok/Story", value: "--ar 9:16" },
      { label: "4:3 Photo", value: "--ar 4:3" },
      { label: "21:9 Cinema", value: "--ar 21:9" },
    ],
    subjectTypes: ["Person (คน)", "Animal (สัตว์)", "Object (วัตถุ)", "Scenery (สถานที่/วิว)", "Abstract (นามธรรม)"],
    artTypes: [
      "Realistic (สมจริง/ภาพถ่าย)", "3D Render (งานสามมิติ)", "Flat Design (งานแบน 2D)", 
      "Line Art (ลายเส้น)", "Infographic (อินโฟกราฟิก)", "Anime (อนิเมะ)", 
      "Oil Painting (สีน้ำมัน)", "Isometric 3D (ไอโซเมตริก)", "Vector Art (เวกเตอร์)",
      "Pixel Art (พิกเซล)", "Cyberpunk", "Watercolor (สีน้ำ)"
    ],
    shotTypes: [
      "Extreme Close-up (เห็นรูขุมขน/ดวงตา)", "Close-up (ใบหน้า/หัวไหล่)", 
      "Medium Shot (ครึ่งตัว)", "Full Body (เต็มตัว)", 
      "Wide Shot (มุมกว้างเห็นฉาก)", "Over the Shoulder (มองผ่านไหล่)"
    ],
    cameras: [
      "85mm Lens (เลนส์พอร์เทรต)", "35mm Lens (สตรีท/ทั่วไป)", "50mm Lens (สายตาคน)",
      "Wide Angle (มุมกว้าง)", "Macro (มาโคร/ระยะใกล้มาก)", "GoPro/Fisheye (ตาปลา)",
      "Telephoto (ดึงภาพไกล)", "Drone View (มุมโดรน)", "Bokeh (หน้าชัดหลังเบลอ)"
    ],
    lightings: [
      "Golden Hour (แสงทองยามเย็น)", "Studio Lighting (แสงสตูดิโอ)", "Soft Light (แสงนุ่ม)",
      "Hard Light (แสงแข็ง/เงาชัด)", "Neon Light (แสงนีออน)", "Volumetric Lighting (แสงทะลุควัน)",
      "Natural Light (แสงธรรมชาติ)", "Cinematic Lighting (แสงหนัง)", "Rembrandt (แสงเฉียง)"
    ],
    compositions: [
      "Center (จัดกึ่งกลาง)", "Rule of Thirds (กฎสามส่วน)", "Symmetrical (สมมาตร)",
      "Low Angle (มุมเสย)", "High Angle (มุมกด)", "Bird's Eye View (มุมนก)",
      "Knolling (วางเรียงกัน)", "Minimalist Space (เหลือที่ว่าง)"
    ],
    colorTones: [
      "Vibrant (สดใส)", "Pastel (พาสเทล)", "Black & White (ขาวดำ)", 
      "Earth Tone (เอิร์ธโทน)", "Cyberpunk Neon", "Warm Tone (โทนอุ่น)", 
      "Cool Tone (โทนเย็น)", "Muted (ตุ่นๆ/คุมโทน)"
    ],
    backgrounds: [
      "Solid Color (สีพื้น)", "White Background (พื้นขาว)", "Gradient Background (ไล่สี)",
      "City Street (ถนนในเมือง)", "Nature/Forest (ป่า/ธรรมชาติ)", "Space/Galaxy (อวกาศ)",
      "Office Interior (ออฟฟิศ)", "Abstract Pattern (ลวดลายนามธรรม)", "Minimalist Room (ห้องมินิมอล)"
    ],
    textures: ["4K Resolution", "8K Resolution", "Hyper-Realistic", "Highly Detailed", "Smooth Finish", "Rough Texture"],
    presetColors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
      { name: "Red", hex: "#EF4444" },
      { name: "Blue", hex: "#3B82F6" },
      { name: "Yellow", hex: "#FACC15" },
      { name: "Green", hex: "#22C55E" },
      { name: "Gold", hex: "#FFD700" },
      { name: "Purple", hex: "#A855F7" },
      { name: "Orange", hex: "#F97316" },
      { name: "Silver", hex: "#C0C0C0" },
    ],
    aiModels: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Most Stable)' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Fast)' },
      { id: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro 002 (New)' },
      { id: 'gemini-1.5-flash-002', name: 'Gemini 1.5 Flash 002 (New)' },
      { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B' },
    ]
  };

  // Moved generatePrompt INSIDE useEffect to fix "missing dependency" warning
  useEffect(() => {
    const clean = (text) => text ? text.split(' (')[0] : '';

    const generatePrompt = () => {
      let parts = [];
      parts.push(clean(formData.artType));
      if (formData.subjectType.includes("Person")) {
        parts.push(`${clean(formData.shotType)} of a ${formData.subjectDetail || "person"}`);
        if (formData.action) parts.push(`action: ${formData.action}`);
      } else {
        parts.push(formData.subjectDetail || "subject");
        if (formData.shotType && !formData.subjectType.includes("Scenery")) {
           parts.push(clean(formData.shotType));
        }
      }
      if (formData.background) parts.push(`Background: ${clean(formData.background)}`); 
      parts.push(clean(formData.lighting));
      parts.push(clean(formData.camera));
      parts.push(clean(formData.composition));
      parts.push(clean(formData.colorTone));
  
      let textSpecs = [];
      const formatTextPrompt = (role, text, color) => {
          let p = [];
          if (text) p.push(`"${text}"`);
          if (color) p.push(`in ${color}`);
          if (p.length > 0) return `${role} ${p.join(' ')}`;
          return null;
      };
      const head = formatTextPrompt("Headline", formData.headtext, formData.headtextColor);
      if (head) textSpecs.push(head);
      const sub = formatTextPrompt("Subtext", formData.subtext, formData.subtextColor);
      if (sub) textSpecs.push(sub);
      const detail = formatTextPrompt("Detail text", formData.detailtext, formData.detailtextColor);
      if (detail) textSpecs.push(detail);
      if (textSpecs.length > 0) parts.push(`Text Design: [${textSpecs.join(', ')}]`);
  
      parts.push(clean(formData.texture));
      let prompt = parts.filter(Boolean).join(', ');
      if (formData.negative) prompt += ` --no ${formData.negative}`;
      prompt += ` ${formData.aspectRatio}`;
  
      setGeneratedPrompt(prompt);
    };

    generatePrompt();
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelect = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
        setIsAnalyzing(false);
        setAnalysisError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImageReal = async () => {
    if (!apiKey) {
      alert("กรุณาใส่ API Key ก่อนครับ (หรือใช้ปุ่ม Simulation หากไม่มี Key)");
      setShowApiKeyInput(true);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError('');

    try {
      const base64Data = uploadedImage.split(',')[1];
      
      const payload = {
        contents: [{
          parts: [
            { text: "Analyze this image and return a JSON object with these keys mapping to the best fit description: artType, subjectType, subjectDetail (brief description), lighting, colorTone, shotType, camera, background. Try to match standard AI prompt terminology." },
            { inline_data: { mime_type: "image/jpeg", data: base64Data } }
          ]
        }]
      };

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.error) {
        console.error("Gemini API Error:", data.error);
        throw new Error(data.error.message);
      }

      if (!data.candidates || !data.candidates[0].content) {
         throw new Error("AI did not return any content.");
      }

      const textResponse = data.candidates[0].content.parts[0].text;
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Could not parse AI response JSON");
      
      const result = JSON.parse(jsonMatch[0]);

      const findBestMatch = (list, val) => {
         if (!val) return list[0];
         return list.find(opt => opt.toLowerCase().includes(val.toLowerCase())) || val;
      };

      setFormData(prev => ({
        ...prev,
        artType: findBestMatch(options.artTypes, result.artType),
        subjectType: findBestMatch(options.subjectTypes, result.subjectType),
        subjectDetail: result.subjectDetail || '',
        lighting: findBestMatch(options.lightings, result.lighting),
        colorTone: findBestMatch(options.colorTones, result.colorTone),
        shotType: findBestMatch(options.shotTypes, result.shotType),
        camera: findBestMatch(options.cameras, result.camera),
        background: findBestMatch(options.backgrounds, result.background),
      }));

      setActiveTab('builder');
      alert(`✅ วิเคราะห์ภาพสำเร็จ! (Model: ${selectedModel})`);

    } catch (err) {
      console.error(err);
      setAnalysisError(`Error (${selectedModel}): ${err.message}. ลองเปลี่ยน Model ดูนะครับ`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeImageMock = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setFormData(prev => ({
        ...prev,
        artType: '3D Render (งานสามมิติ)',
        subjectType: 'Person (คน)',
        subjectDetail: 'Mockup Data: Cute girl wearing yellow hoodie',
        lighting: 'Soft Light (แสงนุ่ม)',
        colorTone: 'Pastel (พาสเทล)',
        shotType: 'Close-up (ใบหน้า/หัวไหล่)'
      }));
      setActiveTab('builder');
      alert("⚠️ นี่คือโหมดจำลอง (Simulation)");
    }, 1500);
  };

  const copyToClipboard = () => {
    if (!generatedPrompt) return;
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(generatedPrompt).then(showSuccess).catch(useFallback);
    } else {
      useFallback();
    }
  };

  const useFallback = () => {
    const textArea = document.createElement("textarea");
    textArea.value = generatedPrompt;
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showSuccess();
    } catch (err) {
      alert('Manual Copy Required');
    }
    document.body.removeChild(textArea);
  };

  const showSuccess = () => {
    const btn = document.getElementById('copyBtn');
    if (btn) {
       const originalContent = btn.innerHTML;
       btn.innerHTML = '<span class="flex items-center gap-2">Copied!</span>';
       setTimeout(() => btn.innerHTML = originalContent, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 pb-32">
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg text-slate-900 shadow-lg shadow-orange-500/20">
              <Sparkles size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Nano Banana</h1>
              <span className="text-xs text-slate-400 tracking-wider">OMNI CREATOR</span>
            </div>
          </div>
          
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button 
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'builder' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Prompt Builder
            </button>
            <button 
              onClick={() => setActiveTab('image-to-prompt')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'image-to-prompt' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              <ScanEye size={16}/> Image to Prompt
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'builder' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Box size={20}/></div>
                  <h2 className="text-lg font-bold text-white">1. สิ่งที่จะสร้าง (Core Concept)</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                   <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">รูปแบบงานศิลปะ (Art Style)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {options.artTypes.slice(0, 8).map(opt => (
                        <SelectButton 
                          key={opt} 
                          active={formData.artType === opt} 
                          onClick={() => handleSelect('artType', opt)}
                          label={opt.split(' (')[0]}
                          sub={opt.split(' (')[1]?.replace(')', '')}
                        />
                      ))}
                    </div>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">ประเภทวัตถุ (Subject Type)</label>
                      <select name="subjectType" value={formData.subjectType} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                        {options.subjectTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                   </div>

                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">ขนาดภาพ (Size)</label>
                      <select name="aspectRatio" value={formData.aspectRatio} onChange={handleChange} className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none">
                        {options.ratios.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                   </div>

                   <div className="col-span-2 space-y-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                      <label className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                        รายละเอียด{formData.subjectType.split(' ')[0]} (Subject Detail)
                      </label>
                      <textarea name="subjectDetail" value={formData.subjectDetail} onChange={handleChange} rows="2" className="w-full bg-slate-800 border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 outline-none resize-none" placeholder={formData.subjectType.includes("Person") ? "เช่น หญิงสาวผมบลอนด์ ใส่ชุดสูทสีแดง..." : "เช่น แมวเปอร์เซียสีขาว นั่งบนโซฟา..."}></textarea>

                      {(formData.subjectType.includes("Person") || formData.subjectType.includes("Animal")) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <FormSelect label="ระยะภาพ (Shot Size)" name="shotType" value={formData.shotType} options={options.shotTypes} onChange={handleChange} />
                          <div>
                            <label className="text-xs font-bold text-slate-400 mb-1 block">การกระทำ (Action)</label>
                            <input type="text" name="action" value={formData.action} onChange={handleChange} placeholder="เช่น กำลังวิ่ง, ดื่มกาแฟ..." className="w-full bg-slate-800 border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"/>
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Camera size={20}/></div>
                  <h2 className="text-lg font-bold text-white">2. เทคนิคภาพและฉาก (Scene & Camera)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                     <FormInput
                        label="ฉากหลัง/บรรยากาศ (Background/Scene)"
                        name="background"
                        value={formData.background}
                        onChange={handleChange}
                        placeholder="เช่น ป่าดิบชื้น, อวกาศ, สตูดิโอสีขาว..."
                        suggestions={options.backgrounds}
                        onSelectSuggestion={handleSelect}
                        icon={<Mountain size={14}/>}
                     />
                  </div>
                  
                  <FormSelect label="มุมกล้อง/เลนส์ (Lens)" name="camera" value={formData.camera} options={options.cameras} onChange={handleChange} />
                  <FormSelect label="แสง (Lighting)" name="lighting" value={formData.lighting} options={options.lightings} onChange={handleChange} />
                  <FormSelect label="การจัดวาง (Composition)" name="composition" value={formData.composition} options={options.compositions} onChange={handleChange} />
                  <FormSelect label="โทนสี (Color Tone)" name="colorTone" value={formData.colorTone} options={options.colorTones} onChange={handleChange} />
                </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400"><Type size={20}/></div>
                    <h2 className="text-lg font-bold text-white">3. ข้อความและสี (Text & Colors)</h2>
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-400 items-center bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
                    <Pipette size={12}/> Select specific colors
                  </div>
                </div>
                
                <div className="space-y-6">
                  <ColorRow 
                    label="Headtext (ข้อความหลัก)" 
                    textName="headtext" 
                    colorName="headtextColor" 
                    textValue={formData.headtext} 
                    colorValue={formData.headtextColor} 
                    onChange={handleChange} 
                    placeholder='เช่น "SALE 50%"' 
                    presets={options.presetColors}
                    onSelectColor={handleSelect}
                  />

                  <ColorRow 
                    label="Subtext (ข้อความรอง)" 
                    textName="subtext" 
                    colorName="subtextColor" 
                    textValue={formData.subtext} 
                    colorValue={formData.subtextColor} 
                    onChange={handleChange} 
                    placeholder='เช่น "Limited Time Offer"' 
                    presets={options.presetColors}
                    onSelectColor={handleSelect}
                  />

                  <ColorRow 
                    label="Detailtext (รายละเอียด)" 
                    textName="detailtext" 
                    colorName="detailtextColor" 
                    textValue={formData.detailtext} 
                    colorValue={formData.detailtextColor} 
                    onChange={handleChange} 
                    placeholder='เช่น "www.website.com"' 
                    presets={options.presetColors}
                    onSelectColor={handleSelect}
                  />
                </div>
              </div>

               <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
                 <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Monitor size={20}/></div>
                  <h2 className="text-lg font-bold text-white">4. คุณภาพ (Quality & Resolution)</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                   {options.textures.map((tech) => (
                      <button 
                        key={tech}
                        onClick={() => handleSelect('texture', tech)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          formData.texture === tech 
                          ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/40' 
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {tech}
                      </button>
                   ))}
                </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sticky top-24 shadow-2xl">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                     <Wand2 size={18}/> Generated Prompt
                   </h3>
                 </div>
                 
                 <div className="bg-slate-950 rounded-xl p-4 min-h-[180px] text-sm font-mono text-slate-300 leading-relaxed border border-slate-800 mb-4 break-words">
                   {generatedPrompt}
                 </div>

                 <button 
                  id="copyBtn"
                  onClick={copyToClipboard}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                 >
                   <Copy size={18} /> Copy Prompt
                 </button>

                 <div className="mt-6 pt-6 border-t border-slate-700">
                    <label className="text-xs font-bold text-red-400 flex items-center gap-1 mb-2">
                      <XCircle size={14}/> Negative Prompt
                    </label>
                    <textarea 
                      name="negative"
                      value={formData.negative}
                      onChange={handleChange}
                      rows="3"
                      className="w-full bg-slate-900 border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-400 focus:border-red-500 outline-none resize-none"
                    ></textarea>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center space-y-6 shadow-2xl">
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanEye size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">แยก Prompt จากรูปภาพ</h2>
              <p className="text-slate-400 mb-6">อัปโหลดภาพตัวอย่าง เพื่อให้ AI ช่วยวิเคราะห์ Style และ Subject</p>

              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 mb-6 max-w-lg mx-auto">
                 <button 
                   onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                   className="text-xs font-bold text-yellow-500 flex items-center justify-center gap-1 w-full hover:text-yellow-400"
                 >
                   <Key size={14}/> {apiKey ? 'API Key Connected ✅' : 'ตั้งค่า Gemini API Key (เพื่อการสแกนจริง)'} {showApiKeyInput ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                 </button>
                 
                 {showApiKeyInput && (
                   <div className="mt-3 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <input 
                          type="password" 
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Paste your Gemini API Key here..."
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] text-slate-400 mb-1 block flex items-center gap-1"><Cpu size={10}/> Select AI Model (Change if error occurs)</label>
                        <select 
                          value={selectedModel}
                          onChange={(e) => setSelectedModel(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none"
                        >
                          {options.aiModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-700/50">
                        <span>จำเป็นต้องใช้ API Key เพื่อให้ AI มองเห็นภาพได้จริง</span>
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                          Get Free Key <ExternalLink size={10}/>
                        </a>
                      </div>
                   </div>
                 )}
              </div>

              <div 
                className="border-2 border-dashed border-slate-600 hover:border-indigo-500 hover:bg-slate-700/50 rounded-2xl p-8 transition-all cursor-pointer relative overflow-hidden group"
                onClick={() => fileInputRef.current.click()}
              >
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                
                {uploadedImage ? (
                  <div className="relative">
                     <img src={uploadedImage} alt="Uploaded" className="max-h-64 mx-auto rounded-lg shadow-lg" />
                     {isAnalyzing && (
                       <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
                            <span className="text-white font-medium text-sm animate-pulse">กำลังวิเคราะห์ข้อมูลภาพ...</span>
                          </div>
                       </div>
                     )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="mx-auto text-slate-500 group-hover:text-indigo-400 transition-colors" size={40} />
                    <p className="text-sm text-slate-400">คลิกเพื่ออัปโหลดภาพ หรือลากไฟล์มาวางที่นี่</p>
                  </div>
                )}
              </div>

              {analysisError && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 flex items-center justify-center gap-2">
                  <AlertCircle size={16}/> {analysisError}
                </div>
              )}

              {uploadedImage && !isAnalyzing && (
                 <div className="flex flex-col md:flex-row gap-3 justify-center">
                   <button 
                    onClick={analyzeImageReal}
                    className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 justify-center ${apiKey ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}
                    title={!apiKey ? "กรุณาใส่ API Key ก่อนใช้งาน" : ""}
                   >
                     <Sparkles size={18}/> Analyze Real (ใช้ AI จริง)
                   </button>

                   <button 
                    onClick={analyzeImageMock}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 justify-center"
                   >
                     <ScanEye size={18}/> Simulation (โหมดจำลอง)
                   </button>
                 </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function SelectButton({ active, onClick, label, sub }) {
  return (
    <button
      onClick={onClick}
      className={`relative p-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${
        active 
        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/50' 
        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'
      }`}
    >
      <div className="text-sm font-bold">{label}</div>
      {sub && <div className="text-[10px] opacity-70">{sub}</div>}
      {active && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></div>}
    </button>
  );
}

function FormSelect({ label, name, value, options, onChange, placeholder }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 mb-2 block">{label}</label>
      <div className="relative">
        <select 
          name={name} 
          value={value} 
          onChange={onChange}
          className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={16}/>
      </div>
    </div>
  );
}

function FormInput({ label, name, value, onChange, placeholder, suggestions, onSelectSuggestion, icon }) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  return (
    <div className="relative group">
       <label className="text-xs font-bold text-slate-400 mb-2 block flex items-center gap-1">
         {icon} {label}
       </label>
       <input 
         type="text"
         name={name}
         value={value}
         onChange={onChange}
         onFocus={() => setShowSuggestions(true)}
         placeholder={placeholder}
         className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
         autoComplete="off"
       />
       {suggestions && (
         <div className="flex flex-wrap gap-2 mt-2">
            {suggestions.slice(0, 5).map((s) => (
              <button 
                key={s} 
                onClick={() => {
                  onSelectSuggestion(name, s);
                  setShowSuggestions(false);
                }}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded px-2 py-1 transition-colors"
              >
                {s.split(' (')[0]}
              </button>
            ))}
         </div>
       )}
       {showSuggestions && suggestions && (
         <div className="absolute z-20 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto hidden group-focus-within:block">
            {suggestions.map((s, idx) => (
              <div 
                key={idx} 
                className="px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm text-slate-300 border-b border-slate-700/50 last:border-0"
                onMouseDown={() => { 
                  onSelectSuggestion(name, s); 
                  setShowSuggestions(false); 
                }}
              >
                {s}
              </div>
            ))}
         </div>
       )}
    </div>
  );
}

function ColorRow({ label, textName, colorName, textValue, colorValue, onChange, placeholder, presets, onSelectColor }) {
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="md:col-span-2">
         <label className="text-xs font-bold text-slate-400 mb-1 block">{label}</label>
         <input 
           type="text"
           name={textName}
           value={textValue}
           onChange={onChange}
           placeholder={placeholder}
           className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-purple-500 outline-none"
         />
      </div>
      
      <div className="md:col-span-1">
         <label className="text-xs font-bold text-slate-400 mb-1 block">Color ({colorValue || 'None'})</label>
         <div className="bg-slate-900 border border-slate-600 rounded-xl p-2 flex flex-wrap gap-1.5 justify-center md:justify-start">
            {presets.slice(0, 5).map((c) => (
              <button
                key={c.name}
                onClick={() => onSelectColor(colorName, c.name)}
                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${colorValue === c.name ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            
            <div className="relative group">
              <label 
                className={`w-6 h-6 rounded-full border-2 border-slate-500 flex items-center justify-center cursor-pointer hover:border-white bg-slate-800 ${showCustom ? 'border-white' : ''}`}
                title="Custom Color"
              >
                <span className="text-[10px] text-white font-bold">+</span>
                <input 
                  type="color" 
                  className="absolute opacity-0 w-full h-full top-0 left-0 cursor-pointer"
                  onChange={(e) => onSelectColor(colorName, e.target.value)}
                />
              </label>
            </div>
         </div>
      </div>
    </div>
  );
}