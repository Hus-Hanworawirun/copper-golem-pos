import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Store,
  Upload,
  Camera,
  Save,
  CheckCircle2,
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';

export default function StoreSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  const [form, setForm] = useState({
    store_name: 'Pouch',
    store_subtitle: 'ระบบแคชเชียร์ & คลังสต็อก',
    tax_id: '0105566012345'
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('/logo.png');
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settings) {
      setForm({
        store_name: settings.store_name || 'Pouch',
        store_subtitle: settings.store_subtitle || 'ระบบแคชเชียร์ & คลังสต็อก',
        tax_id: settings.tax_id || '0105566012345'
      });
      setLogoPreview(settings.logo_url || '/logo.png');
      setLogoFile(null);
    }
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.store_name.trim()) {
      alert('กรุณากรอกชื่อร้านค้า');
      return;
    }

    setIsSaving(true);
    const formData = new FormData();
    formData.append('store_name', form.store_name.trim());
    formData.append('store_subtitle', form.store_subtitle.trim());
    formData.append('tax_id', form.tax_id.trim());
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    try {
      await onSaveSettings(formData);
      setSuccessToast(true);
      setTimeout(() => {
        setSuccessToast(false);
        onClose();
      }, 700);
    } catch (err) {
      alert('บันทึกข้อมูลไม่สำเร็จ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 select-none font-['Prompt',sans-serif] animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">ตั้งค่าข้อมูลร้านค้า &amp; แบรนด์</h3>
              <p className="text-[11px] text-slate-400">กำหนดชื่อร้าน, โลโก้ และเลขผู้เสียภาษีสำหรับแสดงบนระบบและใบเสร็จ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 1. Logo Upload & Live Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/60 bg-slate-900 shadow-md p-1 flex items-center justify-center">
                <img
                  src={logoPreview}
                  alt="Store Logo Preview"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = '/logo.png';
                  }}
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] transition-opacity">
                <Camera className="w-5 h-5 mb-0.5" />
                <span>เปลี่ยนรูป</span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-semibold text-xs text-white">โลโก้ร้านค้า (Store Logo)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                รองรับไฟล์ PNG, JPG หรือ WebP (แนะนำรูปทรงสี่เหลี่ยมจัตุรัสหรือวงกลม)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 border border-slate-600/70 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>อัปโหลดรูปภาพใหม่</span>
              </button>
            </div>
          </div>

          {/* 2. Store Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ชื่อร้านค้า (Store Name) *</span>
            </label>
            <input
              type="text"
              required
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              placeholder="ระบุชื่อร้านค้าของคุณ (เช่น Pouch, ร้านสุขใจ)"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
            />
          </div>

          {/* 3. Store Subtitle / Slogan */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>คำบรรยาย / สโลแกนร้านค้า (Subtitle)</span>
            </label>
            <input
              type="text"
              value={form.store_subtitle}
              onChange={(e) => setForm({ ...form, store_subtitle: e.target.value })}
              placeholder="เช่น ระบบแคชเชียร์ & คลังสต็อก, มินิมาร์ทบริการ 24 ชม."
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* 4. Tax ID (เลขประจำตัวผู้เสียภาษี) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>เลขประจำตัวผู้เสียภาษี 13 หลัก (Tax ID สำหรับใบเสร็จ)</span>
            </label>
            <input
              type="text"
              maxLength={20}
              value={form.tax_id}
              onChange={(e) => setForm({ ...form, tax_id: e.target.value })}
              placeholder="เช่น 0105566012345 หรือเลขบัตรประชาชน 13 หลัก"
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
            />
            <p className="text-[10px] text-slate-400">
              ข้อมูลนี้จะถูกนำไปพิมพ์ลงบนสลิปใบเสร็จและใบกำกับภาษีอย่างย่อ (ABB)
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/40 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {successToast ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>บันทึกสำเร็จ!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
