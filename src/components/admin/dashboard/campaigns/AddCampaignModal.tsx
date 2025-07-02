import React from "react";

interface AddCampaignModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function AddCampaignModal({ onClose, onSubmit }: AddCampaignModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="bg-orange-500 text-white p-4 rounded-t-xl flex justify-between items-center">
          <h3 className="text-lg font-bold">Thêm Chiến Dịch Mới</h3>
          <button onClick={onClose} className="text-white hover:text-orange-200">✕</button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Tên chiến dịch</label>
            <input name="name" type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Nhập tên chiến dịch" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Ngày diễn ra</label>
            <input name="date" type="date" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Số lượng tình nguyện viên</label>
            <input name="volunteers" type="number" min="1" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Trạng thái</label>
            <select name="status" required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="active">Đang hoạt động</option>
              <option value="upcoming">Sắp diễn ra</option>
              <option value="completed">Đã hoàn thành</option>
            </select>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Mô tả chiến dịch</label>
            <textarea name="description" rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Mô tả chi tiết về chiến dịch"></textarea>
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">Thêm Chiến Dịch</button>
          </div>
        </form>
      </div>
    </div>
  );
}
