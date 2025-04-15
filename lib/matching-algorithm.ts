"use client"

import type { Borrower, Lender, Match } from "./types"

export async function matchBorrowersWithLenders(borrowers: Borrower[], lenders: Lender[]): Promise<Match[]> {
  const matches: Match[] = []

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

    // For each potential lender, generate a match
    for (const lender of potentialLenders) {
      try {
        // In a real application, this would call an AI model
        // For this demo, we'll use a rule-based approach
        const matchScore = calculateMatchScore(borrower, lender)
        const aiReasoning = generateMatchReasoning(borrower, lender, matchScore)

        // Create a match object
        matches.push({
          borrowerId: borrower.id!,
          lenderId: lender.id!,
          borrowerName: borrower.name,
          lenderName: lender.name,
          borrowerCreditScore: borrower.creditScore,
          borrowerRiskScore: borrower.riskScore || 50,
          lenderMinCreditScore: lender.minCreditScore,
          lenderMaxRiskTolerance: lender.maxRiskTolerance,
          loanAmount: borrower.loanAmount,
          lendingAmount: lender.amountToLend,
          loanPurpose: borrower.loanPurpose,
          interestRate: lender.interestRate,
          matchScore: matchScore,
          aiReasoning: aiReasoning,
        })
      } catch (error) {
        console.error("Error generating match:", error)
      }
    }
  }

  // Sort matches by match score (highest first)
  return matches.sort((a, b) => b.matchScore - a.matchScore)
}

// Calculate match score using rule-based approach
function calculateMatchScore(borrower: Borrower, lender: Lender): number {
  let score = 60 // Base score for meeting minimum requirements

  // Adjust based on credit score margin
  const creditScoreMargin = borrower.creditScore - lender.minCreditScore
  if (creditScoreMargin >= 100) score += 15
  else if (creditScoreMargin >= 50) score += 10
  else if (creditScoreMargin >= 20) score += 5

  // Adjust based on loan amount vs lending amount
  const loanRatio = borrower.loanAmount / lender.amountToLend
  if (loanRatio <= 0.3) score += 15
  else if (loanRatio <= 0.5) score += 10
  else if (loanRatio <= 0.7) score += 5

  // Adjust based on risk score vs risk tolerance
  if (borrower.riskScore !== undefined) {
    const riskMargin = lender.maxRiskTolerance - borrower.riskScore
    if (riskMargin >= 30) score += 15
    else if (riskMargin >= 15) score += 10
    else if (riskMargin >= 5) score += 5
  }

  // Cap at 100
  return Math.min(score, 100)
}

// Generate match reasoning
function generateMatchReasoning(borrower: Borrower, lender: Lender, matchScore: number): string {
  let reasoning = ""

  if (matchScore >= 80) {
    reasoning = `Excellent match! ${borrower.name}'s credit score of ${borrower.creditScore} significantly exceeds ${lender.name}'s minimum requirement of ${lender.minCreditScore}. The loan amount of $${borrower.loanAmount.toLocaleString()} is well within ${lender.name}'s lending capacity of $${lender.amountToLend.toLocaleString()}.`
  } else if (matchScore >= 60) {
    reasoning = `Good match. ${borrower.name}'s credit score of ${borrower.creditScore} meets ${lender.name}'s requirements. The loan purpose (${borrower.loanPurpose}) aligns with the lender's preferences, though the risk profile could be better.`
  } else {
    reasoning = `Acceptable match. ${borrower.name} meets ${lender.name}'s minimum requirements, but there are some concerns regarding the risk profile and loan-to-lending ratio. This match may require additional scrutiny.`
  }

  return reasoning
}

