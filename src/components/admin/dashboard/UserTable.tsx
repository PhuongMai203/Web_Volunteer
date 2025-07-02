'use client';
import { FaEdit, FaLock, FaLockOpen, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import styles from "@/styles/admin/UserManagement.module.css";

interface UserTableProps {
  users: any[];
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  getUserStatus: (user: any) => string;
  displayRole: (role: string) => string;
  formatDate: (date: any) => string;
  onEdit: (user: any) => void;
  onLock: (user: any) => void;
  onApprove: (user: any) => void;
  onDelete: (user: any) => void;

  loading: boolean;
}

export default function UserTable({
  users,
  totalUsers,
  currentPage,
  totalPages,
  setCurrentPage,
  getUserStatus,
  displayRole,
  formatDate,
  onEdit,
  onLock,
  onApprove,
  onDelete,  
  loading
}: UserTableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.userTable}>
        <thead>
          <tr>
            <th>Người dùng</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hạng</th>
            <th>Trạng thái</th>
            <th>Ngày tham gia</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const status = getUserStatus(user);
            const isOrganization = user.role === "organization";
            const isApproved = user.isApproved === true;
            const isDisabled = user.isDisabled === true;

            return (
              <tr key={user.id}>
                <td>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      <span>{user.name?.charAt(0) || "?"}</span>
                    </div>
                    <div className={styles.userDetails}>
                      <div className={styles.userName}>{user.name || "Không rõ"}</div>
                      <div className={styles.userId}>ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td>{user.email || "-"}</td>
                <td>{displayRole(user.role)}</td>
                <td>{user.rank || "-"}</td>
                <td>
                  <span className={`${styles.statusBadge} ${status === "active" ? styles.statusActive : styles.statusInactive}`}>
                    {status === "active" ? "Hoạt động" : "Đã khóa"}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className={styles.actionButtons}>
                    {/* Nếu là tổ chức chưa phê duyệt thì chỉ hiện nút Phê duyệt */}
                    {isOrganization && !isApproved ? (
                      <button
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        title="Phê duyệt"
                        onClick={() => onApprove(user)}
                      >
                        Phê duyệt
                      </button>
                    ) : (
                      <>
                        <button
                          className={styles.actionButton}
                          title="Chỉnh sửa"
                          onClick={() => onEdit(user)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`${styles.actionButton} ${isDisabled ? styles.unlockButton : styles.lockButton}`}
                          title={isDisabled ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                          onClick={() => onLock(user)}
                        >
                          {isDisabled ? <FaLockOpen /> : <FaLock />}
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.deleteButton}`}
                          title="Xóa"
                          onClick={() => onDelete(user)}
                        >
                          <FaTrash />
                        </button>

                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {users.length === 0 && !loading && (
        <div className={styles.noResults}><p>Không tìm thấy người dùng phù hợp</p></div>
      )}
      {loading && (
        <div className={styles.noResults}><p>Đang tải dữ liệu...</p></div>
      )}

      <div className={styles.tableFooter}>
        <div className={styles.tableInfo}>
          Hiển thị {users.length === 0 ? 0 : (currentPage - 1) * 10 + 1}-
          {Math.min(currentPage * 10, totalUsers)} của {totalUsers} kết quả
        </div>
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaArrowLeft />
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              className={`${styles.pageButton} ${currentPage === index + 1 ? styles.activePage : ""}`}
              onClick={() => setCurrentPage(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className={styles.pageButton}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
