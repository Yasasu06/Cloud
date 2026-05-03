export function routeForQuery(q: string): string {
  const lower = q.toLowerCase()
  const params = new URLSearchParams({ q })

  // Startup-specific patterns route to /analyze
  if (lower.match(/start.?up|new.+(idea|app|product|company)|just starting|beginning|first time|new to cloud/)) {
    return `/analyze?mode=finops&${params}`
  }

  // Bill/cost issues
  if (lower.match(/bill|spike|cost|spend|expensive|charge|waste|reduce/)) {
    return `/analyze?mode=finops&${params}`
  }

  // Architecture only when explicitly asking
  if (lower.match(/architect|design.+(system|infrastructure)|stack design|technical design/)) {
    return `/architecture?${params}`
  }

  // Migration
  if (lower.match(/migrat|move|switch|aws to|azure to|gcp to/)) {
    return `/migrate?tab=migration&${params}`
  }

  // Compliance
  if (lower.match(/compliance|hipaa|pci|gdpr|soc2|soc 2/)) {
    return `/compliance?${params}`
  }

  // Alternatives
  if (lower.match(/digitalocean|hetzner|cloudflare|alternative|cheaper|smaller provider|render|railway|linode|vultr/)) {
    return `/alternatives?${params}`
  }

  // AI costs
  if (lower.match(/ai cost|llm|openai|anthropic|gemini|gpt|claude|inference/)) {
    return `/cost-intelligence?tab=ai-costs&${params}`
  }

  // Credits
  if (lower.match(/credit|aws activate|startup credit/)) {
    return `/cost-intelligence?tab=credits&${params}`
  }

  // DEFAULT: /analyze (not architecture)
  return `/analyze?${params}`
}
