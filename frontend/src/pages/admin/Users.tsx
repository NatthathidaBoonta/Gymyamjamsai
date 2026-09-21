import React, { useState, useEffect } from 'react';
import { userService, type User, type UserRole } from '../../services/user.service';
import { ApiError } from '../../services/api';
import './Users.css';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

interface UserFormData {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

const EMPTY_FORM: UserFormData = { id: '', email: '', password: '', role: 'member', is_active: true };

function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState<UserFormData>(EMPTY_FORM);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(errorMessage(err, 'เกิดข้อผิดพลาดในการโหลดข้อมูล'));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormData(EMPTY_FORM);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setFormData({
      id: user.id,
      email: user.email,
      password: '',
      role: user.role,
      is_active: Boolean(user.is_active)
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.createUser({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(errorMessage(err, 'ไม่สามารถเพิ่มผู้ใช้งานได้'));
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userService.updateUser(formData.id, {
        role: formData.role,
        is_active: formData.is_active ? 1 : 0,
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(errorMessage(err, 'ไม่สามารถแก้ไขข้อมูลได้'));
    }
  };

  return (
    <div className="users-page">
      <div className="users-header">
        <h2>จัดการผู้ใช้งาน</h2>
        <button className="btn btn-primary" onClick={handleOpenAdd}>+ เพิ่มผู้ใช้งาน</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">กำลังโหลด...</div>
      ) : (
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>อีเมล</th>
                <th>ชื่อ-นามสกุล</th>
                <th>บทบาท</th>
                <th>สถานะ</th>
                <th>วันที่สร้าง</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.email}</td>
                  <td>
                    {user.first_name || user.last_name 
                      ? `${user.first_name || ''} ${user.last_name || ''}` 
                      : '-'}
                  </td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${user.is_active ? 'active' : 'suspended'}`}>
                      {user.is_active ? 'ใช้งานปกติ' : 'ระงับบัญชี'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('th-TH')}</td>
                  <td>
                    <button className="btn btn-sm btn-secondary" onClick={() => handleOpenEdit(user)}>แก้ไข</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>เพิ่มผู้ใช้งานใหม่</h3>
            <form onSubmit={handleSubmitAdd}>
              <div className="form-group">
                <label>อีเมล</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>รหัสผ่าน</label>
                <input 
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>บทบาท</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value="member">Member</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>แก้ไขผู้ใช้งาน ({formData.email})</h3>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>บทบาท</label>
                <select 
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                >
                  <option value="member">Member</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>สถานะบัญชี</label>
                <div className="toggle-group">
                  <label>
                    <input 
                      type="radio" 
                      name="status"
                      checked={formData.is_active === true}
                      onChange={() => setFormData({...formData, is_active: true})}
                    />
                     ใช้งานปกติ
                  </label>
                  <label>
                    <input 
                      type="radio" 
                      name="status"
                      checked={formData.is_active === false}
                      onChange={() => setFormData({...formData, is_active: false})}
                    />
                     ระงับบัญชี
                  </label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
