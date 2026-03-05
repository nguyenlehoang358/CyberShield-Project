import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Plus, Edit, Trash2, Save, X, MoveUp, MoveDown } from 'lucide-react'

export default function SolutionManager() {
    const { api } = useAuth()
    const [solutions, setSolutions] = useState([])
    const [loading, setLoading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState(initialFormState())
    const [isAdding, setIsAdding] = useState(false)

    function initialFormState() {
        return {
            titleVi: '', titleEn: '',
            descriptionVi: '', descriptionEn: '',
            icon: 'Zap', color: 'blue',
            displayOrder: 0, active: true
        }
    }

    useEffect(() => {
        loadSolutions()
    }, [])

    const loadSolutions = async () => {
        setLoading(true)
        try {
            const res = await api.get('/admin/solutions')
            setSolutions(res.data)
        } catch (err) {
            console.error('Failed to load solutions', err)
        }
        setLoading(false)
    }

    const handleEdit = (sol) => {
        setEditingId(sol.id)
        setFormData({ ...sol })
        setIsAdding(false)
    }

    const handleAdd = () => {
        setEditingId(null)
        setFormData(initialFormState())
        setIsAdding(true)
    }

    const handleCancel = () => {
        setEditingId(null)
        setIsAdding(false)
        setFormData(initialFormState())
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa giải pháp này?')) return
        try {
            await api.delete(`/admin/solutions/${id}`)
            setSolutions(prev => prev.filter(s => s.id !== id))
        } catch (err) {
            alert('Lỗi khi xóa: ' + err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (isAdding) {
                const res = await api.post('/admin/solutions', formData)
                setSolutions([...solutions, res.data])
            } else {
                const res = await api.put(`/admin/solutions/${editingId}`, formData)
                setSolutions(solutions.map(s => s.id === editingId ? res.data : s))
            }
            handleCancel()
        } catch (err) {
            alert('Lỗi khi lưu: ' + (err.response?.data?.message || err.message))
        }
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    return (
        <div className="solution-manager">
            <div className="admin-table-header">
                <h3>Quản lý Giải pháp & Dịch vụ</h3>
                {!isAdding && !editingId && (
                    <button className="admin-btn admin-btn-sm" onClick={handleAdd}>
                        <Plus size={16} /> Thêm mới
                    </button>
                )}
            </div>

            {(isAdding || editingId) && (
                <form onSubmit={handleSubmit} className="admin-form-card">
                    <h4>{isAdding ? 'Thêm Giải pháp mới' : 'Chỉnh sửa Giải pháp'}</h4>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Tiêu đề (VI)</label>
                            <input name="titleVi" value={formData.titleVi} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Tiêu đề (EN)</label>
                            <input name="titleEn" value={formData.titleEn} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width">
                            <label>Mô tả (VI)</label>
                            <textarea name="descriptionVi" value={formData.descriptionVi} onChange={handleChange} required />
                        </div>
                        <div className="form-group full-width">
                            <label>Mô tả (EN)</label>
                            <textarea name="descriptionEn" value={formData.descriptionEn} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Icon (Lucide name)</label>
                            <input name="icon" value={formData.icon} onChange={handleChange} required />
                            <small>Vidụ: Zap, Shield, Database, Cloud</small>
                        </div>
                        <div className="form-group">
                            <label>Màu sắc (CSS class)</label>
                            <select name="color" value={formData.color} onChange={handleChange}>
                                <option value="blue">Blue</option>
                                <option value="purple">Purple</option>
                                <option value="pink">Pink</option>
                                <option value="coral">Coral</option>
                                <option value="green">Green</option>
                                <option value="cyan">Cyan</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Thứ tự hiển thị</label>
                            <input type="number" name="displayOrder" value={formData.displayOrder} onChange={handleChange} />
                        </div>
                        <div className="form-group checkbox-group">
                            <label>
                                <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} />
                                Hiển thị (Active)
                            </label>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="admin-btn admin-btn-primary">
                            <Save size={16} /> Lưu
                        </button>
                        <button type="button" className="admin-btn admin-btn-secondary" onClick={handleCancel}>
                            <X size={16} /> Hủy
                        </button>
                    </div>
                </form>
            )}

            <div className="admin-table-scroll">
                <table className="admin-data-table">
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Icon</th>
                            <th>Tiêu đề (VI)</th>
                            <th>Mô tả (VI)</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {solutions.sort((a, b) => a.displayOrder - b.displayOrder).map(sol => (
                            <tr key={sol.id}>
                                <td>{sol.displayOrder}</td>
                                <td><span className={`solution-card-icon ${sol.color} small-icon`}>{sol.icon}</span></td>
                                <td>{sol.titleVi}</td>
                                <td className="truncate-text" title={sol.descriptionVi}>{sol.descriptionVi}</td>
                                <td>
                                    <span className={`admin-status ${sol.active ? 'active' : 'locked'}`}>
                                        {sol.active ? 'Yes' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="icon-btn edit" onClick={() => handleEdit(sol)}><Edit size={16} /></button>
                                        <button className="icon-btn delete" onClick={() => handleDelete(sol.id)}><Trash2 size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <style>{`
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                .full-width { grid-column: span 2; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
                .form-group input, .form-group textarea, .form-group select {
                    width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-main); color: var(--text-primary);
                }
                .form-group textarea { height: 80px; }
                .admin-form-card {
                    background: var(--bg-card); padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;
                    border: 1px solid var(--border-color);
                }
                .form-actions { display: flex; gap: 1rem; justify-content: flex-end; }
                .checkbox-group { display: flex; align-items: center; }
                .checkbox-group input { width: auto; margin-right: 0.5rem; }
                .truncate-text { max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .small-icon { font-size: 12px; padding: 4px; border-radius: 4px; display: inline-block; }
                .action-buttons { display: flex; gap: 0.5rem; }
                .icon-btn { border: none; background: none; cursor: pointer; padding: 4px; }
                .icon-btn.edit { color: var(--accent-color); }
                .icon-btn.delete { color: var(--lab-red); }
                .admin-btn-primary { background: var(--accent-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
                .admin-btn-secondary { background: var(--bg-sidebar); color: var(--text-primary); border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
            `}</style>
        </div>
    )
}
