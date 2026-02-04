import type { ReactNode } from 'react'

interface AppShellProps {
  sidebar: ReactNode
  topbar: ReactNode
  rightRail: ReactNode
  children: ReactNode
}

export default function AppShell({ sidebar, topbar, rightRail, children }: AppShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">{sidebar}</aside>
      <main className="app-main">
        {topbar}
        <section className="app-view">{children}</section>
      </main>
      <aside className="app-rail">{rightRail}</aside>
    </div>
  )
}
