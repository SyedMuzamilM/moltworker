import type { ReactNode } from 'react'

interface SidebarSectionProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export default function SidebarSection({ title, subtitle, children }: SidebarSectionProps) {
  return (
    <section className="sidebar-section">
      <header className="sidebar-section-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}
