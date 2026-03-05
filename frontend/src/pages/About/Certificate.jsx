
import React from 'react'
import { Award } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function Certificate() {
    const { t } = useLanguage()

    return (
        <div className="section container">
            <h2 className="text-3xl font-bold text-center mb-12">{t('about_certificates_title')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((cert, index) => (
                    <div key={index} className="card bg-bg-card p-6 border border-border rounded-xl text-center hover:bg-bg-card-hover transition-all">
                        <div className="mx-auto w-24 h-32 flex items-center justify-center bg-accent-light bg-opacity-10 text-accent mb-4 border border-accent rounded-sm">
                            <Award size={48} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">ISO 9001:2015</h3>
                        <p className="text-secondary text-sm">{t('about_cert_qms')}</p>
                        <div className="mt-4 text-xs text-secondary opacity-70">
                            {t('about_cert_issued')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
