const SITE_NAME = 'Cardo'

type SeoProps = {
  title: string
  description?: string
}

const Seo = ({ title, description }: SeoProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`

  return (
    <>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
    </>
  )
}

export default Seo