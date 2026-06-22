/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async redirects() {
    return [
      // Focused entry point — the homepage now routes to the /demo tools hub.
      // permanent:false (307) so it isn't hard-cached by browsers if the focus changes.
      { source: '/', destination: '/demo', permanent: false },

      // Cost Intelligence hub (4)
      { source: '/forecast',           destination: '/cost-intelligence?tab=forecast', permanent: true },
      { source: '/cost-per-user',      destination: '/cost-intelligence?tab=per-user', permanent: true },
      { source: '/credits-tracker',    destination: '/cost-intelligence?tab=credits',  permanent: true },
      { source: '/ai-cost-tracker',    destination: '/cost-intelligence?tab=ai-costs', permanent: true },

      // Optimize hub (3)
      { source: '/savings',            destination: '/optimize?tab=savings',           permanent: true },
      { source: '/waste-report',       destination: '/optimize?tab=waste',             permanent: true },
      { source: '/reserved-instances', destination: '/optimize?tab=reserved',          permanent: true },

      // Migrate hub (3)
      { source: '/migration',          destination: '/migrate?tab=migration',          permanent: true },
      { source: '/migration-cost',     destination: '/migrate?tab=egress',             permanent: true },
      { source: '/repatriation',       destination: '/migrate?tab=repatriation',       permanent: true },

      // Intelligence hub (3)
      { source: '/provider-news',      destination: '/intelligence?tab=news',          permanent: true },
      { source: '/vendor-alerts',      destination: '/intelligence?tab=alerts',        permanent: true },
      { source: '/weekly-digest',      destination: '/intelligence?tab=digest',        permanent: true },

      // Learn hub (3)
      { source: '/cloud-glossary',     destination: '/learn?tab=glossary',             permanent: true },
      { source: '/benchmark',          destination: '/learn?tab=benchmarks',           permanent: true },
      { source: '/cloud-twin',         destination: '/learn?tab=cloud-twin',           permanent: true },

      // Consultants hub (4)
      { source: '/white-label',        destination: '/for-consultants?tab=white-label',permanent: true },
      { source: '/experts',            destination: '/for-consultants?tab=experts',    permanent: true },
      { source: '/performance-pricing',destination: '/for-consultants?tab=pricing',    permanent: true },
      { source: '/replaces',           destination: '/for-consultants?tab=roles',      permanent: true },
    ]
  },
}

module.exports = nextConfig
