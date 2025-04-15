"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw, ThumbsUp, ThumbsDown, Info } from "lucide-react"
import type { Borrower, Lender, Match, LoanRecommendation } from "@/lib/types"
import { matchBorrowersWithLenders } from "@/lib/matching-algorithm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MatchesDashboardProps {
  matches: Match[]
  recommendations: LoanRecommendation[]
  isLoading: boolean
  borrowers: Borrower[]
  lenders: Lender[]
}

export default function MatchesDashboard({
  matches,
  recommendations,
  isLoading,
  borrowers,
  lenders,
}: MatchesDashboardProps) {
  const [refreshing, setRefreshing] = useState(false)
  const [localMatches, setLocalMatches] = useState<Match[]>(matches)

  const handleRefresh = async () => {
    if (borrowers.length === 0 || lenders.length === 0) return

    setRefreshing(true)
    const newMatches = await matchBorrowersWithLenders(borrowers, lenders)
    setLocalMatches(newMatches)
    setRefreshing(false)
  }

  if (borrowers.length === 0 || lenders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Matches Available</CardTitle>
          <CardDescription>You need at least one borrower and one lender to generate matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Please add borrowers and lenders to see potential matches.</p>
        </CardContent>
      </Card>
    )
  }

  const displayMatches = localMatches.length > 0 ? localMatches : matches

  if (isLoading || refreshing) {
    return (
      <Card className="flex flex-col items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-lg font-medium">Generating AI matches...</p>
        <p className="text-sm text-muted-foreground mt-2">Our AI is analyzing profiles to find the best matches</p>
      </Card>
    )
  }

  if (displayMatches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Matches Found</CardTitle>
          <CardDescription>Our AI couldn't find any suitable matches with the current profiles.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Try adding more diverse borrowers and lenders or adjust their criteria.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefresh} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Get recommendations for each match
  const getRecommendationForMatch = (match: Match) => {
    return recommendations.find((rec) => rec.borrowerId === match.borrowerId && rec.lenderId === match.lenderId)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI-Generated Matches</h2>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Matches
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Matches ({displayMatches.length})</TabsTrigger>
          <TabsTrigger value="high">
            High Match Score (&gt;{displayMatches.filter((m) => m.matchScore >= 80).length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            Medium Match Score ({displayMatches.filter((m) => m.matchScore >= 60 && m.matchScore < 80).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayMatches.map((match) => (
              <MatchCard
                key={`${match.borrowerId}-${match.lenderId}`}
                match={match}
                recommendation={getRecommendationForMatch(match)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="high">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayMatches
              .filter((match) => match.matchScore >= 80)
              .map((match) => (
                <MatchCard
                  key={`${match.borrowerId}-${match.lenderId}`}
                  match={match}
                  recommendation={getRecommendationForMatch(match)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="medium">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {displayMatches
              .filter((match) => match.matchScore >= 60 && match.matchScore < 80)
              .map((match) => (
                <MatchCard
                  key={`${match.borrowerId}-${match.lenderId}`}
                  match={match}
                  recommendation={getRecommendationForMatch(match)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MatchCard({ match, recommendation }: { match: Match; recommendation?: LoanRecommendation }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800"
    if (score >= 60) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base">Match Details</CardTitle>
          <Badge className={getScoreColor(match.matchScore)}>{match.matchScore}% Match</Badge>
        </div>
        <CardDescription>
          {match.borrowerName} & {match.lenderName}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-sm flex items-center">
              Borrower
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Credit Score: {match.borrowerCreditScore}</p>
                    <p>Risk Score: {match.borrowerRiskScore}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-sm">{match.borrowerName}</p>
            <p className="text-sm">
              Loan: ${match.loanAmount.toLocaleString()} for {match.loanPurpose}
            </p>
          </div>

          <div>
            <h3 className="font-medium text-sm flex items-center">
              Lender
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Min Credit Score: {match.lenderMinCreditScore}</p>
                    <p>Max Risk Tolerance: {match.lenderMaxRiskTolerance}%</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </h3>
            <p className="text-sm">{match.lenderName}</p>
            <p className="text-sm">
              Offering: ${match.lendingAmount.toLocaleString()} at {match.interestRate}%
            </p>
          </div>

          {recommendation && (
            <div className="bg-slate-50 p-3 rounded-md">
              <h3 className="font-medium text-sm mb-1">AI Recommendation</h3>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-white">
                  {recommendation.recommendedInterestRate}% Interest
                </Badge>
                <Badge variant="outline" className="bg-white">
                  {recommendation.recommendedTerm} months
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs">
                {recommendation.confidenceScore >= 70 ? (
                  <ThumbsUp className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <ThumbsDown className="h-3.5 w-3.5 text-amber-600" />
                )}
                <span className="text-muted-foreground">{recommendation.confidenceScore}% confidence</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="analysis">
            <AccordionTrigger className="text-sm py-2">AI Analysis</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">{match.aiReasoning}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardFooter>
    </Card>
  )
}

