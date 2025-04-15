"use client"

import type { Borrower, RiskAssessment } from "./types"

export async function assessRisk(borrower: Borrower): Promise<RiskAssessment> {
  try {
    // In a real application, this would call an AI model
    // For this demo, we'll use a rule-based approach
    return calculateRiskScore(borrower)
  } catch (error) {
    console.error("Error in risk assessment:", error)
    return calculateRiskScore(borrower)
  }
}

// Calculate risk score using rule-based approach
function calculateRiskScore(borrower: Borrower): RiskAssessment {
  // Credit score impact (0-100, where higher means higher risk)
  const creditScoreImpact = Math.max(0, Math.min(100, 100 - ((borrower.creditScore - 300) / 550) * 100))

  // Debt-to-income ratio impact
  const debtToIncomeImpact = Math.min(100, borrower.debtToIncomeRatio * 1.25)

  // Employment status impact
  let employmentStatusImpact = 50 // Default medium risk
  switch (borrower.employmentStatus) {
    case "full_time":
      employmentStatusImpact = 20
      break
    case "part_time":
      employmentStatusImpact = 40
      break
    case "self_employed":
      employmentStatusImpact = 35
      break
    case "retired":
      employmentStatusImpact = 45
      break
    case "student":
      employmentStatusImpact = 70
      break
    case "unemployed":
      employmentStatusImpact = 90
      break
  }

  // Loan amount impact (relative to income)
  const loanToIncomeRatio = borrower.loanAmount / borrower.income
  const loanAmountImpact = Math.min(100, loanToIncomeRatio * 100)

  // Income impact (inverse relationship - higher income = lower risk)
  const incomeImpact = Math.max(0, 100 - Math.min(100, (borrower.income / 150000) * 100))

  // Calculate overall risk score (weighted average)
  const riskScore = Math.round(
    creditScoreImpact * 0.35 +
      debtToIncomeImpact * 0.25 +
      employmentStatusImpact * 0.15 +
      loanAmountImpact * 0.15 +
      incomeImpact * 0.1,
  )

  // Generate explanation
  let explanation = `Risk assessment based on credit score (${borrower.creditScore}), debt-to-income ratio (${borrower.debtToIncomeRatio}%), and employment status (${borrower.employmentStatus}). `

  if (riskScore < 30) {
    explanation += "This borrower presents a low risk profile with strong financial indicators."
  } else if (riskScore < 60) {
    explanation += "This borrower presents a moderate risk profile with some concerning financial indicators."
  } else {
    explanation += "This borrower presents a high risk profile with multiple concerning financial indicators."
  }

  return {
    riskScore,
    riskFactors: {
      creditScoreImpact,
      debtToIncomeImpact,
      employmentStatusImpact,
      loanAmountImpact,
      incomeImpact,
    },
    explanation,
  }
}

