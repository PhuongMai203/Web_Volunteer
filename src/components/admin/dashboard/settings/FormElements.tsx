import React from 'react';

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-10 p-6 bg-white rounded-xl shadow-md border border-orange-200">
    <h2 className="text-xl font-semibold text-orange-800 mb-4 pb-2 border-b border-orange-300">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

export const InputField = ({ 
  label, 
  name, 
  type = "text", 
  value, 
  onChange 
}: { 
  label: string; 
  name: string; 
  type?: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void 
}) => (
  <div className="flex flex-col">
    <label className="mb-1 text-orange-700 font-medium">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="p-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
);

export const TextArea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  rows = 4 
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; 
  rows?: number 
}) => (
  <div className="flex flex-col">
    <label className="mb-1 text-orange-700 font-medium">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className="p-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  </div>
);

export const FileInput = ({ label, onFileChange }: { label: string; onFileChange: (file: string) => void }) => (
  <div className="flex flex-col">
    <label className="mb-1 text-orange-700 font-medium">{label}</label>
    <div className="flex items-center">
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && onFileChange(URL.createObjectURL(e.target.files[0]))}
        className="hidden"
        id={label.replace(/\s+/g, '-')}
      />
      <label
        htmlFor={label.replace(/\s+/g, '-')}
        className="cursor-pointer bg-orange-100 text-orange-700 px-4 py-2 rounded border border-orange-300 hover:bg-orange-200"
      >
        Chọn tệp
      </label>
      <span className="ml-3 text-sm text-gray-500">.jpg, .png (max 2MB)</span>
    </div>
  </div>
);

export const RankInput = ({ 
  level, 
  value, 
  onChange, 
  color 
}: { 
  level: string; 
  value: number; 
  onChange: (value: number) => void; 
  color: string 
}) => (
  <div className="flex flex-col">
    <div className="flex items-center mb-1">
      <div className={`w-4 h-4 rounded-full ${color} mr-2`}></div>
      <span className="text-orange-700 font-medium">{level}</span>
    </div>
    <div className="flex">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 p-2 border border-orange-300 rounded focus:outline-none"
        min={0}
      />
      <span className="bg-orange-200 px-3 flex items-center rounded-r">điểm</span>
    </div>
  </div>
);

export const NumberInput = ({ 
  label, 
  value, 
  onChange, 
  min, 
  max 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void; 
  min: number; 
  max: number 
}) => (
  <div className="flex flex-col">
    <label className="mb-1 text-orange-700 font-medium">{label}</label>
    <div className="flex">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
        className="flex-1 p-2 border border-orange-300 rounded focus:outline-none"
        min={min}
        max={max}
      />
      <span className="bg-orange-200 px-3 flex items-center rounded-r">mục</span>
    </div>
  </div>
);

export const PolicyTextArea = ({ 
  label, 
  name, 
  value, 
  onChange,
  fullWidth = false
}: { 
  label: string; 
  name: string; 
  value: string; 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  fullWidth?: boolean;
}) => (
  <div className={`flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
    <label className="mb-2 text-orange-700 font-bold">{label}</label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={10}
      className="p-4 border-2 border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white shadow-sm"
    />
    <div className="mt-2 text-right text-sm text-orange-600">
      {value.length}/5000 ký tự
    </div>
  </div>
);