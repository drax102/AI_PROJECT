export interface Borrower {
  id?: string
  name: string
  email: string
  loanAmount: number
  loanPurpose: string
  creditScore: number
  income: number
  employmentStatus: string
  debtToIncomeRatio: number
  loanTerm: number
  housingStatus: string
  riskScore?: number
}

export interface Lender {
  id?: string
  name: string
  email: string
  amountToLend: number
  minCreditScore: number
  interestRate: number
  maxRiskTolerance: number
  preferredPurposes: string[]
  loanTerms: string[]
}

export interface Match {
  borrowerId: string
  lenderId: string
  borrowerName: string
  lenderName: string
  borrowerCreditScore: number
  borrowerRiskScore: number
  lenderMinCreditScore: number
  lenderMaxRiskTolerance: number
  loanAmount: number
  lendingAmount: number
  loanPurpose: string
  interestRate: number
  matchScore: number
  aiReasoning: string
}

export interface LoanRecommendation {
  borrowerId: string
  lenderId: string
  borrowerName: string
  lenderName: string
  recommendedInterestRate: number
  recommendedTerm: string
  estimatedMonthlyPayment: number
  totalInterestPaid: number
  confidenceScore: number
  reasoning: string
}

export interface RiskAssessment {
  riskScore: number
  riskFactors: {
    creditScoreImpact: number
    debtToIncomeImpact: number
    employmentStatusImpact: number
    loanAmountImpact: number
    incomeImpact: number
  }
  explanation: string
}

