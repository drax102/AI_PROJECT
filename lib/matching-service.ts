"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { Borrower, Lender, Match } from "./types"

export async function generateMatches(borrowers: Borrower[], lenders: Lender[]): Promise<Match[]> {
  const matches: Match[] = []

  // For each borrower, find potential lender matches
  for (const borrower of borrowers) {
    // Filter lenders based on basic criteria
    const potentialLenders = lenders.filter((lender) => {
      return (
        lender.minCreditScore <= borrower.creditScore &&
        lender.amountToLend >= borrower.loanAmount &&
        lender.preferredPurposes.includes(borrower.loanPurpose)
      )
    })

    // For each potential lender, generate a match with AI analysis
    for (const lender of potentialLenders) {
      try {
        const { text } = await generateText({
          model: openai("gpt-4o"),
          prompt: `
            Analyze the compatibility between this borrower and lender for a peer-to-peer loan:
            
            Borrower:
            - Name: ${borrower.name}
            - Loan Amount: $${borrower.loanAmount}
            - Loan Purpose: ${borrower.loanPurpose}
            - Credit Score: ${borrower.creditScore}
            - Annual Income: $${borrower.income}
            
            Lender:
            - Name: ${lender.name}
            - Amount to Lend: $${lender.amountToLend}
            - Minimum Credit Score: ${lender.minCreditScore}
            - Interest Rate: ${lender.interestRate}%
            - Preferred Loan Purposes: ${lender.preferredPurposes.join(", ")}
            
            Provide a JSON response with the following structure:
            {
              "compatibilityScore": [number between 0-100],
              "reasoning": [brief explanation of the match quality, 1  [number between 0-100],
              "reasoning": [brief explanation of the match quality, 1-2 sentences]
            }
            
            Only return the JSON object, no other text.
          `,
        })

        // Parse the AI response
        const aiResponse = JSON.parse(text)

        // Create a match object
        matches.push({
          borrowerId: borrower.id!,
          lenderId: lender.id!,
          borrowerName: borrower.name,
          lenderName: lender.name,
          loanAmount: borrower.loanAmount,
          lendingAmount: lender.amountToLend,
          loanPurpose: borrower.loanPurpose,
          interestRate: lender.interestRate,
          compatibilityScore: aiResponse.compatibilityScore,
          aiReasoning: aiResponse.reasoning,
        })
      } catch (error) {
        console.error("Error generating match analysis:", error)
        // Create a basic match without AI analysis if there's an error
        matches.push({
          borrowerId: borrower.id!,
          lenderId: lender.id!,
          borrowerName: borrower.name,
          lenderName: lender.name,
          loanAmount: borrower.loanAmount,
          lendingAmount: lender.amountToLend,
          loanPurpose: borrower.loanPurpose,
          interestRate: lender.interestRate,
          compatibilityScore: calculateBasicCompatibilityScore(borrower, lender),
          aiReasoning: "Basic compatibility based on credit score and loan purpose match.",
        })
      }
    }
  }

  // Sort matches by compatibility score (highest first)
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore)
}

// Fallback function to calculate a basic compatibility score without AI
function calculateBasicCompatibilityScore(borrower: Borrower, lender: Lender): number {
  let score = 60 // Base score for meeting minimum requirements

  // Adjust based on credit score margin
  const creditScoreMargin = borrower.creditScore - lender.minCreditScore
  if (creditScoreMargin >= 100) score += 15
  else if (creditScoreMargin >= 50) score += 10
  else if (creditScoreMargin >= 20) score += 5

  // Adjust based on loan amount vs lending amount
  const loanRatio = borrower.loanAmount / lender.amountToLend
  if (loanRatio <= 0.5) score += 15
  else if (loanRatio <= 0.7) score += 10
  else if (loanRatio <= 0.9) score += 5

  // Cap at 100
  return Math.min(score, 100)
}

