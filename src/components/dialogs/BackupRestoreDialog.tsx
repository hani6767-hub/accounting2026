import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  AlertCircle,
  FileJson,
  X,
  UploadCloud,
  ShieldCheck
} from 'lucide-react';

interface BackupRestoreDialogProps {
  jsonExport: string;
  onRestoreJson: (json: string) => { success: boolean; error?: string };
  onDismiss: () => void;
}

export const BackupRestoreDialog: React.FC<BackupRestoreDialogProps> = ({
  jsonExport,
  onRestoreJson,
  onDismiss
}) => {
  const [activeTab, setActiveTab] = useState<'BACKUP' | 'RESTORE'>('BACKUP');
  const [restoreText, setRestoreText] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Generate Arabic filename with exact download date & time
  const getArabicBackupFileName = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `نسخة_احتياطية_بيت_المحاسبة_بتاريخ_${year}-${month}-${day}_${hours}-${minutes}.json`;
  };

  const handleDownloadFile = () => {
    const blob = new Blob([jsonExport], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getArabicBackupFileName();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyRestore = () => {
    setRestoreError(null);
    if (!restoreText.trim()) {
      setRestoreError('يرجى اختيار ملف أو لصق نص النسخة الاحتياطية بصيغة JSON');
      return;
    }

    const res = onRestoreJson(restoreText);
    if (res.success) {
      setRestoreSuccess(true);
      setRestoreText('');
      setTimeout(() => {
        setRestoreSuccess(false);
        onDismiss();
      }, 1500);
    } else {
      setRestoreError(res.error || 'الملف غير صالح أو البيانات معطوبة');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setRestoreText(content);
        setRestoreError(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        <div className="sm:hidden w-12 h-1.5 bg-slate-700 rounded-full mx-auto mt-3 mb-1" />

        <div className="p-5 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100">
                  النسخ الاحتياطي واستعادة السجلات
                </h3>
                <p className="text-xs text-slate-400">
                  حفظ وتنزيل واستعادة بيانات المتجر بصيغة JSON
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1.5 bg-slate-800/80 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('BACKUP')}
              className={`py-2.5 rounded-lg text-xs font-bold transition min-h-[40px] flex items-center justify-center gap-1.5 ${
                activeTab === 'BACKUP'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>تحميل نسخة احتياطية (JSON)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('RESTORE')}
              className={`py-2.5 rounded-lg text-xs font-bold transition min-h-[40px] flex items-center justify-center gap-1.5 ${
                activeTab === 'RESTORE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>استعادة السجلات</span>
            </button>
          </div>

          {/* TAB 1: BACKUP JSON */}
          {activeTab === 'BACKUP' && (
            <div className="mt-4 flex flex-col gap-3.5">
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 flex flex-col gap-1 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-slate-100">ملف النسخة الاحتياطية الشامل:</span>
                <span className="text-slate-400">
                  يتم تحميل الملف باسم عربي واضح يحمل تاريخ ووقت التحميل بدقة، ويشمل المنتجات، الحركات المالية، ديون الزبائن، وسجلات المصاريف.
                </span>
              </div>

              {downloadSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in border border-emerald-500/40">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>تم بدء تحميل ملف النسخة الاحتياطية بنجاح على جهازك!</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition min-h-[48px]"
                >
                  <Download className="w-5 h-5" />
                  <span>تحميل ملف JSON باسم عربي مع التاريخ</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition min-h-[42px]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">تم نسخ كود الـ JSON بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-cyan-400" />
                      <span>نسخ محتوى JSON إلى الحافظة</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  معاينة كود النسخة الاحتياطية (JSON Preview):
                </label>
                <textarea
                  readOnly
                  rows={6}
                  value={jsonExport}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-400 focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: RESTORE */}
          {activeTab === 'RESTORE' && (
            <div className="mt-4 flex flex-col gap-3.5">
              <p className="text-xs text-slate-400 leading-relaxed">
                اختر ملف النسخة الاحتياطية من جهازك أو الصق نص الـ JSON لاستعادة كافة السجلات فوراً:
              </p>

              {restoreError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {restoreSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>تمت استعادة البيانات بنجاح تام!</span>
                </div>
              )}

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  id="backup-file-input"
                  className="hidden"
                />
                <label
                  htmlFor="backup-file-input"
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition min-h-[46px]"
                >
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>اختيار ملف JSON من جهازك</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  أو الصق نص JSON هنا:
                </label>
                <textarea
                  rows={6}
                  placeholder="الصق كود JSON هنا..."
                  value={restoreText}
                  onChange={e => setRestoreText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
                />
              </div>

              <button
                type="button"
                onClick={handleApplyRestore}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition min-h-[46px]"
              >
                تأكيد واستعادة السجلات
              </button>
            </div>
          )}

          <div className="mt-5">
            <button
              type="button"
              onClick={onDismiss}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm transition min-h-[44px]"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
