export function routeForQuery(q: string): string {
  const lower = q.toLowerCase()
  const params = new URLSearchParams({ q })

  if (lower.match(/bill|spike|cost|spend|expensive|charge|waste/))           return `/analyze?mode=finops&${params}`
  if (lower.match(/architect|build|design|stack|infrastructure/))            return `/architecture?${params}`
  if (lower.match(/migrat|move|switch|aws to|azure to|gcp to/))              return `/migration?${params}`
  if (lower.match(/compliance|hipaa|pci|gdpr|soc2|soc 2/))                   return `/compliance?${params}`
  if (lower.match(/digitalocean|hetzner|cloudflare|alternative|cheaper|render|railway|linode|vultr/)) return `/alternatives?${params}`
  if (lower.match(/\bai\b|llm|openai|anthropic|gemini|gpt|claude|inference/)) return `/ai-cost-tracker?${params}`
  if (lower.match(/credit|aws activate|startup credit/))                     return `/credits-tracker?${params}`
  return `/analyze?${params}`
}
