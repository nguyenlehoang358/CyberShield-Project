
import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function Partner() {
    const { t } = useLanguage()

    const partners = [
        { name: "Google Cloud", logo: "bx bxl-google-cloud" },
        { name: "Microsoft", logo: "bx bxl-microsoft" },
        { name: "IBM", logo: "bx bxl-java" },
        { name: "MongoDB", logo: "bx bxl-mongodb" },
        { name: "Kubernetes", logo: "bx bxl-kubernetes" },
        { name: "React", logo: "bx bxl-react" },
        { name: "Redis", logo: "bx bxl-python" },
        { name: "PostgreSQL", logo: "bx bxl-postgresql" }
    ]
    return (
        <div className="section container">
            <h2 className="text-3xl font-bold text-center mb-6">{t('about_partners_title')}</h2>
            <p className="text-center text-secondary mb-12">{t('about_partners_subtitle')}</p>

            <div className="logo-grid">
                {partners.map((p, index) => (
                    <div key={index} className="logo-item flex-col text-secondary hover:text-accent transition-all">
                        <i className={`${p.logo} bx-lg mb-2`}></i>
                        <span className="text-sm font-semibold">{p.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
