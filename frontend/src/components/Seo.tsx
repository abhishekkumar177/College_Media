import { Helmet } from 'react-helmet-async'

/**
 * SEO Component
 * 
 * Manages meta tags for search engine optimization
 * Dynamically updates page title, description, and keywords
 * 
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description for search results
 * @param {string} props.keywords - Comma-separated keywords
 * @param {string} props.image - Open Graph image URL
 * @returns {React.ReactElement} Helmet component with meta tags
 */
const SEO = ({ 
  title = 'UniHub - Your Centralized College Platform',
  description = 'UniHub is a centralized platform for everything college - connect, share, learn, and grow beyond just social media.',
  keywords = 'college platform, student community, campus hub, university network, student social media',
  image = '/og-image.png'
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  )
}

export default SEO