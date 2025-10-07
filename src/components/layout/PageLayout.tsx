import React from "react";

type Props = {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    children: React.ReactNode;
};

export default function PageLayout({ title, subtitle, icon, actions, children }: Props) {
    return (
        <div className="page">
            <header className="page-header">
                <div className="page-header__left">
                    {icon && <div className="page-icon">{icon}</div>}
                    <div>
                        <h1 className="page-title">{title}</h1>
                        {subtitle && <p className="page-subtitle">{subtitle}</p>}
                    </div>
                </div>
                {actions && <div className="page-header__actions">{actions}</div>}
            </header>

            <div className="page-grid">
                {children}
            </div>
        </div>
    );
}
