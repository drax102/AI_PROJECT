"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Borrower, LoanRecommendation } from "@/lib/types"

interface RiskAssessmentDashboardProps {
  borrowers: Borrower[]
  recommendations: LoanRecommendation[]
  marketRates: { [key: string]: number }
}

export default function RiskAssessmentDashboard({
  borrowers,
  recommendations,
  marketRates,
}: RiskAssessmentDashboardProps) {
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string | null>(
    borrowers.length > 0 ? borrowers[0].id : null,
  )

  if (borrowers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Borrowers Available</CardTitle>
          <CardDescription>You need to add borrowers to see risk assessments.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please add borrowers to analyze risk profiles.</p>
        </CardContent>
      </Card>
    )
  }

  // Get selected borrower
  const selectedBorrower = borrowers.find((b) => b.id === selectedBorrowerId)

  // Get recommendations for selected borrower
  const selectedBorrowerRecommendations = recommendations.filter((rec) => rec.borrowerId === selectedBorrowerId)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Borrower Risk Profiles</CardTitle>
          <CardDescription>Select a borrower to view detailed risk assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {borrowers.map((borrower) => (
              <Card
                key={borrower.id}
                className={`cursor-pointer ${borrower.id === selectedBorrowerId ? "border-2 border-primary" : ""}`}
                onClick={() => setSelectedBorrowerId(borrower.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{borrower.name}</CardTitle>
                    <Badge
                      className={`
                      ${
                        borrower.riskScore < 30
                          ? "bg-green-100 text-green-800"
                          : borrower.riskScore < 60
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    `}
                    >
                      Risk: {borrower.riskScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Credit Score:</strong> {borrower.creditScore}
                    </p>
                    <p>
                      <strong>Loan Amount:</strong> ${borrower.loanAmount.toLocaleString()}
                    </p>
                    <p>
                      <strong>Debt-to-Income:</strong> {borrower.debtToIncomeRatio}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedBorrower && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Risk Assessment: {selectedBorrower.name}</CardTitle>
                <CardDescription>Detailed risk analysis and factors</CardDescription>
              </div>
              <Badge
                className={`
                ${
                  selectedBorrower.riskScore < 30
                    ? "bg-green-100 text-green-800"
                    : selectedBorrower.riskScore < 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              `}
              >
                Risk Score: {selectedBorrower.riskScore}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Borrower Details</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>Loan Amount:</strong> ${selectedBorrower.loanAmount.toLocaleString()}
                  </p>
                  <p>
                    <strong>Purpose:</strong> {selectedBorrower.loanPurpose}
                  </p>
                  <p>
                    <strong>Credit Score:</strong> {selectedBorrower.creditScore}
                  </p>
                  <p>
                    <strong>Income:</strong> ${selectedBorrower.income.toLocaleString()}/year
                  </p>
                  <p>
                    <strong>Employment:</strong> {selectedBorrower.employmentStatus}
                  </p>
                  <p>
                    <strong>Debt-to-Income:</strong> {selectedBorrower.debtToIncomeRatio}%
                  </p>
                  <p>
                    <strong>Housing Status:</strong> {selectedBorrower.housingStatus}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Risk Factors</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Credit Score Impact</span>
                    <Badge
                      variant="outline"
                      className={
                        selectedBorrower.creditScore > 700
                          ? "bg-green-50"
                          : selectedBorrower.creditScore > 600
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }
                    >
                      {selectedBorrower.creditScore > 700
                        ? "Low Risk"
                        : selectedBorrower.creditScore > 600
                          ? "Medium Risk"
                          : "High Risk"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Debt-to-Income Impact</span>
                    <Badge
                      variant="outline"
                      className={
                        selectedBorrower.debtToIncomeRatio < 30
                          ? "bg-green-50"
                          : selectedBorrower.debtToIncomeRatio < 50
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }
                    >
                      {selectedBorrower.debtToIncomeRatio < 30
                        ? "Low Risk"
                        : selectedBorrower.debtToIncomeRatio < 50
                          ? "Medium Risk"
                          : "High Risk"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Employment Status Impact</span>
                    <Badge
                      variant="outline"
                      className={
                        ["full_time", "self_employed"].includes(selectedBorrower.employmentStatus)
                          ? "bg-green-50"
                          : ["part_time", "retired"].includes(selectedBorrower.employmentStatus)
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }
                    >
                      {["full_time", "self_employed"].includes(selectedBorrower.employmentStatus)
                        ? "Low Risk"
                        : ["part_time", "retired"].includes(selectedBorrower.employmentStatus)
                          ? "Medium Risk"
                          : "High Risk"}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">Loan Amount Impact</span>
                    <Badge
                      variant="outline"
                      className={
                        selectedBorrower.loanAmount < 10000
                          ? "bg-green-50"
                          : selectedBorrower.loanAmount < 50000
                            ? "bg-yellow-50"
                            : "bg-red-50"
                      }
                    >
                      {selectedBorrower.loanAmount < 10000
                        ? "Low Risk"
                        : selectedBorrower.loanAmount < 50000
                          ? "Medium Risk"
                          : "High Risk"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {selectedBorrowerRecommendations.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-4">Lender Recommendations</h3>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {selectedBorrowerRecommendations.map((rec) => (
                    <Card key={rec.lenderId} className="bg-slate-50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{rec.lenderName}</CardTitle>
                        <CardDescription>Confidence: {rec.confidenceScore}%</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Recommended Rate:</strong> {rec.recommendedInterestRate}%
                          </p>
                          <p>
                            <strong>Recommended Term:</strong> {rec.recommendedTerm} months
                          </p>
                          <p>
                            <strong>Monthly Payment:</strong> ${rec.estimatedMonthlyPayment.toFixed(2)}
                          </p>
                          <p>
                            <strong>Total Interest:</strong> ${rec.totalInterestPaid.toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

