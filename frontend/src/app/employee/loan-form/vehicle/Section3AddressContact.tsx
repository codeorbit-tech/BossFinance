'use client';

import { useState } from 'react';
import { VehicleLoanFormData, PartyContactDetails, AddressBlock } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

function AddressFields({
  block, onChange, disabled
}: {
  block: AddressBlock;
  onChange: (updates: Partial<AddressBlock>) => void;
  disabled?: boolean;
}) {
  const cls = `w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed`;
  return (
    <div className="space-y-2">
      <div>
        <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Full Address</label>
        <textarea
          value={block.fullAddress}
          onChange={e => onChange({ fullAddress: e.target.value })}
          disabled={disabled}
          rows={2}
          className={`${cls} resize-none`}
          placeholder="House/Plot No., Street, Area..."
        />
      </div>
      <div>
        <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Land Mark</label>
        <input type="text" value={block.landmark} onChange={e => onChange({ landmark: e.target.value })} disabled={disabled} className={cls} placeholder="Nearby landmark" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">City / Town</label>
          <input type="text" value={block.city} onChange={e => onChange({ city: e.target.value })} disabled={disabled} className={cls} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">District</label>
          <input type="text" value={block.district} onChange={e => onChange({ district: e.target.value })} disabled={disabled} className={cls} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">State</label>
          <input type="text" value={block.state} onChange={e => onChange({ state: e.target.value })} disabled={disabled} className={cls} />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Pin Code</label>
          <input type="text" value={block.pinCode} onChange={e => onChange({ pinCode: e.target.value })} disabled={disabled} maxLength={6} className={cls} placeholder="6 digits" />
        </div>
      </div>
    </div>
  );
}

function PartyContactBlock({
  label, headerColor, contact, onChange
}: {
  label: string; headerColor: string;
  contact: PartyContactDetails;
  onChange: (updates: Partial<PartyContactDetails>) => void;
}) {
  const updateCommAddr = (updates: Partial<AddressBlock>) => {
    const newComm = { ...contact.communicationAddress, ...updates };
    const perma = contact.permanentSameAsCommunication
      ? { ...newComm }
      : contact.permanentAddress;
    onChange({ communicationAddress: newComm, permanentAddress: perma });
  };

  const toggleSameAddress = (checked: boolean) => {
    onChange({
      permanentSameAsCommunication: checked,
      permanentAddress: checked ? { ...contact.communicationAddress } : contact.permanentAddress,
    });
  };

  const clsInput = `w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all`;

  return (
    <div className="rounded-xl border border-outline-variant/20 overflow-hidden">
      {/* Column Header */}
      <div className={`px-4 py-3 flex items-center gap-2 ${headerColor}`}>
        <span className="material-symbols-outlined text-white text-base">location_on</span>
        <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
      </div>

      <div className="p-4 space-y-5">
        {/* Communication Address */}
        <div>
          <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-accent text-sm">mail</span>
            Communication Address <span className="text-error">*</span>
          </h5>
          <div className="bg-surface-container/50 rounded-xl p-3">
            <AddressFields block={contact.communicationAddress} onChange={updateCommAddr} />
          </div>
        </div>

        {/* Permanent Address */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-accent text-sm">home</span>
              Permanent Address
            </h5>
            <label className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => toggleSameAddress(!contact.permanentSameAsCommunication)}
                className={`w-8 h-4 rounded-full relative transition-all cursor-pointer ${
                  contact.permanentSameAsCommunication ? 'bg-accent' : 'bg-outline-variant'
                }`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${
                  contact.permanentSameAsCommunication ? 'left-[18px]' : 'left-0.5'
                }`} />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant">Same as Communication</span>
            </label>
          </div>
          <div className={`bg-surface-container/50 rounded-xl p-3 transition-all ${contact.permanentSameAsCommunication ? 'opacity-60' : ''}`}>
            <AddressFields
              block={contact.permanentAddress}
              onChange={updates => onChange({ permanentAddress: { ...contact.permanentAddress, ...updates } })}
              disabled={contact.permanentSameAsCommunication}
            />
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h5 className="text-[10px] font-bold text-on-surface uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-accent text-sm">phone</span>
            Contact Details
          </h5>
          <div className="bg-surface-container/50 rounded-xl p-3 space-y-2">
            <div>
              <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                Mobile No. <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                value={contact.mobile}
                onChange={e => onChange({ mobile: e.target.value })}
                maxLength={10}
                placeholder="10-digit mobile"
                className={clsInput}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Alternate Mobile No.</label>
              <input
                type="tel"
                value={contact.alternateMobile}
                onChange={e => onChange({ alternateMobile: e.target.value })}
                maxLength={10}
                placeholder="Alternate number"
                className={clsInput}
              />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">E-mail ID</label>
              <input
                type="email"
                value={contact.email}
                onChange={e => onChange({ email: e.target.value })}
                placeholder="email@example.com"
                className={clsInput}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Section3AddressContact({ formData, updateFormData }: Props) {
  const [activeTab, setActiveTab] = useState<'applicant' | 'coApplicant' | 'guarantor'>('applicant');

  const tabs = [
    { key: 'applicant' as const, label: 'Applicant', color: 'bg-primary' },
    { key: 'coApplicant' as const, label: 'Co-Applicant', color: 'bg-secondary' },
    { key: 'guarantor' as const, label: 'Guarantor', color: 'bg-tertiary' },
  ];

  return (
    <div>
      <p className="text-xs text-on-surface-variant mb-5 bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/20">
        <span className="font-bold text-on-surface">Note:</span> Fill address and contact details for each party. Use the tabs to switch between parties.
      </p>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 bg-surface-container p-1 rounded-xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Applicant */}
      {activeTab === 'applicant' && (
        <PartyContactBlock
          label="Applicant"
          headerColor="bg-primary"
          contact={formData.applicantContact}
          onChange={updates => updateFormData({ applicantContact: { ...formData.applicantContact, ...updates } })}
        />
      )}

      {/* Co-Applicant */}
      {activeTab === 'coApplicant' && (
        <PartyContactBlock
          label="Co-Applicant"
          headerColor="bg-secondary"
          contact={formData.coApplicantContact}
          onChange={updates => updateFormData({ coApplicantContact: { ...formData.coApplicantContact, ...updates } })}
        />
      )}

      {/* Guarantor */}
      {activeTab === 'guarantor' && (
        <PartyContactBlock
          label="Guarantor"
          headerColor="bg-tertiary"
          contact={formData.guarantorContact}
          onChange={updates => updateFormData({ guarantorContact: { ...formData.guarantorContact, ...updates } })}
        />
      )}
    </div>
  );
}
