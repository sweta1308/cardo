import sparkle from '../../assets/sparkle.svg'
import authIllustration from '../../assets/auth-illustration.webp'

const AuthIllustration = () => {
  return (
    <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-linear-to-br from-emerald-50 via-white to-emerald-50 p-10 md:flex">
      <img src={sparkle} alt="" className="absolute top-10 left-10 h-4 w-4 opacity-60" />
      <img src={sparkle} alt="" className="absolute bottom-14 left-14 h-3 w-3 opacity-50" />
      <img src={sparkle} alt="" className="absolute top-16 right-10 h-5 w-5 opacity-40" />

      <img src={authIllustration} alt="" className="relative w-full max-w-xs" />
    </div>
  )
}

export default AuthIllustration
