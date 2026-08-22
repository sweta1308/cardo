import sparkle from '../assets/sparkle.svg'
import kanbanBoard from '../assets/kanban-board.svg'
import Seo from '../components/Seo'

const Home = () => {
  return (
    <div className="relative overflow-hidden bg-linear-to-b from-emerald-50 via-white to-white">
      <Seo
        title="Project Management & Team Collaboration Software"
        description="Cardo is the project management tool that helps teams plan sprints, track tasks on Kanban boards, and ship projects together. Get started for free."
      />
      <img src={sparkle} alt="Sparkle 1" className="absolute top-24 right-10 hidden h-6 w-6 opacity-60 sm:right-20 sm:block lg:right-40" />
      <img src={sparkle} alt="Sparkle 2" className="absolute top-44 right-4 hidden h-4 w-4 opacity-50 sm:right-8 sm:block lg:right-16" />
      <img src={sparkle} alt="Sparkle 3" className="absolute top-72 right-14 hidden h-3 w-3 opacity-70 sm:right-28 sm:block lg:right-56" />
      <img src={sparkle} alt="Sparkle 4" className="absolute top-96 right-6 hidden h-5 w-5 opacity-40 sm:right-12 sm:block lg:right-24" />

      <section className="relative px-4 pt-12 pb-4 text-center sm:px-6 sm:pt-16 sm:pb-20">
        <h1 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl md:text-5xl">
          Organize work.
          <br />
          Ship projects. <span className="text-brand">Together.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-sm text-gray-500 sm:text-base">
          Cardo helps teams plan, track, and collaborate so you can get more done.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href="/login"
            className="rounded-full bg-brand-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand"
          >
            Get Started for Free
          </a>
        </div>
      </section>

      <section className="relative px-4 pb-16 sm:px-6 sm:pb-20">
        <img
          src={kanbanBoard}
          alt="Kanban board with To do, In Progress, Review, and Done columns"
          className="mx-auto w-full max-w-5xl rounded-2xl shadow-xl"
        />
      </section>
    </div>
  )
}

export default Home
