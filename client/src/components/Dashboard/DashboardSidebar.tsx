import { Link, useLocation } from 'react-router-dom'
import logoWhite from '../../assets/logo-white.webp'
import WorkspaceSwitcher from './WorkspaceSwitcher'
import { useBoardsStore } from '../../store/boardsStore'
import { useWorkspaceStore } from '../../store/workspaceStore'

const navItemClass = 'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors'

interface NavLinkProps {
  to: string
  icon: string
  label: string
  active: boolean
}

const NavLink = ({ to, icon, label, active }: NavLinkProps) => (
  <Link
    to={to}
    className={`${navItemClass} ${active ? 'bg-white/15 font-semibold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
  >
    <span aria-hidden="true">{icon}</span>
    {label}
  </Link>
)

const DashboardSidebar = () => {
  const { pathname } = useLocation()
  const workspace = useWorkspaceStore((state) => state.workspace)
  const boards = useBoardsStore((state) => state.boards)

  return (
    <aside className="hidden flex-col gap-5 overflow-y-auto bg-brand-dark px-4 py-6 md:sticky md:top-0 md:flex md:h-screen">
      <Link to="/boards" className="px-3">
        <img src={logoWhite} alt="cardo" className="h-12 w-auto" />
      </Link>

      <WorkspaceSwitcher />

      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" icon="⌂" label="Home" active={pathname === '/dashboard'} />
        <NavLink to="/boards" icon="▦" label="Boards" active={pathname.startsWith('/boards')} />
        <NavLink to="/settings" icon="⚙" label="Settings" active={pathname === '/settings'} />
      </nav>

      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-white/40">Your boards</p>

        <div className="mt-2 flex flex-col gap-1">
          {boards.map((board) => (
            <Link
              key={board.id}
              to={`/boards/${board.id}`}
              className={`${navItemClass} ${
                pathname === `/boards/${board.id}`
                  ? 'bg-white/15 font-semibold text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="h-4 w-4 shrink-0 rounded" style={{ backgroundColor: board.background }} />
              <span className="truncate">{board.name}</span>
            </Link>
          ))}

          {workspace && (
            <Link
              to={`/boards/new?workspaceId=${workspace.id}`}
              className={`${navItemClass} text-white/70 hover:bg-white/10 hover:text-white`}
            >
              <span aria-hidden="true">+</span>
              Create board
            </Link>
          )}
        </div>
      </div>
    </aside>
  )
}

export default DashboardSidebar
