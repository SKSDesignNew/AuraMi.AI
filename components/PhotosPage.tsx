'use client';

import { useState, useEffect, useRef } from 'react';

interface Asset {
  id: string;
  asset_type: string;
  storage_path: string;
  original_filename: string | null;
  description: string | null;
  captured_at: string | null;
  year: number | null;
  created_at: string;
}

interface PhotosPageProps {
  householdId: string;
  userId: string;
}

export default function PhotosPage({ householdId, userId }: PhotosPageProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetUrls, setAssetUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAssets();
  }, [householdId]);

  async function loadAssets() {
    setLoading(true);
    try {
      const res = await fetch(`/api/data?type=assets&householdId=${householdId}`);
      const json = await res.json();
      const data = json.data || [];
      setAssets(data);

      // Pre-fetch signed URLs for photos
      const urls: Record<string, string> = {};
      for (const asset of data) {
        if (asset.asset_type === 'photo') {
          try {
            const urlRes = await fetch(`/api/data?type=asset_url&householdId=${householdId}&path=${encodeURIComponent(asset.storage_path)}`);
            const urlJson = await urlRes.json();
            urls[asset.id] = urlJson.url;
          } catch {
            // skip
          }
        }
      }
      setAssetUrls(urls);
    } catch {
      setAssets([]);
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('householdId', householdId);
    for (const file of Array.from(files)) {
      formData.append('files', file);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.uploaded > 0) {
        setMessage(`${data.uploaded} file${data.uploaded > 1 ? 's' : ''} uploaded!`);
        loadAssets();
      } else {
        setMessage(data.error || 'Upload failed.');
      }
    } catch {
      setMessage('Network error. Please try again.');
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-text-400 font-body">Loading photos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-900 mb-1">Photos &amp; Documents</h2>
            <p className="font-body text-text-500 text-sm">{assets.length} files uploaded</p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-pink via-coral to-gold text-white font-body font-bold shadow-glow hover:shadow-hover transition-all hover:-translate-y-0.5 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
          </div>
        </div>

        {message && (
          <p className="text-sm font-body text-text-600 mb-4 px-4 py-2 rounded-lg bg-card border border-[rgba(0,245,255,0.08)]">
            {message}
          </p>
        )}

        {assets.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">{'\uD83D\uDCF7'}</div>
            <h3 className="font-display text-xl font-bold text-text-800 mb-2">No Photos Yet</h3>
            <p className="text-text-500 font-body max-w-md mx-auto">
              Upload family photos, scanned documents, certificates, and letters. You can also add photos through the chat.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative aspect-square rounded-card overflow-hidden bg-bg-alt border border-[rgba(0,245,255,0.08)] cursor-pointer hover:border-[rgba(0,245,255,0.25)] transition-all"
                  onClick={() => setSelectedAsset(asset)}
                >
                  {asset.asset_type === 'photo' && assetUrls[asset.id] ? (
                    <img
                      src={assetUrls[asset.id]}
                      alt={asset.description || asset.original_filename || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-3">
                      <span className="text-3xl mb-2">
                        {asset.asset_type === 'video' ? '\uD83C\uDFA5' : asset.asset_type === 'audio' ? '\uD83C\uDFA7' : '\uD83D\uDCC4'}
                      </span>
                      <p className="text-xs font-body text-text-500 text-center truncate w-full">
                        {asset.original_filename || 'File'}
                      </p>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-body truncate">
                      {asset.description || asset.original_filename || 'Untitled'}
                    </p>
                    {asset.year && (
                      <p className="text-white/60 text-[10px] font-body">{asset.year}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedAsset && (
              <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
                onClick={() => setSelectedAsset(null)}
              >
                <div
                  className="max-w-3xl max-h-[80vh] relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm font-body"
                  >
                    Close
                  </button>
                  {selectedAsset.asset_type === 'photo' && assetUrls[selectedAsset.id] ? (
                    <img
                      src={assetUrls[selectedAsset.id]}
                      alt={selectedAsset.description || 'Photo'}
                      className="max-h-[75vh] rounded-lg object-contain"
                    />
                  ) : (
                    <div className="bg-card rounded-lg p-8 text-center">
                      <p className="text-4xl mb-3">
                        {selectedAsset.asset_type === 'video' ? '\uD83C\uDFA5' : '\uD83D\uDCC4'}
                      </p>
                      <p className="font-body text-text-700">
                        {selectedAsset.original_filename}
                      </p>
                    </div>
                  )}
                  {selectedAsset.description && (
                    <p className="text-white/80 text-sm font-body mt-3 text-center">
                      {selectedAsset.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
