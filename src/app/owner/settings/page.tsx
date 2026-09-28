'use client';

import React, { useEffect, useState } from 'react';
import { StoreSettings, DeliveryZone } from '@/lib/types';
import {
  Settings,
  Clock,
  Truck,
  Bell,
  MapPin,
  Save,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';

export default function OwnerSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/owner/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateBusinessHours = (index: number, field: 'open' | 'close', val: string) => {
    if (!settings) return;
    const newHours = [...settings.businessHours];
    newHours[index][field] = val;
    setSettings({ ...settings, businessHours: newHours });
  };

  if (loading || !settings) {
    return <div className="p-12 text-center text-slate-400">Loading store settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1527] border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#d4af37]" />
            Store Configuration & Accra Delivery Zones
          </h2>
          <p className="text-xs text-slate-400">
            Customize operating hours, delivery fees per neighborhood, and marketing announcement banners.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#d4af37] hover:bg-[#c5a028] text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition shadow"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Store settings successfully updated and live!</span>
        </div>
      )}

      {/* 1. Delivery Coordination */}
      <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Truck className="w-4 h-4 text-[#d4af37]" />
          Delivery Coordination
        </h3>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-slate-200 leading-relaxed">
          Delivery is not priced on the storefront. Staff will contact a delivery person, arrange the dispatch, and confirm the courier fee directly with the customer before the order is finalized.
          <br />
          <br />
          This keeps the checkout experience simple and lets the staff handle all delivery logistics on a case-by-case basis.
        </div>
      </div>

      {/* 2. Business Operating Hours */}
      <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Clock className="w-4 h-4 text-[#d4af37]" />
          Store Business Hours
        </h3>

        <div className="space-y-3 text-xs">
          {settings.businessHours.map((bh, idx) => (
            <div
              key={bh.day}
              className="bg-[#111a2e] p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
            >
              <span className="font-bold text-white w-44">{bh.day}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Open:</span>
                  <input
                    type="text"
                    value={bh.open}
                    onChange={(e) => updateBusinessHours(idx, 'open', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-center w-28"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Close:</span>
                  <input
                    type="text"
                    value={bh.close}
                    onChange={(e) => updateBusinessHours(idx, 'close', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-center w-28"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Homepage Promo Announcement Banner */}
      <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Bell className="w-4 h-4 text-[#d4af37]" />
          Top Promotion & Notice Banner
        </h3>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="bannerToggle"
              checked={settings.announcementBanner.enabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcementBanner: { ...settings.announcementBanner, enabled: e.target.checked },
                })
              }
              className="accent-[#d4af37] w-4 h-4"
            />
            <label htmlFor="bannerToggle" className="font-bold text-white cursor-pointer">
              Enable Announcement Banner on Top of Store
            </label>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Banner Announcement Text</label>
            <input
              type="text"
              value={settings.announcementBanner.text}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcementBanner: { ...settings.announcementBanner, text: e.target.value },
                })
              }
              className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* 4. Physical Location & Contact */}
      <div className="bg-[#0d1527] border border-slate-800 p-6 rounded-2xl space-y-4 text-xs">
        <h3 className="font-bold text-sm text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <MapPin className="w-4 h-4 text-[#d4af37]" />
          Physical Store Location & Contacts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 block mb-1">Shop Physical Address</label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">City & Country</label>
            <input
              type="text"
              value={`${settings.city}, ${settings.country}`}
              disabled
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Phone Number (Calls & Inquiries)</label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">WhatsApp Customer Service</label>
            <input
              type="text"
              value={settings.whatsapp}
              onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
              className="w-full bg-[#111a2e] border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
