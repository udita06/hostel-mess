'use client';

import React, { useState } from 'react';
import { useMessData } from '../context/MessDataContext';
import { useAuth } from '../context/AuthContext';
import {
  FileSpreadsheet,
  X,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  Copy,
  AlertCircle,
  Database,
} from 'lucide-react';

interface GFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GFormModal({ isOpen, onClose }: GFormModalProps) {
  const { isAdmin } = useAuth();
  const { gformConfig, updateGFormConfig, syncGFormData } = useMessData();

  const [formUrl, setFormUrl] = useState<string>(gformConfig.formUrl);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pasteData, setPasteData] = useState<string>('');
  const [showPasteBox, setShowPasteBox] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSimulateSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = syncGFormData(pasteData.trim() ? pasteData : undefined);
      setIsSyncing(false);
      setSyncStatus(res.message);
      if (res.success && pasteData.trim()) {
        setPasteData('');
        setShowPasteBox(false);
      }
    }, 700);
  };

  const handleSaveConfig = () => {
    updateGFormConfig({
      ...gformConfig,
      formUrl,
    });
    setSyncStatus('Google Form configuration updated.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Google Form (GForm) Data Sync
              </h3>
              <p className="text-xs text-gray-500">
                Official hostel data update & onboarding pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {syncStatus && (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {syncStatus}
          </div>
        )}

        <div className="mt-4 space-y-4 text-xs">
          {/* Explanation Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-blue-900 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              Integrated Google Form Workflow
            </span>
            <p className="text-[11px] text-blue-800">
              Per requirements ("Will use Gform to update the data"), students can submit their profile corrections, room reallocations, or registration details through the hostel's Google Form. The portal ingests these responses into the database.
            </p>
          </div>

          {/* Form Link Section */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <label className="font-bold text-gray-700 block">Hostel Google Form URL:</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formUrl}
                disabled={!isAdmin}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/..."
                className="flex-1 p-2 border border-gray-200 rounded-lg text-xs bg-white"
              />
              {isAdmin && (
                <button
                  onClick={handleSaveConfig}
                  className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold"
                >
                  Save URL
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={formUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Google Form in New Tab
              </a>

              {gformConfig.lastSyncedAt && (
                <span className="text-[11px] text-gray-400">
                  Last synced: {new Date(gformConfig.lastSyncedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Sync Trigger Action */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-emerald-900">Synchronize Form Responses</h4>
                <p className="text-[11px] text-emerald-700">
                  Pulls latest registration & preference rows submitted via Google Form.
                </p>
              </div>
              <button
                disabled={isSyncing}
                onClick={handleSimulateSync}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>

          {/* Advanced JSON/CSV response paste (Admin only) */}
          {isAdmin && (
            <div>
              <button
                onClick={() => setShowPasteBox(!showPasteBox)}
                className="text-xs text-gray-500 hover:text-gray-800 font-semibold underline"
              >
                {showPasteBox
                  ? '▼ Hide Custom Google Sheet / CSV Importer'
                  : '▶ Paste Google Sheet CSV / JSON Responses directly'}
              </button>

              {showPasteBox && (
                <div className="mt-2 space-y-2">
                  <p className="text-[11px] text-gray-500">
                    Paste Google Sheet exported JSON or rows:
                  </p>
                  <textarea
                    rows={4}
                    placeholder='[{"name": "Aniket Sen", "email": "aniket@hostel.edu", "year": 2, "course": "B.Tech", "roomNumber": "A-220"}]'
                    value={pasteData}
                    onChange={(e) => setPasteData(e.target.value)}
                    className="w-full font-mono text-[11px] p-2.5 border border-gray-200 rounded-xl"
                  />
                  <button
                    onClick={handleSimulateSync}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs"
                  >
                    Import Pasted Records
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
