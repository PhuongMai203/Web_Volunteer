'use client';
import React, { useEffect, useState } from "react";
import StatsOverview from "./StatsOverview";
import UserTable from "./UserTable";
import EditUserModal from "./EditUserModal";
import { collection, doc, getDocs, updateDoc, deleteDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import styles from "@/styles/admin/UserManagement.module.css";
import { FaSearch, FaPlus, FaFilter, FaUser } from 'react-icons/fa';

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "" });
  const resultsPerPage = 10;

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(userList);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLockAccount = async (user: any) => {
    try {
      await updateDoc(doc(db, "users", user.id), { isDisabled: !user.isDisabled });
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, isDisabled: !user.isDisabled } : u
        )
      );
    } catch (error) {
      console.error("Lỗi khóa/mở khóa tài khoản:", error);
    }
  };

  const handleApproveOrganization = async (user: any) => {
    try {
      await updateDoc(doc(db, "users", user.id), { isApproved: true });
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, isApproved: true } : u
        )
      );
    } catch (error) {
      console.error("Lỗi phê duyệt tổ chức:", error);
    }
  };

  const handleSave = async (updatedUser: any) => {
    try {
      await updateDoc(doc(db, "users", updatedUser.id), {
        email: updatedUser.email,
        name: updatedUser.name,
        rank: updatedUser.rank,
        role: updatedUser.role,
      });
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      setSelectedUser(null);
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
    }
  };

  const handleDelete = async (user: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${user.name}" không?`)) {
      try {
        await deleteDoc(doc(db, "users", user.id));
        fetchUsers();
      } catch (error) {
        console.error("Lỗi xóa tài khoản:", error);
      }
    }
  };

const handleAddUser = async () => {
  if (!newUser.email || !newUser.name || !newUser.password) {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
    
    await addDoc(collection(db, "users"), {
      email: newUser.email,
      name: newUser.name,
      role: "user",
      rank: "Đồng",
      isApproved: true,
      isDisabled: false,
      createdAt: serverTimestamp(),
      uid: userCredential.user.uid
    })

    await addDoc(collection(db, "activities"), {
      action: "Thêm người dùng mới",
      user: auth.currentUser?.email || "Hệ thống",
      createdAt: serverTimestamp()
    });

    alert("Thêm người dùng thành công!");
    setShowAddModal(false);
    setNewUser({ email: "", name: "", password: "" });
    fetchUsers();
  } catch (error) {
    console.error("Lỗi thêm người dùng:", error);
    alert("Thêm người dùng thất bại!");
  }
};
  const getUserStatus = (user: any) => {
    return user.isApproved === false ? "inactive" : "active";
  };

  const displayRole = (role: string) => {
    switch (role) {
      case "user": return "Tình nguyện viên";
      case "organization": return "Tổ chức";
      case "admin": return "Quản trị viên";
      default: return role;
    }
  };

  const formatDate = (date: any) => {
    if (!date?.toDate) return "-";
    return new Date(date.toDate()).toLocaleDateString('vi-VN');
  };

  const filteredUsers = users.filter(user => {
    if (user.role === "admin") return false;
    const status = getUserStatus(user);
    return (activeFilter === "all" || status === activeFilter) &&
           (roleFilter === "all" || user.role === roleFilter);
  });

  const totalPages = Math.ceil(filteredUsers.length / resultsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const totalUsers = users.filter(u => u.role !== "admin").length;
  const activeUsers = users.filter(u => u.role !== "admin" && u.isApproved !== false).length;
  const inactiveUsers = users.filter(u => u.role !== "admin" && u.isApproved === false).length;

  return (
    <div className={styles.container}>   
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Quản Lý Người Dùng</h1>
          <p className={styles.pageSubTitle}>Quản lý tất cả người dùng trong hệ thống</p>
        </div>

        <StatsOverview total={totalUsers} active={activeUsers} inactive={inactiveUsers} admin={1} />

        <div className={styles.controlPanel}>
          <div className={styles.searchContainer}>
            <FaSearch className={styles.searchIcon} />
            <input type="text" placeholder="Tìm kiếm người dùng..." className={styles.searchInput} disabled />
          </div>
          
          <div className={styles.filterGroup}>
            <div className={styles.filterContainer}>
              <FaFilter className={styles.filterIcon} />
              <select className={styles.filterSelect} value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Đã khóa</option>
              </select>
            </div>
            
            <div className={styles.filterContainer}>
              <FaUser className={styles.filterIcon} />
              <select className={styles.filterSelect} value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                <option value="all">Tất cả vai trò</option>
                <option value="user">Tình nguyện viên</option>
                <option value="organization">Tổ chức</option>
              </select>
            </div>
          </div>
          
          <button className={styles.addButton} onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm người dùng
          </button>
        </div>

        <UserTable 
          users={paginatedUsers}
          totalUsers={filteredUsers.length}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          getUserStatus={getUserStatus}
          displayRole={displayRole}
          formatDate={formatDate}
          onEdit={(user) => setSelectedUser(user)}
          onLock={handleLockAccount}
          onApprove={handleApproveOrganization}
          loading={loading}
          onDelete={handleDelete}
        />

        {selectedUser && (
          <EditUserModal 
            selectedUser={selectedUser} 
            setSelectedUser={setSelectedUser} 
            onSave={() => handleSave(selectedUser)} 
          />
        )}

        {showAddModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h2>Thêm người dùng mới</h2>
              <input
                type="text"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Tên đăng nhập"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                type="password"
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              <div className={styles.modalActions}>
                <button onClick={handleAddUser} className={styles.addButton}>Thêm</button>
                <button onClick={() => setShowAddModal(false)} className={styles.cancelButton}>Hủy</button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
