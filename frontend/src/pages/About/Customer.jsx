
import React from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function Customer() {
    const { t } = useLanguage()

    const customers = [
        { name: "TechCorp", logo: "bx bxl-meta" },
        { name: "FinTech", logo: "bx bxl-stripe" },
        { name: "EduSmart", logo: "bx bxl-bootstrap" },
        { name: "HealthPlus", logo: "bx bxl-aws" },
        { name: "LogiTrans", logo: "bx bxl-docker" },
        { name: "RealEstate", logo: "bx bxl-airbnb" },
        { name: "ShopNow", logo: "bx bxl-amazon" },
        { name: "TravelWise", logo: "bx bxl-trip-advisor" }
    ]
    return (
        <div className="section container">
            <h2 className="text-3xl font-bold text-center mb-6">{t('about_customers_title')}</h2>
            <p className="text-center text-secondary mb-12">{t('about_customers_subtitle')}</p>

            <div className="logo-grid">
                {customers.map((c, index) => (
                    <div key={index} className="logo-item flex-col text-secondary hover:text-primary transition-all">
                        <i className={`${c.logo} bx-lg mb-2`}></i>
                        <span className="text-sm font-semibold">{c.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
