import React from 'react'

export default function SimpleBarChart({ data, title, color = '#6366f1' }) {
    const maxValue = Math.max(...data.map(d => d.value), 1)

    return (
        <div className="admin-chart-card">
            <h3>{title}</h3>
            <div className="chart-container">
                {data.map((item, index) => (
                    <div key={index} className="chart-bar-group">
                        <div className="chart-bar-wrapper">
                            <div
                                className="chart-bar"
                                style={{
                                    height: `${(item.value / maxValue) * 100}%`,
                                    backgroundColor: item.color || color
                                }}
                            >
                                <span className="chart-tooltip">{item.value}</span>
                            </div>
                        </div>
                        <span className="chart-label">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
