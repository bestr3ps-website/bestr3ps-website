import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FileCode2, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_FINAL_CODE } from '../data/appsScriptCode';
import { getStoredApiUrl, setStoredApiUrl, fetchCatalog } from '../services/api';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSync: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccessSync
}) => {
  const [apiUrl, setApiUrl] = useState(getStoredApiUrl());
  const [copiedScript, setCopiedScript] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    count: number;
    message: string;
    debugStats?: Record<string, number>;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'settings' | 'script' | 'guide'>('settings');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_FINAL_CODE);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSaveAndTest = async () => {
    setTesting(true);
    setTestResult(null);
    setStoredApiUrl(apiUrl);

    try {
      const result = await fetchCatalog(apiUrl, true);
      if (result.isLive && result.totalCount > 0) {
        setTestResult({
          success: true,
          count: result.totalCount,
          message: `Connected successfully! Synced ${result.totalCount} products from your Google Sheets.`,
          debugStats: result.debugStats
        });
        onSuccessSync();
      } else if (result.isLive && result.totalCount === 0) {
        setTestResult({
          success: false,
          count: 0,
          message: 'API connected, but returned 0 items. Please ensure your sheet has rows with items, or copy our updated script.',
          debugStats: result.debugStats
        });
      } else {
        setTestResult({
          success: false,
          count: 0,
          message: result.error || 'Connection failed. Please ensure the URL ends with /exec and was deployed with "Anyone" access.'
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        count: 0,
        message: e.message || 'Connection test error.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl z-10 my-auto text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Google Sheets & Apps Script Setup
              </h2>
              <p className="text-xs text-neutral-400">
                100% Database-free • Synchronize catalog directly from Google Sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            API Connection
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            5-Step Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'script'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Full Apps Script Code
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Input for Web App URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                  <span>Google Apps Script Web App URL</span>
                  <span className="text-[11px] text-amber-400 font-mono">Must end with /exec</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-xs text-neutral-100 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  BESTR3PS reads products from this endpoint in real-time. Whenever you add or edit shoes or clothes in your Google Sheet, they update on the website automatically.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveAndTest}
                  disabled={testing || !apiUrl}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 active:scale-[0.99] text-neutral-950 font-bold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer disabled:opacity-50"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Testing Google Sheets Connection...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-neutral-950" />
                      <span>Save & Test Connection</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyScript}
                  className="px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Script Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Apps Script</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Result Box */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  testResult.success 
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                    : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.message}</span>
                  </div>

                  {testResult.debugStats && Object.keys(testResult.debugStats).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-neutral-800/80">
                      <span className="font-semibold text-neutral-300 block mb-1.5 font-mono">Category item breakdown:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[11px]">
                        {Object.entries(testResult.debugStats).map(([k, v]) => (
                          <div key={k} className="bg-neutral-900/60 px-2 py-1 rounded border border-neutral-800 flex justify-between">
                            <span className="text-neutral-400 truncate mr-1">{k}:</span>
                            <span className={Number(v) > 0 ? 'text-amber-400 font-bold' : 'text-neutral-400'}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-neutral-300 leading-relaxed">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-neutral-200">
                <span className="font-bold text-amber-400 block mb-1">💡 Foolproof Rule (Never diagnose or edit snippets):</span>
                Simply replace the entire Apps Script with our complete code below, then click Deploy ➔ New Version!
              </div>

              {/* Step 1 */}
              <div className="flex gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Open Apps Script from your Google Sheet</h4>
                  <p className="text-neutral-400">
                    In your Google Sheets menu, click:<br />
                    <span className="font-mono text-amber-400 font-semibold">Extensions ➔ Apps Script</span>.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Delete all old code & Paste the full script</h4>
                  <p className="text-neutral-400 mb-2">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px]">Ctrl + A</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 font-mono text-[10px]">Cmd + A</kbd>) then Delete. Then click below to copy the full code and paste it:
                  </p>
                  <button
                    onClick={handleCopyScript}
                    className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedScript ? 'Copied! Ready to paste' : 'Copy Full Apps Script Final Code'}</span>
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Deploy as New Version (Important!)</h4>
                  <p className="text-neutral-400">
                    1. Click the <strong className="text-white">Save (💾)</strong> button.<br />
                    2. Click blue <strong className="text-white">Deploy ➔ Manage deployments</strong>.<br />
                    3. Click the <strong className="text-white">Pencil icon (Edit)</strong> on the top right.<br />
                    4. In the Version dropdown, choose <strong className="text-amber-400 font-bold">New version</strong>.<br />
                    5. Ensure Who has access is set to <strong className="text-white">Anyone</strong>.<br />
                    6. Click <strong className="text-white">Deploy</strong>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-3 bg-neutral-950 p-4 rounded-2xl border border-neutral-800">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-neutral-950 font-black flex items-center justify-center shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Paste the Web App URL</h4>
                  <p className="text-neutral-400">
                    Copy the web app URL ending with <span className="font-mono text-amber-400">/exec</span>, paste it into the API Connection tab here, and click Save & Test!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 font-mono">
                  Full automatic support for 4-column repeats, rich-text links, USD prices & clean URLs
                </span>
                <button
                  onClick={handleCopyScript}
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? 'Copied!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 font-mono text-[11px] text-neutral-300 max-h-96 overflow-y-auto whitespace-pre leading-relaxed selection:bg-amber-500 selection:text-neutral-950">
                {GOOGLE_APPS_SCRIPT_FINAL_CODE}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
