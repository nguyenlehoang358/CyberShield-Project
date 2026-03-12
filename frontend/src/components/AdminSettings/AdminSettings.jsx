import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../context/LanguageContext';
import './AdminSettings.css';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
    const { lang } = useLanguage();
    const { api } = useAuth();
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState('general'); // 'general', 'defense', 'ai', 'alert'

    // Filtered configs for General Tab
    const [generalSettings, setGeneralSettings] = useState({
        'general.maintenance_mode': 'false',
        'general.log_level': 'ALL',
        'general.default_lang': 'vi'
    });

    const [defenseSettings, setDefenseSettings] = useState({
        'defense.auto_ban_threshold': '5',
        'defense.block_duration_minutes': '60',
        'defense.ip_whitelist': ''
    });

    const [aiSettings, setAiSettings] = useState({
        'ai.sensitivity': 'MEDIUM',
        'ai.ollama_url': 'http://localhost:11434',
        'ai.ollama_model': 'llama3.2',
        'ai.auto_resolve': 'true'
    });

    const [alertSettings, setAlertSettings] = useState({
        'alert.admin_emails': 'admin@cybershield.local',
        'alert.webhook_url': ''
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/settings');
            const data = res.data;
            setSettings(data);

            const updatedGeneral = { ...generalSettings };
            const updatedDefense = { ...defenseSettings };
            const updatedAi = { ...aiSettings };
            const updatedAlert = { ...alertSettings };

            data.forEach(item => {
                if (updatedGeneral[item.settingKey] !== undefined) {
                    updatedGeneral[item.settingKey] = item.settingValue;
                }
                if (updatedDefense[item.settingKey] !== undefined) {
                    updatedDefense[item.settingKey] = item.settingValue;
                }
                if (updatedAi[item.settingKey] !== undefined) {
                    updatedAi[item.settingKey] = item.settingValue;
                }
                if (updatedAlert[item.settingKey] !== undefined) {
                    updatedAlert[item.settingKey] = item.settingValue;
                }
            });
            setGeneralSettings(updatedGeneral);
            setDefenseSettings(updatedDefense);
            setAiSettings(updatedAi);
            setAlertSettings(updatedAlert);
            setHasChanges(false);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneralChange = (key, value) => {
        setGeneralSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleDefenseChange = (key, value) => {
        setDefenseSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleAiChange = (key, value) => {
        setAiSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleAlertChange = (key, value) => {
        setAlertSettings(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const saveAllSettings = async () => {
        try {
            setSaving(true);
            const payload = {
                ...generalSettings,
                ...defenseSettings,
                ...aiSettings,
                ...alertSettings
            };
            await api.put('/admin/settings', payload);
            setHasChanges(false);
            alert(lang === 'vi' ? 'Đã lưu toàn bộ cấu hình thành công!' : 'All settings saved successfully!');
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert(lang === 'vi' ? 'Lưu thất bại!' : 'Failed to save!');
        } finally {
            setSaving(false);
        }
    };

    const testWebhook = async () => {
        try {
            setSaving(true);
            await api.post('/admin/settings/test-webhook');
            alert(lang === 'vi' ? 'Đã gửi tin nhắn kiểm tra!' : 'Test notification sent!');
        } catch (error) {
            console.error("Failed to test webhook:", error);
            alert(lang === 'vi' ? 'Kiểm tra thất bại! Vui lòng kiểm tra lại Link Webhook.' : 'Test failed! Please check your Webhook URL.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="admin-loading">Loading settings...</div>;
    }

    return (
        <div className="admin-settings-fullview">
            {/* Header Tổng quan */}
            <div className="admin-settings-header">
                <div className="header-info">
                    <h1>{t('admin_sys_settings')}</h1>
                    <p>{t('admin_settings_desc') || (lang === 'vi' ? 'Cấu hình toàn diện các tham số bảo mật và vận hành của CyberShield.' : 'Comprehensive configuration of CyberShield security and operation parameters.')}</p>
                </div>
                <div className="header-stats">
                    <div className="stat-badge info">
                        <i className='bx bx-check-shield'></i> <span>Firewall: Active</span>
                    </div>
                    <div className="stat-badge purple">
                        <i className='bx bx-brain'></i> <span>AI: Online</span>
                    </div>
                </div>
            </div>

            <div className="admin-settings-grid">
                {/* Section 1: General */}
                <div className="admin-settings-panel">
                    <div className="admin-panel-header">
                        <h2><i className='bx bx-laptop'></i> {t('admin_sys_overview') || (lang === 'vi' ? 'Hệ thống Chung' : 'General System')}</h2>
                    </div>
                    <div className="admin-settings-form">
                        <div className="admin-setting-item">
                            <div className="admin-setting-info">
                                <h4>{lang === 'vi' ? 'Chế độ Bảo trì' : 'Maintenance Mode'}</h4>
                                <p>{lang === 'vi' ? 'Khóa truy cập khi đang xử lý sự cố.' : 'Block access during incidents.'}</p>
                            </div>
                            <div className="admin-setting-action">
                                <label className="ui-switch">
                                    <input
                                        type="checkbox"
                                        checked={generalSettings['general.maintenance_mode'] === 'true'}
                                        onChange={(e) => handleGeneralChange('general.maintenance_mode', e.target.checked ? 'true' : 'false')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="admin-setting-item">
                            <div className="admin-setting-info">
                                <h4>Log Level</h4>
                                <p>{lang === 'vi' ? 'Mức độ ghi log hệ thống.' : 'System logging level.'}</p>
                            </div>
                            <div className="admin-setting-action">
                                <select
                                    className="admin-select-input-sm"
                                    value={generalSettings['general.log_level']}
                                    onChange={(e) => handleGeneralChange('general.log_level', e.target.value)}
                                >
                                    <option value="ALL">ALL</option>
                                    <option value="DANGER_ONLY">DANGER</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Defense */}
                <div className="admin-settings-panel">
                    <div className="admin-panel-header">
                        <h2><i className='bx bx-shield-alt-2'></i> {t('admin_sys_sec') || (lang === 'vi' ? 'Tường lửa' : 'Defense')}</h2>
                    </div>
                    <div className="admin-settings-form">
                        <div className="admin-setting-item">
                            <div className="admin-setting-info">
                                <h4>{lang === 'vi' ? 'Ngưỡng khóa' : 'Ban Threshold'}</h4>
                                <p>{lang === 'vi' ? 'Số lần sai tối đa.' : 'Max failed attempts.'}</p>
                            </div>
                            <div className="admin-setting-action">
                                <input
                                    type="number"
                                    className="admin-select-input-sm"
                                    value={defenseSettings['defense.auto_ban_threshold']}
                                    onChange={(e) => handleDefenseChange('defense.auto_ban_threshold', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="admin-setting-item">
                            <div className="admin-setting-info">
                                <h4>{lang === 'vi' ? 'Ân xá (phút)' : 'Unban Time'}</h4>
                                <p>{lang === 'vi' ? 'Thời gian khóa Redis.' : 'Redis block duration.'}</p>
                            </div>
                            <div className="admin-setting-action">
                                <input
                                    type="number"
                                    className="admin-select-input-sm"
                                    value={defenseSettings['defense.block_duration_minutes']}
                                    onChange={(e) => handleDefenseChange('defense.block_duration_minutes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: AI Advisor */}
                <div className="admin-settings-panel">
                    <div className="admin-panel-header">
                        <h2><i className='bx bx-brain'></i> {t('admin_ai_advisor') || 'AI Advisor'}</h2>
                    </div>
                    <div className="admin-settings-form">
                        <div className="admin-setting-item">
                            <div className="admin-setting-info">
                                <h4>{lang === 'vi' ? 'Độ nhạy AI' : 'Sensitivity'}</h4>
                                <p>{lang === 'vi' ? 'Mức độ cảnh báo.' : 'Alerting level.'}</p>
                            </div>
                            <div className="admin-setting-action">
                                <select
                                    className="admin-select-input-sm"
                                    value={aiSettings['ai.sensitivity']}
                                    onChange={(e) => handleAiChange('ai.sensitivity', e.target.value)}
                                >
                                    <option value="LOW">LOW</option>
                                    <option value="MEDIUM">MED</option>
                                    <option value="HIGH">HIGH</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-setting-item">
                            <div className="admin-setting-info">
                                <h4>Auto-Resolve</h4>
                                <p>{lang === 'vi' ? 'AI tự xử lý lỗi vặt.' : 'AI auto-close minor.'}</p>
                            </div>
                            <div className="admin-setting-action">
                                <label className="ui-switch">
                                    <input
                                        type="checkbox"
                                        checked={aiSettings['ai.auto_resolve'] === 'true'}
                                        onChange={(e) => handleAiChange('ai.auto_resolve', e.target.checked ? 'true' : 'false')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 4: Webhook */}
                <div className="admin-settings-panel">
                    <div className="admin-panel-header">
                        <h2><i className='bx bx-bell'></i> {lang === 'vi' ? 'Thông báo' : 'Alerts'}</h2>
                    </div>
                    <div className="admin-settings-form">
                        <div className="admin-setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', paddingBottom: '1rem' }}>
                            <div className="admin-setting-info" style={{ padding: 0 }}>
                                <h4>{lang === 'vi' ? 'Discord Webhook' : 'Webhook URL'}</h4>
                            </div>
                            <div className="admin-setting-action" style={{ width: '100%', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="admin-select-input-sm"
                                    style={{ width: '100%' }}
                                    placeholder="https://discord.com/..."
                                    value={alertSettings['alert.webhook_url']}
                                    onChange={(e) => handleAlertChange('alert.webhook_url', e.target.value)}
                                />
                                <button className="admin-test-btn" onClick={testWebhook}>
                                    <i className='bx bx-send'></i>
                                </button>
                            </div>
                        </div>
                        <div className="admin-setting-item" style={{ border: 'none', paddingTop: '10px' }}>
                            <div className="admin-setting-info" style={{ padding: 0 }}>
                                <h4>Admin Email</h4>
                            </div>
                            <input
                                type="text"
                                className="admin-select-input-sm"
                                style={{ width: '150px' }}
                                value={alertSettings['alert.admin_emails']}
                                onChange={(e) => handleAlertChange('alert.admin_emails', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Save Bar */}
            <div className={`admin-floating-save ${hasChanges ? 'visible' : ''}`}>
                <span>{lang === 'vi' ? '⚠️ Thay đổi chưa lưu' : '⚠️ Unsaved changes'}</span>
                <button className="admin-btn" onClick={saveAllSettings} disabled={saving}>
                    {saving ? '...' : (lang === 'vi' ? 'Lưu tất cả' : 'Save All')}
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
