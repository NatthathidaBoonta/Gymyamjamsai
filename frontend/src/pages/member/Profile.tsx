import { useState, useEffect } from 'react';
import * as profileService from '../../services/profile.service';
import './Profile.css';

function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    fitnessGoal: '',
    medicalConditions: '',
    weight: '',
    height: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        fitnessGoal: data.fitness_goal || '',
        medicalConditions: data.medical_conditions || '',
        weight: data.weight_kg ? data.weight_kg.toString() : '',
        height: data.height_cm ? data.height_cm.toString() : '',
      });
    } catch (err: any) {
      setError('ไม่สามารถโหลดข้อมูลโปรไฟล์');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await profileService.updateProfile(formData);
      await loadProfile();
      setIsEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError('ไม่สามารถบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>กำลังโหลด...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <div className="profile-header-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div className="avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--ember-tint)', border: '1px solid var(--line)', color: 'var(--ember)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
              <i className="ri-user-smile-line"></i>
            </div>
            <div className="profile-info-header">
              <h2 className="profile-name">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="profile-email">{profile?.email}</p>
            </div>
          </div>
          <button className="btn" onClick={() => setIsEditing(!isEditing)} style={{ background: 'var(--surface)', border: '1px solid var(--line)', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isEditing ? <><i className="ri-close-line"></i> ยกเลิก</> : <><i className="ri-edit-line"></i> แก้ไขโปรไฟล์</>}
          </button>
        </div>

        {success && (
          <div className="message success" style={{ padding: '0.8rem', background: 'var(--ok-tint)', color: 'var(--ok)', borderRadius: '8px', marginBottom: '1rem' }}>
            Success
          </div>
        )}

        {error && (
          <div className="message error" style={{ padding: '0.8rem', background: 'var(--danger-tint)', color: 'var(--danger)', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {!isEditing ? (
          <>
            <div className="profile-card" style={{ marginTop: '1.5rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
              <div className="profile-card-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem' }}>
                  <i className="ri-information-line" style={{ color: 'var(--ember)' }}></i> ข้อมูลส่วนตัว
                </h3>
              </div>
              <div className="info-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.2rem' }}>
                <div className="info-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ background: 'var(--surface)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ember)', border: '1px solid var(--line)' }}>
                    <i className="ri-mail-line" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)' }}>อีเมล</span>
                    <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text)' }}>{profile?.email || '-'}</span>
                  </div>
                </div>
                <div className="info-item" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ background: 'var(--surface)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ember)', border: '1px solid var(--line)' }}>
                    <i className="ri-focus-3-line" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)' }}>เป้าหมาย</span>
                    <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text)' }}>{profile?.fitness_goal || '-'}</span>
                  </div>
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', alignItems: 'center', background: 'var(--bg)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
                  <div style={{ background: 'var(--surface)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ember)', border: '1px solid var(--line)' }}>
                    <i className="ri-heart-pulse-line" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-2)' }}>โรคประจำตัว</span>
                    <span style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text)' }}>{profile?.medical_conditions || 'ไม่มี'}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="profile-card" style={{ marginTop: '1.5rem', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="ri-edit-box-line" style={{ color: 'var(--ember)' }}></i> แก้ไขข้อมูล
            </h3>
            <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>ชื่อจริง</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
                  />
                </div>
                <div className="form-group">
                  <label style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>นามสกุล</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>เป้าหมาย (Fitness Goal)</label>
                <input
                  type="text"
                  name="fitnessGoal"
                  value={formData.fitnessGoal}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)' }}
                />
              </div>

              <div className="form-group">
                <label style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>โรคประจำตัว</label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleInputChange}
                  rows={3}
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--text)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="submit" disabled={saving} className="btn btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {saving ? <><i className="ri-loader-4-line ri-spin"></i> กำลังบันทึก...</> : <><i className="ri-save-line"></i> บันทึกข้อมูล</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
