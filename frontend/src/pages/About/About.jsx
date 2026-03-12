
import React from 'react';
import {
    Target,
    Lightbulb,
    Users,
    Zap,
    Shield,
    Globe,
    ArrowRight,
    Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './about.css';
import { useLanguage } from '../../context/LanguageContext';

export default function About() {
    const { t } = useLanguage();

    const teamMembers = [
        { name: "Alex Morgan", role: t('about_role_ceo'), image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400" },
        { name: "Sarah Chen", role: t('about_role_cto'), image: "https://images.unsplash.com/photo-1573496359-0935d50ea168?auto=format&fit=crop&q=80&w=400" },
        { name: "Michael Ross", role: t('about_role_architect'), image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
        { name: "Emily White", role: t('about_role_design'), image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400" }
    ];

    return (
        <div className="about-page">
            {/* Hero Section */}
            <div className="hero section-dark text-center relative overflow-hidden">
                <div className="hero-bg"></div>
                <div className="container relative z-10">
                    <div className="hero-badge mx-auto mb-6">
                        <span className="text-accent">★</span> {t('about_established')}
                    </div>
                    <h1 className="hero-title mb-6">
                        {t('about_we_are')} <span className="gradient-text">CyberShield</span>
                    </h1>
                    <p className="hero-subtitle text-secondary max-w-2xl mx-auto mb-10 text-lg">
                        {t('about_subtitle')}
                    </p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="section bg-white py-12 border-b border-border-light">
                <div className="container">
                    <div className="about-stats-grid">
                        <div className="stat-item text-center">
                            <h3 className="stat-number text-accent" style={{fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem'}}>5+</h3>
                            <p className="stat-label" style={{color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem'}}>{t('about_exp')}</p>
                        </div>
                        <div className="stat-item text-center">
                            <h3 className="stat-number text-accent-secondary" style={{fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem'}}>50+</h3>
                            <p className="stat-label" style={{color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem'}}>{t('about_projects')}</p>
                        </div>
                        <div className="stat-item text-center">
                            <h3 className="stat-number text-accent-pink" style={{fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem'}}>20+</h3>
                            <p className="stat-label" style={{color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem'}}>{t('about_experts')}</p>
                        </div>
                        <div className="stat-item text-center">
                            <h3 className="stat-number text-accent-coral" style={{fontSize: '4rem', fontWeight: 800, marginBottom: '0.5rem'}}>98%</h3>
                            <p className="stat-label" style={{color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem'}}>{t('about_satisfaction')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Our Story & Mission */}
            <div className="section container py-20">
                <div className="about-story-grid">
                    <div className="story-image-wrapper relative">
                        <div className="story-bg-decoration"></div>
                        <img
                            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                            alt="Team Collaboration"
                            className="story-img"
                        />
                        <div className="story-quote-card">
                            <p className="quote-text">"{t('about_quote')}"</p>
                            <p className="quote-author">- Aristotle</p>
                        </div>
                    </div>

                    <div className="story-content">
                        <div className="mb-8">
                            <h2 className="section-title">{t('about_pioneering')} <span className="text-accent">{t('about_digital_future')}</span></h2>
                            <p className="text-secondary mb-6 leading-relaxed">
                                {t('about_founded_text')}
                            </p>
                            <p className="text-secondary mb-6 leading-relaxed">
                                {t('about_code_text')}
                            </p>
                        </div>

                        <div className="mission-vision-wrapper">
                            <div className="mission-item">
                                <div className="icon-box bg-blue-50 text-accent">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h3 className="item-title">{t('about_mission_title')}</h3>
                                    <p className="text-secondary">{t('about_mission_desc')}</p>
                                </div>
                            </div>

                            <div className="vision-item">
                                <div className="icon-box bg-purple-50 text-accent-secondary">
                                    <Lightbulb size={24} />
                                </div>
                                <div>
                                    <h3 className="item-title">{t('about_vision_title')}</h3>
                                    <p className="text-secondary">{t('about_vision_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="section section-dark py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white"></div>
                <div className="container relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="section-title text-white">{t('about_values_title')}</h2>
                        <p className="text-gray-400">{t('about_values_subtitle')}</p>
                    </div>

                    <div className="about-values-grid">
                        <div className="value-card">
                            <div className="value-icon-box gradient-blue">
                                <Zap size={28} />
                            </div>
                            <h3 className="value-title">{t('about_val_innovation')}</h3>
                            <p className="value-desc">{t('about_val_innovation_desc')}</p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon-box gradient-purple">
                                <Shield size={28} />
                            </div>
                            <h3 className="value-title">{t('about_val_security')}</h3>
                            <p className="value-desc">{t('about_val_security_desc')}</p>
                        </div>

                        <div className="value-card">
                            <div className="value-icon-box gradient-pink">
                                <Users size={28} />
                            </div>
                            <h3 className="value-title">{t('about_val_client')}</h3>
                            <p className="value-desc">{t('about_val_client_desc')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Section */}
            <div className="section container py-20">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="section-title">{t('about_team_title')}</h2>
                    <p className="text-secondary">{t('about_team_subtitle')}</p>
                </div>

                <div className="about-team-grid">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="team-card group">
                            <div className="team-img-wrapper">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="team-img"
                                />
                                <div className="team-overlay">
                                    <div className="team-socials">
                                        <span className="team-social-link">LinkedIn</span>
                                        <span className="team-social-link">Twitter</span>
                                    </div>
                                </div>
                            </div>
                            <div className="team-info">
                                <h3 className="team-name">{member.name}</h3>
                                <p className="team-role">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Customers Section */}
            <div className="section bg-white py-20 border-t border-border-light">
                <div className="container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="section-title text-primary">{t('about_customers_title') || 'Khách hàng'}</h2>
                        <p className="text-secondary">{t('about_customers_subtitle') || 'Những đối tác tin cậy đã sử dụng hệ thống của chúng tôi'}</p>
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem'}}>
                        {[
                            { name: "TechCorp", logo: "bx bxl-meta" },
                            { name: "FinTech", logo: "bx bxl-stripe" },
                            { name: "EduSmart", logo: "bx bxl-bootstrap" },
                            { name: "HealthPlus", logo: "bx bxl-aws" },
                            { name: "LogiTrans", logo: "bx bxl-docker" },
                            { name: "RealEstate", logo: "bx bxl-airbnb" },
                            { name: "ShopNow", logo: "bx bxl-amazon" },
                            { name: "TravelWise", logo: "bx bxl-trip-advisor" }
                        ].map((c, idx) => (
                            <div key={idx} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.3s'}}>
                                <i className={c.logo} style={{fontSize: '3rem', marginBottom: '0.75rem'}}></i>
                                <span style={{fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)'}}>{c.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Partners Section */}
            <div className="section section-dark py-20 relative overflow-hidden">
                <div className="container relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="section-title text-white">{t('about_partners_title') || 'Đối tác'}</h2>
                        <p className="text-gray-400">{t('about_partners_subtitle') || 'Tích hợp với các công nghệ hàng đầu thế giới'}</p>
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem'}}>
                        {[
                            { name: "Google Cloud", logo: "bx bxl-google-cloud" },
                            { name: "Microsoft", logo: "bx bxl-microsoft" },
                            { name: "IBM", logo: "bx bxl-java" },
                            { name: "MongoDB", logo: "bx bxl-mongodb" },
                            { name: "Kubernetes", logo: "bx bxl-kubernetes" },
                            { name: "React", logo: "bx bxl-react" },
                            { name: "Redis", logo: "bx bxl-python" },
                            { name: "PostgreSQL", logo: "bx bxl-postgresql" }
                        ].map((p, idx) => (
                            <div key={idx} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', cursor: 'pointer', transition: 'all 0.3s'}}>
                                <i className={p.logo} style={{fontSize: '3rem', marginBottom: '0.75rem'}}></i>
                                <span style={{fontSize: '0.875rem', fontWeight: 600, color: 'white'}}>{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Certificates Section */}
            <div className="section bg-white py-20 border-t border-border-light">
                <div className="container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="section-title text-primary">{t('about_certificates_title') || 'Chứng chỉ bảo mật'}</h2>
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem'}}>
                        {[
                            { title: 'ISO 27001:2022', desc: 'Hệ thống Quản lý An toàn Thông tin chuẩn Quốc tế' },
                            { title: 'PCI DSS v4.0', desc: 'Bảo mật Thông tin Thẻ thanh toán mức cao nhất' },
                            { title: 'SOC 2 Type II', desc: 'An toàn, Bảo mật, Tính sẵn sàng và Bảo vệ dữ liệu' }
                        ].map((cert, index) => (
                            <div key={index} style={{background: 'white', padding: '2rem', border: '1px solid var(--border-light)', borderRadius: '1rem', textAlign: 'center', boxShadow: '0 4px 30px rgba(0,0,0,0.03)', transition: 'all 0.3s'}}>
                                <div style={{margin: '0 auto 1.5rem', width: '5rem', height: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: 'var(--accent)', borderRadius: '50%', border: '1px solid #dbeafe'}}>
                                    <Award size={36} />
                                </div>
                                <h3 style={{fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)'}}>{cert.title}</h3>
                                <p style={{color: 'var(--text-secondary)', fontSize: '0.875rem'}}>{cert.desc}</p>
                                <div style={{marginTop: '1.5rem', display: 'inline-block', padding: '0.375rem 1rem', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px'}}>
                                    Hoạt động
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="section container mb-20">
                <div
                    className="cta-box group"
                    onMouseMove={(e) => {
                        const box = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - box.left) / box.width;
                        const y = (e.clientY - box.top) / box.height;
                        e.currentTarget.style.setProperty('--mouse-x', `${x}`);
                        e.currentTarget.style.setProperty('--mouse-y', `${y}`);
                    }}
                >
                    <div className="cta-orb cta-orb-1"></div>
                    <div className="cta-orb cta-orb-2"></div>

                    <div className="cta-content relative z-10">
                        <h2 className="cta-title">{t('about_cta_ready')}</h2>
                        <p className="cta-text">
                            {t('about_cta_text')}
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Link to="/contact">
                                <button className="cta-btn">
                                    {t('about_cta_btn')} <ArrowRight size={20} />
                                </button>
                            </Link>
                            <Link to="/about/customer">
                                <button className="cta-btn cta-btn-outline">
                                    {t('cta_btn2')}
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
