export interface AWSCostData {
  totalThisMonth: number
  projectedThisMonth: number
  topServices: { service: string; cost: number }[]
  wasteEstimate: number
  lastUpdated: string
}

export function getMockAWSData(monthlySpend: number): AWSCostData {
  return {
    totalThisMonth: monthlySpend * 0.73,
    projectedThisMonth: monthlySpend,
    topServices: [
      { service: 'Amazon EC2',    cost: monthlySpend * 0.38 },
      { service: 'Amazon RDS',    cost: monthlySpend * 0.22 },
      { service: 'Amazon S3',     cost: monthlySpend * 0.12 },
      { service: 'Data Transfer', cost: monthlySpend * 0.11 },
      { service: 'Other',         cost: monthlySpend * 0.17 },
    ],
    wasteEstimate: monthlySpend * 0.28,
    lastUpdated: new Date().toISOString(),
  }
}
