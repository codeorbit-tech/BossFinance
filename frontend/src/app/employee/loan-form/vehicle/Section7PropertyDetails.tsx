'use client';

import { VehicleLoanFormData, VehicleOwned, ImmovableProperty, ImmovableAssetType, emptyImmovable } from './types';

interface Props {
  formData: VehicleLoanFormData;
  updateFormData: (updates: Partial<VehicleLoanFormData>) => void;
  errors: string[];
}

const IMMOVABLE_ASSET_TYPES: ImmovableAssetType[] = [
  'Vacant Land', 'Apartments', 'Building Residential', 'Building Commercial', 'Others',
];

const inputCls = `w-full bg-surface-container-high border border-transparent focus:border-accent/40 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-accent/30 transition-all`;

function VehicleOwnedTable({
  label, headerColor, vehicles, onChange
}: {
  label: string; headerColor: string; vehicles: VehicleOwned[];
  onChange: (vehicles: VehicleOwned[]) => void;
}) {
  const updateRow = (idx: number, updates: Partial<VehicleOwned>) => {
    const updated = [...vehicles];
    updated[idx] = { ...updated[idx], ...updates };
    onChange(updated);
  };

  return (
    <div>
      <div className={`px-4 py-2.5 rounded-t-xl flex items-center gap-2 ${headerColor}`}>
        <span className="material-symbols-outlined text-white text-sm">directions_car</span>
        <span className="text-xs font-bold text-white uppercase tracking-wider">{label} — Vehicles Owned</span>
      </div>
      <div className="overflow-x-auto border border-outline-variant/20 border-t-0 rounded-b-xl">
        <table className="w-full min-w-[700px]">
          <thead className="bg-surface-container-high">
            <tr>
              {['#', 'Vehicle', 'Registration No.', 'Make & Model', 'Declared Value (₹)', 'Financed By'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v, idx) => (
              <tr key={idx} className="border-t border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                <td className="px-3 py-3 text-xs font-bold text-on-surface-variant">{idx + 1}</td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={v.vehicle}
                    onChange={e => updateRow(idx, { vehicle: e.target.value })}
                    placeholder="e.g. Car, Bike"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={v.registrationNo}
                    onChange={e => updateRow(idx, { registrationNo: e.target.value })}
                    placeholder="TN-XX-XX-XXXX"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={v.makeModel}
                    onChange={e => updateRow(idx, { makeModel: e.target.value })}
                    placeholder="Brand, Model"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-bold">₹</span>
                    <input
                      type="number"
                      value={v.declaredValue}
                      onChange={e => updateRow(idx, { declaredValue: e.target.value })}
                      placeholder="0"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={v.financedBy}
                    onChange={e => updateRow(idx, { financedBy: e.target.value })}
                    placeholder="Bank / Self"
                    className={inputCls}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
        <span className="material-symbols-outlined text-sm text-accent">info</span>
        If more vehicles, details may be furnished separately.
      </p>
    </div>
  );
}

function ImmovablePropertyTable({
  properties, onChange
}: {
  properties: ImmovableProperty[];
  onChange: (props: ImmovableProperty[]) => void;
}) {
  const updateRow = (idx: number, updates: Partial<ImmovableProperty>) => {
    const updated = [...properties];
    updated[idx] = { ...updated[idx], ...updates };
    onChange(updated);
  };

  const addRow = () => onChange([...properties, emptyImmovable()]);

  const removeRow = (idx: number) => {
    if (properties.length === 1) return;
    onChange(properties.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <div className="overflow-x-auto rounded-xl border border-outline-variant/20">
        <table className="w-full min-w-[700px]">
          <thead className="bg-surface-container-high">
            <tr>
              {['#', 'Asset Type', 'Built-up Area (Sq.ft/Acres)', 'Land Area / UDS', 'Declared Value (₹)', ''].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {properties.map((prop, idx) => (
              <tr key={idx} className="border-t border-outline-variant/10 hover:bg-surface-container/30 transition-colors">
                <td className="px-3 py-3 text-xs font-bold text-on-surface-variant">{idx + 1}</td>
                <td className="px-3 py-3 min-w-[180px]">
                  <select
                    value={prop.assetType}
                    onChange={e => updateRow(idx, { assetType: e.target.value as ImmovableAssetType })}
                    className={`${inputCls} appearance-none`}
                  >
                    <option value="">Select Type</option>
                    {IMMOVABLE_ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {prop.assetType === 'Others' && (
                    <input
                      type="text"
                      value={prop.assetTypeOther}
                      onChange={e => updateRow(idx, { assetTypeOther: e.target.value })}
                      placeholder="Specify..."
                      className={`${inputCls} mt-1`}
                    />
                  )}
                </td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={prop.builtUpArea}
                    onChange={e => updateRow(idx, { builtUpArea: e.target.value })}
                    placeholder="e.g. 1200 sq.ft"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={prop.landArea}
                    onChange={e => updateRow(idx, { landArea: e.target.value })}
                    placeholder="e.g. 0.5 acres"
                    className={inputCls}
                  />
                </td>
                <td className="px-3 py-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-bold">₹</span>
                    <input
                      type="number"
                      value={prop.declaredValue}
                      onChange={e => updateRow(idx, { declaredValue: e.target.value })}
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <button
                    type="button"
                    onClick={() => removeRow(idx)}
                    disabled={properties.length === 1}
                    className="w-7 h-7 rounded-lg bg-error/10 text-error flex items-center justify-center hover:bg-error/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-accent/40 text-accent text-xs font-bold hover:bg-accent/5 transition-all"
      >
        <span className="material-symbols-outlined text-sm">add</span>
        Add Property
      </button>
    </div>
  );
}

export default function Section7PropertyDetails({ formData, updateFormData }: Props) {
  return (
    <div className="space-y-8">
      {/* Vehicles Owned */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">directions_car</span>
          Vehicles Owned
        </h4>
        <div className="space-y-6">
          <VehicleOwnedTable
            label="Applicant"
            headerColor="bg-primary"
            vehicles={formData.applicantVehiclesOwned}
            onChange={v => updateFormData({ applicantVehiclesOwned: v })}
          />
          <VehicleOwnedTable
            label="Co-Applicant"
            headerColor="bg-secondary"
            vehicles={formData.coApplicantVehiclesOwned}
            onChange={v => updateFormData({ coApplicantVehiclesOwned: v })}
          />
        </div>
      </div>

      {/* Other Movable Properties */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">savings</span>
          Other Movable Property
        </h4>
        <div className="bg-surface-container/50 rounded-xl p-4 border border-outline-variant/20 space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Description (Investment Bonds, FDs, etc.)
            </label>
            <input
              type="text"
              value={formData.movablePropertyDescription}
              onChange={e => updateFormData({ movablePropertyDescription: e.target.value })}
              placeholder="e.g. Fixed Deposits, NSC, Bonds..."
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">Total Value (₹)</label>
            <div className="relative max-w-xs">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input
                type="number"
                value={formData.movablePropertyValue}
                onChange={e => updateFormData({ movablePropertyValue: e.target.value })}
                placeholder="0"
                className={`${inputCls} pl-8`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Immovable Property */}
      <div>
        <h4 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-base">real_estate_agent</span>
          Immovable Property (Applicant + Co-Applicant)
        </h4>
        <ImmovablePropertyTable
          properties={formData.immovableProperties}
          onChange={props => updateFormData({ immovableProperties: props })}
        />
      </div>
    </div>
  );
}
