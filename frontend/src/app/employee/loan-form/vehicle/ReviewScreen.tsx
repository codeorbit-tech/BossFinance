'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { VehicleLoanFormData, PhotoUploads } from './types';

interface Props {
  formData: VehicleLoanFormData;
  photos: PhotoUploads;
  onEdit: (section: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}

function SectionReviewCard({
  sectionNo, title, icon, onEdit, children
}: {
  sectionNo: number; title: string; icon: string; onEdit: () => void; children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-outline-variant/10 bg-surface-container/50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">{sectionNo}</div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-accent text-base">{icon}</span>
            <h4 className="text-sm font-bold text-on-surface">{title}</h4>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/30 text-xs font-bold text-on-surface-variant hover:text-primary hover:border-primary/40 transition-all"
        >
          <span className="material-symbols-outlined text-sm">edit</span>
          Edit
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest shrink-0 w-36">{label}</span>
      <span className="text-sm text-on-surface font-medium">{value || <span className="text-on-surface-variant/40 italic text-xs">Not provided</span>}</span>
    </div>
  );
}

function PartyChip({ label, color }: { label: string; color: string }) {
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wide ${color}`}>{label}</span>;
}

export default function ReviewScreen({ formData, photos, onEdit, onBack, onSubmit, submitting }: Props) {
  const photoCount = [photos.frontView, photos.leftSideView, photos.rightSideView, photos.backView].filter(Boolean).length
    + photos.others.filter(Boolean).length;

  const kycVerifiedDocs = Object.values(formData.kycDocuments).filter(
    d => d.applicantChecked || d.coApplicantChecked || d.guarantorChecked
  ).length;

  const preSanctionChecked = Object.entries(formData.preSanctionDocs).filter(
    ([k, v]) => k !== 'othersText' && v === true
  ).length;

  const postDisburseChecked = Object.entries(formData.postDisbursementDocs).filter(
    ([k, v]) => k !== 'othersText' && v === true
  ).length;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Review Header */}
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center mx-auto mb-3">
          <span className="material-symbols-outlined text-accent text-3xl">preview</span>
        </div>
        <h3 className="text-xl font-extrabold font-[var(--font-headline)] text-on-surface">Review Application</h3>
        <p className="text-sm text-on-surface-variant mt-1">
          Please review all sections carefully before submitting.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Form No.', value: formData.applicationFormNo, icon: 'tag' },
          { label: 'Date', value: formData.applicationDate, icon: 'calendar_today' },
          { label: 'Photos', value: `${photoCount} uploaded`, icon: 'photo_camera' },
          { label: 'KYC Docs', value: `${kycVerifiedDocs}/9 verified`, icon: 'badge' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container rounded-xl p-3 text-center">
            <span className="material-symbols-outlined text-accent text-xl mb-1 block">{stat.icon}</span>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</p>
            <p className="text-sm font-bold text-on-surface mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Section 1 */}
      <SectionReviewCard sectionNo={1} title="Application Info" icon="assignment" onEdit={() => onEdit(1)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DataRow label="Form No." value={formData.applicationFormNo} />
          <DataRow label="Date" value={formData.applicationDate} />
          <DataRow label="UDYAM Reg. No." value={formData.udyamRegNo} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { party: 'Applicant', type: formData.applicantEntityType, color: 'bg-primary' },
            { party: 'Co-Applicant', type: formData.coApplicantEntityType, color: 'bg-secondary' },
            { party: 'Guarantor', type: formData.guarantorEntityType, color: 'bg-tertiary' },
          ].map(({ party, type, color }) => (
            <div key={party} className="bg-surface-container rounded-xl p-3 text-center">
              <PartyChip label={party} color={color} />
              <p className="text-xs font-bold text-on-surface mt-2">{type || '—'}</p>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 2 */}
      <SectionReviewCard sectionNo={2} title="Personal Details" icon="person" onEdit={() => onEdit(2)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { party: 'Applicant', data: formData.applicantPersonal, color: 'bg-primary' },
            { party: 'Co-Applicant', data: formData.coApplicantPersonal, color: 'bg-secondary' },
            { party: 'Guarantor', data: formData.guarantorPersonal, color: 'bg-tertiary' },
          ].map(({ party, data, color }) => (
            <div key={party} className="bg-surface-container rounded-xl p-3">
              <PartyChip label={party} color={color} />
              <div className="mt-2 space-y-1.5">
                <p className="text-sm font-bold text-on-surface">
                  {[data.firstName, data.middleName, data.lastName].filter(Boolean).join(' ') || '—'}
                </p>
                <p className="text-xs text-on-surface-variant">{data.gender || '—'} &bull; {data.dob || '—'}</p>
                {data.religion.length > 0 && (
                  <p className="text-[10px] text-on-surface-variant">Religion: {data.religion.join(', ')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 3 */}
      <SectionReviewCard sectionNo={3} title="Address & Contact" icon="location_on" onEdit={() => onEdit(3)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { party: 'Applicant', data: formData.applicantContact, color: 'bg-primary' },
            { party: 'Co-Applicant', data: formData.coApplicantContact, color: 'bg-secondary' },
            { party: 'Guarantor', data: formData.guarantorContact, color: 'bg-tertiary' },
          ].map(({ party, data, color }) => (
            <div key={party} className="bg-surface-container rounded-xl p-3">
              <PartyChip label={party} color={color} />
              <div className="mt-2 space-y-1.5">
                <p className="text-xs text-on-surface">{data.communicationAddress.fullAddress || '—'}</p>
                <p className="text-xs text-on-surface-variant">{data.communicationAddress.city}, {data.communicationAddress.state} {data.communicationAddress.pinCode}</p>
                <p className="text-xs font-bold text-on-surface">{data.mobile || '—'}</p>
                {data.email && <p className="text-xs text-on-surface-variant">{data.email}</p>}
              </div>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 4 */}
      <SectionReviewCard sectionNo={4} title="Residence Info" icon="home" onEdit={() => onEdit(4)}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { party: 'Applicant', data: formData.applicantResidence, color: 'bg-primary' },
            { party: 'Co-Applicant', data: formData.coApplicantResidence, color: 'bg-secondary' },
            { party: 'Guarantor', data: formData.guarantorResidence, color: 'bg-tertiary' },
          ].map(({ party, data, color }) => (
            <div key={party} className="bg-surface-container rounded-xl p-3">
              <PartyChip label={party} color={color} />
              <div className="mt-2 space-y-1">
                <DataRow label="Residence" value={data.residence} />
                <DataRow label="Marital Status" value={data.maritalStatus} />
                <DataRow label="Education" value={data.education} />
              </div>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 5 */}
      <SectionReviewCard sectionNo={5} title="Bank Details" icon="account_balance" onEdit={() => onEdit(5)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { party: 'Applicant', data: formData.applicantBank, color: 'bg-primary' },
            { party: 'Co-Applicant', data: formData.coApplicantBank, color: 'bg-secondary' },
          ].map(({ party, data, color }) => (
            <div key={party} className="bg-surface-container rounded-xl p-3">
              <PartyChip label={party} color={color} />
              <div className="mt-2 space-y-1">
                <p className="text-sm font-bold text-on-surface">{data.bankName || '—'}</p>
                <p className="text-xs text-on-surface-variant">{data.branch || 'Branch N/A'}</p>
                <p className="text-xs text-on-surface-variant">A/C: {data.accountNo || '—'} &bull; {data.accountType || '—'}</p>
                <p className="text-xs text-on-surface-variant">IFSC: {data.ifscCode || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 6 */}
      <SectionReviewCard sectionNo={6} title="Employment Details" icon="work" onEdit={() => onEdit(6)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { party: 'Applicant', data: formData.applicantEmployment, color: 'bg-primary' },
            { party: 'Co-Applicant', data: formData.coApplicantEmployment, color: 'bg-secondary' },
          ].map(({ party, data, color }) => (
            <div key={party} className="bg-surface-container rounded-xl p-3">
              <PartyChip label={party} color={color} />
              <div className="mt-2 space-y-1">
                <p className="text-sm font-bold text-on-surface">{data.establishmentName || '—'}</p>
                <p className="text-xs text-on-surface-variant">{data.designation || 'Designation N/A'}</p>
                <p className="text-xs text-on-surface-variant">{data.yearsOfEmployment ? `${data.yearsOfEmployment} years` : '—'} &bull; CTC: ₹{data.ctcPerAnnum ? parseInt(data.ctcPerAnnum).toLocaleString('en-IN') : '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 7 */}
      <SectionReviewCard sectionNo={7} title="Property Details" icon="real_estate_agent" onEdit={() => onEdit(7)}>
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant">
            Applicant vehicles: {formData.applicantVehiclesOwned.filter(v => v.vehicle).length} declared &bull;
            Co-Applicant vehicles: {formData.coApplicantVehiclesOwned.filter(v => v.vehicle).length} declared
          </p>
          {formData.movablePropertyDescription && (
            <DataRow label="Movable Assets" value={`${formData.movablePropertyDescription} — ₹${parseInt(formData.movablePropertyValue || '0').toLocaleString('en-IN')}`} />
          )}
          <p className="text-xs text-on-surface-variant">
            Immovable properties: {formData.immovableProperties.filter(p => p.assetType).length} declared
          </p>
        </div>
      </SectionReviewCard>

      {/* Section 8 */}
      <SectionReviewCard sectionNo={8} title="Vehicle Photos" icon="photo_camera" onEdit={() => onEdit(8)}>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Front', file: photos.frontView },
            { label: 'Left Side', file: photos.leftSideView },
            { label: 'Right Side', file: photos.rightSideView },
            { label: 'Back', file: photos.backView },
            ...photos.others.filter(Boolean).map((f, i) => ({ label: `Other ${i + 1}`, file: f })),
          ].map(({ label, file }) => (
            <div key={label} className={`text-center px-3 py-2 rounded-xl text-xs font-bold ${
              file ? 'bg-accent/10 text-accent' : 'bg-error/10 text-error'
            }`}>
              <span className="material-symbols-outlined text-base block mb-0.5" style={file ? { fontVariationSettings: "'FILL' 1" } : {}}>
                {file ? 'check_circle' : 'cancel'}
              </span>
              {label}
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Section 9 */}
      <SectionReviewCard sectionNo={9} title="Document Checklist" icon="checklist" onEdit={() => onEdit(9)}>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { label: 'KYC Documents Verified', value: `${kycVerifiedDocs}/9`, ok: kycVerifiedDocs > 0 },
            { label: 'Pre-Sanction Docs', value: `${preSanctionChecked} checked`, ok: preSanctionChecked > 0 },
            { label: 'Post-Disbursement Docs', value: `${postDisburseChecked} checked`, ok: postDisburseChecked > 0 },
          ].map(({ label, value, ok }) => (
            <div key={label} className={`rounded-xl p-3 border ${ok ? 'bg-accent/5 border-accent/20' : 'bg-surface-container border-outline-variant/20'}`}>
              <span className={`material-symbols-outlined text-xl block mb-1 ${ok ? 'text-accent' : 'text-on-surface-variant'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                {ok ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <p className={`text-xs font-bold ${ok ? 'text-accent' : 'text-on-surface-variant'}`}>{value}</p>
              <p className="text-[10px] text-on-surface-variant mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </SectionReviewCard>

      {/* Final Submit Buttons */}
      <div className="border-t border-outline-variant/20 pt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-surface-container text-on-surface-variant font-bold text-sm hover:bg-surface-container-high transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Go Back &amp; Edit
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-accent to-on-primary-container text-white font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-accent/20 disabled:opacity-50 active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">
            {submitting ? 'progress_activity' : 'send'}
          </span>
          {submitting ? 'Submitting...' : 'Confirm &amp; Submit Application'}
        </button>
      </div>
    </div>
  );
}
