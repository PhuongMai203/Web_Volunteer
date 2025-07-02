'use client';
import { FaSave, FaTimes } from 'react-icons/fa';
import styles from "@/styles/admin/UserManagement.module.css";

interface EditUserModalProps {
  selectedUser: any;
  setSelectedUser: (user: any | null) => void;
  onSave: () => void;
}

export default function EditUserModal({ selectedUser, setSelectedUser, onSave }: EditUserModalProps) {
  return (
    <div className={styles.editOverlay}>
      <div className={styles.editForm}>
        <h3>Chỉnh sửa người dùng</h3>
        <label>Email</label>
        <input
          type="email"
          value={selectedUser.email}
          onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
        />
        <label>Tên</label>
        <input
          type="text"
          value={selectedUser.name}
          onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
        />
        <label>Hạng</label>
        <input
          type="text"
          value={selectedUser.rank || ""}
          onChange={(e) => setSelectedUser({ ...selectedUser, rank: e.target.value })}
        />
        <label>Vai trò</label>
        <select
          value={selectedUser.role}
          onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
        >
          <option value="user">Tình nguyện viên</option>
          <option value="organization">Tổ chức</option>
        </select>
        <div className={styles.editButtons}>
          <button onClick={onSave}><FaSave /> Lưu</button>
          <button onClick={() => setSelectedUser(null)}><FaTimes /> Hủy</button>
        </div>
      </div>
    </div>
  );
}
