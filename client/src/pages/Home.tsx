import kanbanBoard from '../assets/kanban-board.svg'
import Seo from '../components/Seo'
import { ButtonLink } from '../components/ui/Button'

const Home = () => {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-emerald-50/60 via-white to-white">
      <Seo
        title="Project Management & Team Collaboration Software"
        description="Cardo is the project management tool that helps teams plan sprints, track tasks on Kanban boards, and ship projects together. Get started for free."
      />

      <section className="relative px-4 pt-16 pb-10 sm:px-6 lg:px-16">
        <div className="container grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white px-3 py-1 text-xs font-medium text-brand-dark">
              <span aria-hidden="true">✦</span> The smarter way to manage work
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-gray-900 sm:text-5xl">
              Organize work.
              <br />
              Ship projects.
              <br />
              <span className="text-brand">Together.</span>
            </h1>

            <p className="mt-5 max-w-md text-base text-gray-500">
              Cardo helps teams plan, track, and deliver projects in one beautiful place.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink to="/register">Get Started — It's Free</ButtonLink>
              <ButtonLink to="/login" variant="secondary">
                Log in
              </ButtonLink>
            </div>
          </div>

          <img
            src={kanbanBoard}
            alt="Kanban board with To do, In Progress, Review, and Done columns"
            className="w-full rounded-2xl border border-gray-100 shadow-xl"
          />
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-16">
        <div className="container grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: '▦', title: 'Boards that fit your flow', body: 'Group work into lists and move cards as they progress.' },
            { icon: '👥', title: 'Built for teams', body: 'Invite your workspace, share boards, and assign cards to people.' },
            { icon: '🗓', title: 'Never miss a deadline', body: 'Give cards due dates so the important work stays visible.' },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border border-gray-200 bg-white p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-lg" aria-hidden="true">
                {feature.icon}
              </span>
              <h2 className="mt-4 font-semibold text-gray-900">{feature.title}</h2>
              <p className="mt-1.5 text-sm text-gray-500">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home
