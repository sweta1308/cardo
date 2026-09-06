import type { ReactNode } from 'react'
import logo from '../../assets/logo.webp'
import logoWhite from '../../assets/logo-white.webp'
import UserBadge from '../UserBadge'

interface OnboardingShellProps {
  stepLabel: string
  children: ReactNode
}

const OnboardingShell = ({ stepLabel, children }: OnboardingShellProps) => {
  return (
    <div className="grid min-h-screen bg-gray-50 md:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col justify-between bg-brand-dark px-5 py-6 text-white md:sticky md:top-0 md:flex md:h-screen">
        <div>
          <img src={logoWhite} alt="cardo" className="h-12 w-auto" />

          <div className="mt-10">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <span aria-hidden="true">🪄</span> Getting started
            </p>
            <div className="mt-3 border-l-2 border-white/30 pl-3">
              <p className="text-sm text-white/90">{stepLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-4 sm:px-10">
          <img src={logo} alt="cardo" className="h-8 w-auto md:hidden" />

          <div className="ml-auto">
            <UserBadge />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">{children}</main>
      </div>
    </div>
  )
}

export default OnboardingShell
