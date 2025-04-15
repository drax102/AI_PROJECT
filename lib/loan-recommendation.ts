"use client"

import type { Borrower, Lender, LoanRecommendation } from "./types"

export async function generateLoanRecommendations(
  borrowers: Borrower[],
  lenders: Lender[],
  marketRates: { [key: string]: number },
): Promise<LoanRecommendation[]> {
  const recommendations: LoanRecommendation[] = []

  // For each borrower, find potential lender matches
  for (const borrower of borrowers) {
    // Filter lenders based on basic criteria
    const potentialLenders = lenders.filter((lender) => {
      return (
        lender.minCreditScore <= borrower.creditScore &&
        lender.amountToLend >= borrower.loanAmount &&
        lender.preferredPurposes.includes(borrower.loanPurpose) &&
        (borrower.riskScore !== undefined ? borrower.riskScore <= lender.maxRiskTolerance : true)
      )
    })

    // For each potential lender, generate a loan recommendation
    for (const lender of potentialLenders) {
      try {
        // In a real application, this would call an AI model
        // For this demo, we'll use a rule-based approach

        // Find the best loan term
        const recommendedTerm = findBestLoanTerm(borrower, lender)

        // Calculate recommended interest rate
        const recommendedRate = calculateRecommendedRate(
          borrower,
          lender,
          marketRates[recommendedTerm] || lender.interestRate,
        )

        // Calculate loan payments
        const { monthlyPayment, totalInterest } = calculateLoanPayments(
          borrower.loanAmount,
          recommendedRate,
          Number.parseInt(recommendedTerm),
        )

        // Calculate confidence score
        const confidenceScore = calculateConfidenceScore(borrower, lender, recommendedRate)

        // Generate reasoning
        const reasoning = generateRecommendationReasoning(
          borrower,
          lender,
          recommendedRate,
          recommendedTerm,
          confidenceScore,
        )

        // Create a recommendation object
        recommendations.push({
          borrowerId: borrower.id!,
          lenderId: lender.id!,
          borrowerName: borrower.name,
          lenderName: lender.name,
          recommendedInterestRate: recommendedRate,
          recommendedTerm: recommendedTerm,
          estimatedMonthlyPayment: monthlyPayment,
          totalInterestPaid: totalInterest,
          confidenceScore: confidenceScore,
          reasoning: reasoning,
        })
      } catch (error) {
        console.error("Error generating loan recommendation:", error)
      }
    }
  }

  return recommendations
}

// Find the best loan term based on borrower and lender preferences
function findBestLoanTerm(borrower: Borrower, lender: Lender): string {
  // Check if the borrower's preferred term is available from the lender
  if (lender.loanTerms.includes(borrower.loanTerm.toString())) {
    return borrower.loanTerm.toString()
  }

  // Otherwise, find the closest available term
  const borrowerTerm = borrower.loanTerm
  let closestTerm = lender.loanTerms[0]
  let minDiff = Math.abs(Number.parseInt(closestTerm) - borrowerTerm)

  for (const term of lender.loanTerms) {
    const diff = Math.abs(Number.parseInt(term) - borrowerTerm)
    if (diff < minDiff) {
      minDiff = diff
      closestTerm = term
    }
  }

  return closestTerm
}

// Calculate a recommended interest rate based on borrower risk and market rates
function calculateRecommendedRate(borrower: Borrower, lender: Lender, marketRate: number): number {
  // Start with the lender's base rate
  let rate = lender.interestRate

  // Adjust based on borrower's risk score
  if (borrower.riskScore !== undefined) {
    if (borrower.riskScore < 30) {
      // Low risk - can offer better than base rate
      rate = Math.max(marketRate * 0.9, rate * 0.9)
    } else if (borrower.riskScore > 60) {
      // High risk - need higher rate
      rate = Math.max(marketRate * 1.2, rate * 1.1)
    } else {
      // Medium risk - offer around market rate
      rate = Math.max(marketRate * 1.05, rate)
    }
  }

  // Adjust based on credit score
  if (borrower.creditScore > 750) {
    rate -= 0.5
  } else if (borrower.creditScore < 650) {
    rate += 0.5
  }

  // Ensure rate is within reasonable bounds
  rate = Math.max(rate, marketRate * 0.8) // Don't go too far below market
  rate = Math.min(rate, lender.interestRate * 1.5) // Don't go too far above lender's base rate

  return Number.parseFloat(rate.toFixed(2))
}

// Calculate monthly payment and total interest for a loan
function calculateLoanPayments(
  principal: number,
  annualInterestRate: number,
  termMonths: number,
): { monthlyPayment: number; totalInterest: number } {
  const monthlyRate = annualInterestRate / 100 / 12
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)

  const totalPayment = monthlyPayment * termMonths
  const totalInterest = totalPayment - principal

  return {
    monthlyPayment: Number.parseFloat(monthlyPayment.toFixed(2)),
    totalInterest: Number.parseFloat(totalInterest.toFixed(2)),
  }
}

// Calculate confidence score for the recommendation
function calculateConfidenceScore(borrower: Borrower, lender: Lender, recommendedRate: number): number {
  let score = 70 // Base confidence score

  // Adjust based on how close the recommended rate is to the lender's base rate
  const rateDiff = Math.abs(recommendedRate - lender.interestRate)
  if (rateDiff < 1) score += 10
  else if (rateDiff > 3) score -= 10

  // Adjust based on borrower's risk score
  if (borrower.riskScore !== undefined) {
    if (borrower.riskScore < 30) score += 15
    else if (borrower.riskScore > 60) score -= 15
  }

  // Adjust based on credit score
  if (borrower.creditScore > 750) score += 10
  else if (borrower.creditScore < 600) score -= 10

  // Cap at 0-100
  return Math.max(0, Math.min(100, score))
}

// Generate reasoning for the recommendation
function generateRecommendationReasoning(
  borrower: Borrower,
  lender: Lender,
  recommendedRate: number,
  recommendedTerm: string,
  confidenceScore: number,
): string {
  let reasoning = ""

  if (confidenceScore >= 80) {
    reasoning = `Highly confident recommendation based on ${borrower.name}'s strong credit profile and low risk score. The recommended rate of ${recommendedRate}% over ${recommendedTerm} months provides a good balance between affordability and lender return.`
  } else if (confidenceScore >= 60) {
    reasoning = `Moderately confident recommendation. The ${recommendedTerm}-month term with ${recommendedRate}% interest rate accounts for ${borrower.name}'s risk profile while remaining competitive with market rates.`
  } else {
    reasoning = `This recommendation comes with lower confidence due to ${borrower.name}'s higher risk profile. The ${recommendedRate}% rate reflects this risk while still providing a viable loan option over ${recommendedTerm} months.`
  }

  return reasoning
}

