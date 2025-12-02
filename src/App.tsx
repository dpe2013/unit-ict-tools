import React, { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileText, FileSpreadsheet, Presentation, Music, RefreshCw, CheckCircle, AlertCircle, Menu, X, Video, Monitor, Keyboard, Images } from 'lucide-react';

// --- HELPER: Load Script ---
const useScript = (url: string) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    }
  }, [url]);
};

// --- KOMPONEN BANNER INTERAKTIF ---
const InteractiveBanner = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const bannerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (bannerRef.current) {
      const { left, top, width, height } = bannerRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      setOffset({ x: x * 20, y: y * 20 }); 
    }
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={bannerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden mb-8 shadow-2xl group perspective-1000"
    >
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-100 ease-out scale-110"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1587614382346-4ec70e388b28?q=80&w=2070&auto=format&fit=crop')`,
          transform: `scale(1.1) translate(${-offset.x}px, ${-offset.y}px)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-blue-900/40 mix-blend-multiply"></div>
      <div 
        className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 transition-transform duration-100 ease-out"
        style={{
          transform: `translate(${offset.x * 0.5}px, ${offset.y * 0.5}px)`,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg">Portal Rasmi</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
          Unit <span className="text-blue-400">ICT</span> Tools
        </h1>
        <p className="text-slate-200 mt-2 max-w-lg text-sm md:text-base font-medium drop-shadow-md">
          Memperkasa produktiviti digital dengan alatan pemprosesan pantas, selamat, dan efisien.
        </p>
      </div>
      <div className="absolute top-4 right-8 text-white/20 animate-bounce delay-100"><Monitor size={48} /></div>
      <div className="absolute bottom-8 right-20 text-white/10 animate-pulse"><Keyboard size={64} /></div>
    </div>
  );
};

// --- KOMPONEN IMAGE RESIZER ---
const ImageResizer = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<{ originalSize: number; newSize: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const targetSize = 800 * 1024; // 800KB
      let quality = 0.9;
      let width = img.width;
      let height = img.height;
      let resultBlob: Blob | null = null;
      let iterations = 0;
      const MAX_DIMENSION = 2000; 

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement('canvas');
      while (iterations < 10) {
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context failed");
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((b) => resolve(b), 'image/jpeg', quality);
        });

        if (!blob) throw new Error("Compression failed");
        resultBlob = blob;

        if (blob.size <= targetSize) break;

        if (quality > 0.5) quality -= 0.1;
        else {
          width = Math.floor(width * 0.9);
          height = Math.floor(height * 0.9);
        }
        iterations++;
      }

      if (resultBlob) {
        const reader = new FileReader();
        reader.readAsDataURL(resultBlob);
        reader.onloadend = () => {
          setCompressedImage(reader.result as string);
          setStats({ originalSize: file.size, newSize: resultBlob!.size });
          setIsProcessing(false);
        };
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (compressedImage) {
      const link = document.createElement('a');
      link.href = compressedImage;
      link.download = `compressed_${originalFile?.name.split('.')[0]}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
       <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-slate-800">Pengecil Gambar</h2>
          <p className="text-slate-500 mt-2 font-medium">Kecilkan saiz imej ke bawah 800KB</p>
       </div>
       {!compressedImage && !isProcessing && (
        <div onClick={() => fileInputRef.current?.click()} className="group border-4 border-dashed border-blue-200/60 bg-blue-50/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1">
          <input type="file" ref={fileInputRef} onChange={(e) => {const f = e.target.files?.[0]; if(f) {setOriginalFile(f); processImage(f);}}} className="hidden" accept="image/*"/>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <ImageIcon size={40} className="text-blue-600" />
          </div>
          <p className="font-bold text-lg text-slate-700">Klik Pilih Gambar</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG (Auto-Compress)</p>
        </div>
      )}
      {isProcessing && (
        <div className="text-center py-12">
           <RefreshCw className="animate-spin mx-auto text-blue-600 mb-4" size={32} />
           <p className="text-slate-600 font-medium">Sedang memproses...</p>
        </div>
      )}
      {compressedImage && stats && (
        <div className="bg-white/50 backdrop-blur-sm border border-white p-6 rounded-2xl text-center shadow-inner">
           <div className="flex justify-center items-end gap-2 mb-6">
             <span className="text-slate-400 text-sm line-through">{(stats.originalSize/1024).toFixed(1)} KB</span>
             <span className="text-green-600 font-bold text-3xl">{(stats.newSize/1024).toFixed(1)} KB</span>
           </div>
           <button onClick={handleDownload} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
             <Download size={20}/> Muat Turun Gambar
           </button>
           <button onClick={() => setCompressedImage(null)} className="mt-4 text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors">Proses Gambar Lain</button>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN PDF KE WORD ---
const PdfToWord = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [docBlob, setDocBlob] = useState<Blob | null>(null);
  const [conversionType, setConversionType] = useState<'text' | 'image' | null>(null);
  
  const convertPdf = async (pdfFile: File) => {
    setIsConverting(true);
    setConversionType(null);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullContent = "";
      let hasText = false;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        
        if (pageText.trim().length > 50) { 
            hasText = true;
            fullContent += `<p style="page-break-after: always;">${pageText}</p>`;
        } else {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: context, viewport: viewport }).promise;
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            fullContent += `<p><img src="${imgData}" width="${viewport.width * 0.75}pt" style="max-width:100%"></p><br style="page-break-after: always;" />`;
        }
      }

      setConversionType(hasText ? 'text' : 'image');
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
        <head><meta charset='utf-8'></head><body>${fullContent}</body></html>`;
      
      setDocBlob(new Blob(['\ufeff', htmlContent], { type: 'application/msword' }));
      setIsConverting(false);
    } catch (err) { setIsConverting(false); alert("Ralat memproses PDF"); console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">PDF ke Word</h2>
        <div className="flex items-center justify-center gap-2 text-indigo-600 text-sm font-medium mt-2 bg-indigo-50 py-1.5 px-3 rounded-full inline-flex border border-indigo-100">
          <AlertCircle size={14}/> Auto-Detect: Teks & Scan
        </div>
      </div>
      {!docBlob && !isConverting && (
        <div onClick={() => document.getElementById('pdfword')?.click()} className="group border-4 border-dashed border-indigo-200/60 bg-indigo-50/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-300 transform hover:-translate-y-1">
          <input id="pdfword" type="file" onChange={(e) => {const f=e.target.files?.[0]; if(f){setFile(f); convertPdf(f);}}} className="hidden" accept="application/pdf"/>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileText size={40} className="text-indigo-600" />
          </div>
          <p className="font-bold text-lg text-slate-700">Pilih Fail PDF</p>
        </div>
      )}
      {isConverting && <div className="text-center py-12"><RefreshCw className="animate-spin mx-auto text-indigo-600 w-12 h-12" /> <p className="text-slate-600 font-medium mt-4">Menganalisis kandungan...</p></div>}
      {docBlob && (
        <div className="bg-white/50 backdrop-blur-sm border border-white p-6 rounded-2xl text-center shadow-inner">
           <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
             <CheckCircle size={32} />
           </div>
           <h3 className="font-bold text-xl text-slate-800 mb-2">Dokumen Sedia!</h3>
           {conversionType === 'image' && (
             <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded mb-4">
               <strong>Nota:</strong> Fail scan dikesan. Teks telah ditukar sebagai gambar supaya kandungan tidak hilang.
             </p>
           )}
           <button onClick={() => {
             const link = document.createElement('a'); link.href = URL.createObjectURL(docBlob); link.download = `${file?.name.replace('.pdf','')}.doc`; link.click();
           }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
             <Download size={20}/> Muat Turun Word
           </button>
           <button onClick={() => setDocBlob(null)} className="mt-4 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">Tukar Fail Lain</button>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN PDF KE EXCEL ---
const PdfToExcel = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [csvBlob, setCsvBlob] = useState<Blob | null>(null);

  const convertToExcel = async (pdfFile: File) => {
    setIsConverting(true);
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let csvContent = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const rows: { [key: number]: string[] } = {};
        textContent.items.forEach((item: any) => {
          const y = Math.round(item.transform[5]); 
          if (!rows[y]) rows[y] = [];
          rows[y].push(item.str);
        });
        const sortedY = Object.keys(rows).map(Number).sort((a, b) => b - a);
        sortedY.forEach(y => {
           const rowText = rows[y].map(str => `"${str.replace(/"/g, '""')}"`).join(",");
           csvContent += rowText + "\n";
        });
        csvContent += "\n"; 
      }
      setCsvBlob(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
      setIsConverting(false);
    } catch (err) { setIsConverting(false); console.error(err); alert("Gagal tukar ke Excel"); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">PDF ke Excel</h2>
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium mt-2 bg-emerald-50 py-1.5 px-3 rounded-full inline-flex border border-emerald-100">
          <AlertCircle size={14}/> Susunan baris mungkin berbeza
        </div>
      </div>
      {!csvBlob && !isConverting && (
        <div onClick={() => document.getElementById('pdfexcel')?.click()} className="group border-4 border-dashed border-emerald-200/60 bg-emerald-50/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all duration-300 transform hover:-translate-y-1">
          <input id="pdfexcel" type="file" onChange={(e) => {const f=e.target.files?.[0]; if(f){setFile(f); convertToExcel(f);}}} className="hidden" accept="application/pdf"/>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <FileSpreadsheet size={40} className="text-emerald-600" />
          </div>
          <p className="font-bold text-lg text-slate-700">Pilih PDF</p>
        </div>
      )}
      {isConverting && <div className="text-center py-12"><RefreshCw className="animate-spin mx-auto text-emerald-600 w-12 h-12" /> <p className="text-slate-600 font-medium mt-4">Menyusun data...</p></div>}
      {csvBlob && (
        <div className="bg-white/50 backdrop-blur-sm border border-white p-6 rounded-2xl text-center shadow-inner">
           <button onClick={() => {
             const link = document.createElement('a'); link.href = URL.createObjectURL(csvBlob); link.download = `${file?.name.replace('.pdf','')}.csv`; link.click();
           }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2">
             <Download size={20}/> Muat Turun CSV/Excel
           </button>
           <button onClick={() => setCsvBlob(null)} className="mt-4 text-sm text-slate-500 hover:text-emerald-600 font-medium transition-colors">Tukar Fail Lain</button>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN PDF KE POWERPOINT ---
const PdfToPowerpoint = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [pptUrl, setPptUrl] = useState<string | null>(null);
  useScript("https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgen.bundle.js");

  const convertToPPT = async (pdfFile: File) => {
    setIsConverting(true);
    try {
      // @ts-ignore
      const pptx = new PptxGenJS();
      const arrayBuffer = await pdfFile.arrayBuffer();
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const slide = pptx.addSlide();
        slide.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' });
      }
      pptx.write('base64').then((base64: string) => {
        setPptUrl("data:application/vnd.openxmlformats-officedocument.presentationml.presentation;base64," + base64);
        setIsConverting(false);
      });
    } catch (err) { setIsConverting(false); alert("Ralat PPT. Sila refresh dan cuba lagi."); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">PDF ke PowerPoint</h2>
        <div className="flex items-center justify-center gap-2 text-orange-600 text-sm font-medium mt-2 bg-orange-50 py-1.5 px-3 rounded-full inline-flex border border-orange-100">
          <CheckCircle size={14}/> Format kekal (Slide Gambar)
        </div>
      </div>
      {!pptUrl && !isConverting && (
        <div onClick={() => document.getElementById('pdfppt')?.click()} className="group border-4 border-dashed border-orange-200/60 bg-orange-50/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1">
          <input id="pdfppt" type="file" onChange={(e) => {const f=e.target.files?.[0]; if(f){setFile(f); convertToPPT(f);}}} className="hidden" accept="application/pdf"/>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Presentation size={40} className="text-orange-600" />
          </div>
          <p className="font-bold text-lg text-slate-700">Pilih PDF</p>
        </div>
      )}
      {isConverting && <div className="text-center py-12"><RefreshCw className="animate-spin mx-auto text-orange-600 w-12 h-12" /> <p className="text-slate-600 font-medium mt-4">Menjana slaid...</p></div>}
      {pptUrl && (
        <div className="bg-white/50 backdrop-blur-sm border border-white p-6 rounded-2xl text-center shadow-inner">
           <a href={pptUrl} download={`${file?.name.replace('.pdf','')}.pptx`} className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 block no-underline">
             <Download size={20}/> Muat Turun PPTX
           </a>
           <button onClick={() => setPptUrl(null)} className="mt-4 text-sm text-slate-500 hover:text-orange-600 font-medium transition-colors">Tukar Fail Lain</button>
        </div>
      )}
    </div>
  );
};

// --- KOMPONEN PDF KE GAMBAR ---
const PdfToImage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isZip, setIsZip] = useState(false);
  const [progress, setProgress] = useState("");

  useScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");

  const convertToImage = async (pdfFile: File) => {
    setIsConverting(true);
    setProgress("Memulakan...");
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      // @ts-ignore
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      
      if (totalPages === 1) {
         const page = await pdf.getPage(1);
         const viewport = page.getViewport({ scale: 2.0 }); 
         const canvas = document.createElement('canvas');
         const context = canvas.getContext('2d');
         canvas.height = viewport.height;
         canvas.width = viewport.width;
         await page.render({ canvasContext: context, viewport: viewport }).promise;
         const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
         setDownloadUrl(dataUrl);
         setIsZip(false);
      } else {
         // @ts-ignore
         const zip = new JSZip();
         const folder = zip.folder("images");

         for (let i = 1; i <= totalPages; i++) {
           setProgress(`Memproses halaman ${i} dari ${totalPages}...`);
           const page = await pdf.getPage(i);
           const viewport = page.getViewport({ scale: 1.5 });
           const canvas = document.createElement('canvas');
           const context = canvas.getContext('2d');
           canvas.height = viewport.height;
           canvas.width = viewport.width;
           await page.render({ canvasContext: context, viewport: viewport }).promise;
           const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
           if (blob) folder.file(`page_${i}.jpg`, blob);
         }
         
         setProgress("Memampatkan fail (Zip)...");
         const content = await zip.generateAsync({ type: "blob" });
         setDownloadUrl(URL.createObjectURL(content));
         setIsZip(true);
      }
      setIsConverting(false);
    } catch (err) { setIsConverting(false); alert("Gagal memproses gambar."); console.error(err); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">PDF ke Gambar</h2>
        <div className="flex items-center justify-center gap-2 text-cyan-600 text-sm font-medium mt-2 bg-cyan-50 py-1.5 px-3 rounded-full inline-flex border border-cyan-100">
          <Images size={14}/> Tukar setiap halaman ke JPG
        </div>
      </div>
      
      {!downloadUrl && !isConverting && (
        <div onClick={() => document.getElementById('pdfimg')?.click()} className="group border-4 border-dashed border-cyan-200/60 bg-cyan-50/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-cyan-50 hover:border-cyan-400 transition-all duration-300 transform hover:-translate-y-1">
          <input id="pdfimg" type="file" onChange={(e) => {const f=e.target.files?.[0]; if(f){setFile(f); convertToImage(f);}}} className="hidden" accept="application/pdf"/>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Images size={40} className="text-cyan-600" />
          </div>
          <p className="font-bold text-lg text-slate-700">Pilih Fail PDF</p>
        </div>
      )}

      {isConverting && (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto text-cyan-600 w-12 h-12 mb-4" /> 
          <p className="text-slate-600 font-medium">{progress}</p>
        </div>
      )}

      {downloadUrl && (
        <div className="bg-white/50 backdrop-blur-sm border border-white p-6 rounded-2xl text-center shadow-inner">
           <div className="bg-cyan-50 p-4 rounded-xl mb-6 text-cyan-800 text-sm">
             {isZip ? "Fail PDF anda mempunyai banyak halaman. Kami telah satukan dalam satu fail ZIP." : "Gambar berjaya dihasilkan!"}
           </div>
           
           <a href={downloadUrl} download={isZip ? `${file?.name.replace('.pdf','')}_images.zip` : `${file?.name.replace('.pdf','')}.jpg`} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-cyan-200 transition-all flex items-center justify-center gap-2 block no-underline">
             <Download size={20}/> {isZip ? "Muat Turun ZIP" : "Muat Turun JPG"}
           </a>
           <button onClick={() => { setDownloadUrl(null); setFile(null); }} className="mt-4 text-sm text-slate-500 hover:text-cyan-600 font-medium transition-colors">Tukar Fail Lain</button>
        </div>
      )}
    </div>
  );
};


// --- KOMPONEN MP4 KE MP3 ---
const VideoToAudio = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [mp3Url, setMp3Url] = useState<string | null>(null);
  
  useScript("https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js");

  const convertToMp3 = async (videoFile: File) => {
    if (videoFile.size > 50 * 1024 * 1024) {
      alert("Fail terlalu besar (Had 50MB). Pelayar mungkin 'hang'.");
      return;
    }
    setIsConverting(true);
    setFile(videoFile);
    try {
      const arrayBuffer = await videoFile.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const mp3Data = [];
      const sampleRate = audioBuffer.sampleRate;
      const channels = audioBuffer.numberOfChannels;
      // @ts-ignore
      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      const left = audioBuffer.getChannelData(0);
      const right = channels > 1 ? audioBuffer.getChannelData(1) : left;
      const sampleBlockSize = 1152;
      
      for (let i = 0; i < left.length; i += sampleBlockSize) {
        const leftChunk = left.subarray(i, i + sampleBlockSize);
        const rightChunk = right.subarray(i, i + sampleBlockSize);
        const leftInt16 = new Int16Array(leftChunk.length);
        const rightInt16 = new Int16Array(rightChunk.length);
        for (let j = 0; j < leftChunk.length; j++) {
           leftInt16[j] = leftChunk[j] < 0 ? leftChunk[j] * 0x8000 : leftChunk[j] * 0x7FFF;
           rightInt16[j] = rightChunk[j] < 0 ? rightChunk[j] * 0x8000 : rightChunk[j] * 0x7FFF;
        }
        const mp3buf = channels === 1 ? mp3encoder.encodeBuffer(leftInt16) : mp3encoder.encodeBuffer(leftInt16, rightInt16);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
      }
      const mp3buf = mp3encoder.flush();
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
      
      const blob = new Blob(mp3Data, { type: 'audio/mp3' });
      setMp3Url(URL.createObjectURL(blob));
      setIsConverting(false);
    } catch (err) { setIsConverting(false); alert("Gagal menukar. Format video mungkin tidak disokong."); }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">MP4 ke MP3</h2>
        <div className="flex items-center justify-center gap-2 text-rose-600 text-sm font-medium mt-2 bg-rose-50 py-1.5 px-3 rounded-full inline-flex border border-rose-100">
          <Music size={14}/> Ekstrak audio sahaja
        </div>
      </div>
      
      {!mp3Url && !isConverting && (
        <div onClick={() => document.getElementById('vid2aud')?.click()} className="group border-4 border-dashed border-rose-200/60 bg-rose-50/30 rounded-2xl p-10 text-center cursor-pointer hover:bg-rose-50 hover:border-rose-400 transition-all duration-300 transform hover:-translate-y-1">
          <input id="vid2aud" type="file" onChange={(e) => {const f=e.target.files?.[0]; if(f){convertToMp3(f);}}} className="hidden" accept="video/mp4,video/webm"/>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
            <Video size={40} className="text-rose-600" />
          </div>
          <p className="font-bold text-lg text-slate-700">Pilih Fail Video</p>
          <p className="text-xs text-slate-400 mt-1">Disyorkan bawah 50MB</p>
        </div>
      )}

      {isConverting && (
        <div className="text-center py-12">
          <RefreshCw className="animate-spin mx-auto text-rose-600 w-12 h-12" /> 
          <p className="text-slate-600 font-medium mt-4">Sedang mengekod MP3...</p>
        </div>
      )}

      {mp3Url && (
        <div className="bg-white/50 backdrop-blur-sm border border-white p-6 rounded-2xl text-center shadow-inner">
           <div className="bg-white/80 p-4 rounded-xl mb-4 border border-rose-100">
             <audio controls src={mp3Url} className="w-full" />
           </div>
           
           <a href={mp3Url} download={`${file?.name.replace(/\.[^/.]+$/, "")}.mp3`} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 block no-underline">
             <Download size={20}/> Muat Turun MP3
           </a>
           <button onClick={() => { setMp3Url(null); setFile(null); }} className="mt-4 text-sm text-slate-500 hover:text-rose-600 font-medium transition-colors">Tukar Fail Lain</button>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
const App = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); }
  }, []);

  const menuItems = [
    { id: 'image', label: 'Resize Gambar', icon: <ImageIcon size={20}/>, color: 'blue', desc: 'Kecilkan Saiz Foto' },
    { id: 'word', label: 'PDF ke Word', icon: <FileText size={20}/>, color: 'indigo', desc: 'Tukar Dokumen' },
    { id: 'excel', label: 'PDF ke Excel', icon: <FileSpreadsheet size={20}/>, color: 'emerald', desc: 'Jadual ke CSV' },
    { id: 'ppt', label: 'PDF ke PPT', icon: <Presentation size={20}/>, color: 'orange', desc: 'Slaid Gambar' },
    { id: 'pdf2img', label: 'PDF ke Gambar', icon: <Images size={20}/>, color: 'cyan', desc: 'PDF ke JPG/ZIP' }, // Menu Baru
    { id: 'mp3', label: 'MP4 ke MP3', icon: <Music size={20}/>, color: 'rose', desc: 'Ekstrak Audio' },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-800 relative overflow-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* --- LATAR BELAKANG MODEN (Background) --- */}
      <div className="fixed inset-0 z-0 bg-[#f8fafc]">
        {/* Colorful Blobs with blur */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[30%] h-[30%] bg-slate-200/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Mobile Navbar */}
        <div className="md:hidden bg-white/80 backdrop-blur-md border-b border-white p-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
             <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/600px-Coat_of_arms_of_Malaysia.svg.png" alt="Jata Negara" className="h-10 w-auto object-contain drop-shadow-sm" />
             <span className="font-extrabold text-lg tracking-tight text-slate-800 leading-tight">Unit ICT<br/><span className="text-blue-600">Tools</span></span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            {isMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white/95 backdrop-blur-xl border-b shadow-2xl z-40 p-4 space-y-2 animate-fade-in-down">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${activeTab === item.id ? `bg-${item.color}-50 text-${item.color}-700 font-bold shadow-sm` : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className={`p-2 rounded-lg ${activeTab === item.id ? 'bg-white' : 'bg-slate-100'}`}>
                  {item.icon}
                </div>
                <div className="text-left">
                  <div className="text-sm">{item.label}</div>
                  <div className="text-xs opacity-70 font-normal">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Main Content Container */}
        <div className="flex flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 gap-8">
          
          {/* Sidebar (Desktop) */}
          <div className="hidden md:flex flex-col w-72 bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-slate-200/50 p-6 h-fit sticky top-8">
            <div className="mb-8 flex flex-col items-center text-center gap-3 px-2">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-2 shadow-lg mb-2">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Coat_of_arms_of_Malaysia.svg/600px-Coat_of_arms_of_Malaysia.svg.png" alt="Jata Negara" className="h-full w-full object-contain" />
              </div>
              <h1 className="font-extrabold text-xl text-slate-800 tracking-tight leading-tight">
                Unit ICT <span className="text-blue-600">Tools</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium px-4">Portal Aplikasi Utiliti Digital Kerajaan</p>
            </div>
            
            <div className="space-y-3">
              <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Peralatan</p>
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    activeTab === item.id 
                      ? `bg-gradient-to-r from-${item.color}-50 to-white text-${item.color}-700 shadow-md shadow-${item.color}-100 ring-1 ring-${item.color}-100 translate-x-1` 
                      : 'text-slate-500 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <span className={`${activeTab === item.id ? `text-${item.color}-600` : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8 px-4">
              <div className="p-4 bg-slate-800 rounded-2xl text-white text-center shadow-lg">
                <p className="text-xs text-slate-400 mb-1">Versi 2.1</p>
                <p className="text-xs font-bold">Keselamatan Data Terjamin</p>
              </div>
            </div>
          </div>

          {/* Active Tool Panel */}
          <div className="flex-1 flex flex-col">
            
            {/* Banner Interaktif Baru */}
            <InteractiveBanner />

            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white shadow-2xl shadow-slate-200/50 p-6 md:p-12 min-h-[500px] transition-all duration-500 animate-fade-in relative z-20">
              <div className="max-w-xl mx-auto">
                {activeTab === 'image' && <ImageResizer />}
                {activeTab === 'word' && <PdfToWord />}
                {activeTab === 'excel' && <PdfToExcel />}
                {activeTab === 'ppt' && <PdfToPowerpoint />}
                {activeTab === 'pdf2img' && <PdfToImage />}
                {activeTab === 'mp3' && <VideoToAudio />}
              </div>
            </div>
            
            <div className="mt-6 text-center text-slate-400 text-xs font-medium">
              © 2024 Unit ICT Tools • Selamat & Pantas
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;