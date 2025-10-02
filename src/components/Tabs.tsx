import React from 'react'

interface Tab {
    id: string | number
    label: string
}

export default function Tabs({
    tabs, activeId, onChange
}: {
    tabs: Tab[]
    activeId: string | number
    onChange: (id: string | number) => void
}) {
    return (
        <div className="tabs">
            {tabs.map(t => (
                <button
                    key={t.id}
                    className={`tab ${t.id === activeId ? 'active' : ''}`}
                    onClick={() => onChange(t.id)}
                >
                    {t.label}
                </button>
            ))}
        </div>
    )
}
