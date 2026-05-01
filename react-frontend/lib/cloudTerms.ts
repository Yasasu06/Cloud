export type TermCategory = 'AWS' | 'Azure' | 'GCP' | 'Security' | 'Cost' | 'Architecture'

export interface CloudTerm {
  term: string
  definition: string
  category: TermCategory
  example: string
  related: string[]
}

export const CLOUD_TERMS: CloudTerm[] = [
  {
    term: 'Availability Zone',
    category: 'Architecture',
    definition: 'An isolated data center within a cloud region. Spreading your app across multiple zones means one data center going down won\'t take your whole service offline.',
    example: 'A SaaS startup deploys their database across 3 Availability Zones in us-east-1 so they stay online even if one zone has a power failure.',
    related: ['Multi-cloud', 'SLA', 'Auto Scaling'],
  },
  {
    term: 'CDN',
    category: 'Architecture',
    definition: 'Content Delivery Network — a global network of servers that caches your static files (images, CSS, JS) close to your users, so pages load faster no matter where they are.',
    example: 'An e-commerce site uses a CDN so shoppers in Tokyo get images served from a Tokyo server, not one in Virginia.',
    related: ['CloudFront', 'Egress', 'Load Balancer'],
  },
  {
    term: 'Load Balancer',
    category: 'Architecture',
    definition: 'A traffic cop that sits in front of your servers and spreads incoming requests evenly across them. Prevents any single server from being overwhelmed.',
    example: 'A gaming company handles a tournament traffic spike by routing 10,000 simultaneous players across 20 backend servers via a load balancer.',
    related: ['Auto Scaling', 'Availability Zone', 'VPC'],
  },
  {
    term: 'Kubernetes',
    category: 'Architecture',
    definition: 'An open-source system for managing containerised apps at scale. It automatically restarts crashed containers, balances load, and rolls out updates without downtime.',
    example: 'A fintech runs 50 microservices on Kubernetes so their payments service can be updated independently without touching the rest of the app.',
    related: ['Docker', 'Auto Scaling', 'Multi-cloud'],
  },
  {
    term: 'Docker',
    category: 'Architecture',
    definition: 'A tool that packages your app and all its dependencies into a portable container. "Works on my machine" stops being an excuse.',
    example: 'A developer ships a Python ML model in a Docker container so it runs identically on their laptop, in CI, and in production on GCP.',
    related: ['Kubernetes', 'Serverless', 'Multi-cloud'],
  },
  {
    term: 'Serverless',
    category: 'Architecture',
    definition: 'A model where you run code without managing any servers. You write a function, upload it, and the cloud runs it on demand and charges you only for actual execution time.',
    example: 'A startup processes uploaded user photos with a serverless function — they pay fractions of a cent per image and never think about server capacity.',
    related: ['Lambda', 'Auto Scaling', 'TCO'],
  },
  {
    term: 'Lambda',
    category: 'AWS',
    definition: 'AWS\'s serverless compute service. You upload a function in Python, Node, Go, or Java and AWS runs it in response to events like HTTP requests, file uploads, or database changes.',
    example: 'An e-commerce company uses Lambda to resize product images the moment a seller uploads them to S3, with zero always-on servers.',
    related: ['Serverless', 'Auto Scaling', 'CloudFront'],
  },
  {
    term: 'Reserved Instance',
    category: 'Cost',
    definition: 'A billing commitment where you promise to use a specific instance type for 1 or 3 years in exchange for up to 72% off the on-demand price.',
    example: 'A SaaS company commits to 10 m5.large Reserved Instances for 1 year on AWS and cuts their compute bill from $4,800 to $1,800/month.',
    related: ['Spot Instance', 'FinOps', 'TCO'],
  },
  {
    term: 'Spot Instance',
    category: 'Cost',
    definition: 'Spare cloud capacity sold at a heavy discount (up to 90% off). The catch: the provider can reclaim it with 2 minutes notice when they need the capacity back.',
    example: 'A biotech firm runs overnight genomics batch jobs on Spot Instances and pays $200 instead of $2,000 — the job can restart if interrupted.',
    related: ['Reserved Instance', 'Auto Scaling', 'FinOps'],
  },
  {
    term: 'Auto Scaling',
    category: 'Architecture',
    definition: 'Automatically adds or removes compute capacity based on real-time demand. Your app gets more servers during a traffic spike and scales back down when it\'s quiet.',
    example: 'A news site adds 50 extra servers within minutes when a story goes viral, then scales back to 5 servers an hour later — paying only for what was used.',
    related: ['Load Balancer', 'Spot Instance', 'Serverless'],
  },
  {
    term: 'CloudFront',
    category: 'AWS',
    definition: 'AWS\'s CDN service. It caches your content at 600+ edge locations worldwide and can also sit in front of your API to absorb DDoS traffic.',
    example: 'A media company delivers video thumbnails via CloudFront so users in Brazil get sub-100ms load times from a São Paulo edge node.',
    related: ['CDN', 'Lambda', 'Egress'],
  },
  {
    term: 'VPC',
    category: 'Architecture',
    definition: 'Virtual Private Cloud — your own isolated, private network inside the cloud. You control which resources talk to the internet and which stay completely private.',
    example: 'A healthcare company puts their patient database in a private VPC subnet with no internet access — it\'s only reachable from their application servers.',
    related: ['NAT Gateway', 'Ingress', 'Security Group'],
  },
  {
    term: 'NAT Gateway',
    category: 'Architecture',
    definition: 'Lets servers in a private subnet make outbound internet requests (e.g., to fetch updates) without being reachable from the internet themselves.',
    example: 'A private database server uses a NAT Gateway to download OS security patches without exposing a public IP address that attackers could target.',
    related: ['VPC', 'Egress', 'Ingress'],
  },
  {
    term: 'Egress',
    category: 'Cost',
    definition: 'Data leaving the cloud going out to the internet or to another region. Almost all cloud providers charge for egress — it\'s one of the most overlooked costs.',
    example: 'A video platform discovers they\'re paying $8,000/month in AWS egress fees serving videos directly from S3 — switching to CloudFront cuts it to $900.',
    related: ['Ingress', 'CDN', 'TCO'],
  },
  {
    term: 'Ingress',
    category: 'Architecture',
    definition: 'Data coming in to your cloud environment from the internet or from users. Ingress is almost always free — cloud providers charge on the way out, not the way in.',
    example: 'A backup service charges users for storage but pays nothing in cloud ingress fees when customers upload their files.',
    related: ['Egress', 'Load Balancer', 'VPC'],
  },
  {
    term: 'FinOps',
    category: 'Cost',
    definition: 'Financial Operations for the cloud — the practice of treating cloud spend as a business metric, not just an IT bill. Teams take joint ownership of usage and costs.',
    example: 'A scale-up creates a FinOps team that adds cost tags to every resource, sets budget alerts, and moves 40% of workloads to Reserved Instances, saving $180k/year.',
    related: ['TCO', 'Reserved Instance', 'Spot Instance'],
  },
  {
    term: 'TCO',
    category: 'Cost',
    definition: 'Total Cost of Ownership — the full price of running something, including hidden costs like staff time, licensing, hardware refresh, and cooling, not just the monthly bill.',
    example: 'A company considers migrating from AWS to their own servers. The hardware looks cheaper until TCO includes the 2 engineers needed to manage it, totaling $800k/year.',
    related: ['FinOps', 'On-premise', 'Reserved Instance'],
  },
  {
    term: 'SLA',
    category: 'Architecture',
    definition: 'Service Level Agreement — a contractual uptime guarantee. AWS S3 promises 99.99% uptime, meaning at most 52 minutes of downtime per year.',
    example: 'A fintech chooses a managed database with a 99.99% SLA over a self-managed one, because 4 hours of downtime per year would violate their own customer contracts.',
    related: ['Availability Zone', 'Multi-cloud', 'Auto Scaling'],
  },
  {
    term: 'Multi-cloud',
    category: 'Architecture',
    definition: 'Using two or more cloud providers at the same time — e.g., AWS for compute, GCP for AI/ML, Azure for Microsoft integrations. Reduces lock-in but increases complexity.',
    example: 'A large bank runs its core banking on Azure (for compliance tooling) and its ML fraud detection on GCP Vertex AI, using each provider for what it does best.',
    related: ['On-premise', 'Kubernetes', 'TCO'],
  },
  {
    term: 'On-premise',
    category: 'Architecture',
    definition: 'Infrastructure you own and run yourself, in your own data center or server room. You buy the hardware, pay for power and cooling, and manage everything.',
    example: 'A hospital runs patient record servers on-premise to meet strict data sovereignty requirements, then uses AWS for its non-PHI analytics workloads.',
    related: ['Multi-cloud', 'TCO', 'FinOps'],
  },
]
