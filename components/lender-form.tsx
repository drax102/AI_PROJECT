"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import type { Lender } from "@/lib/types"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const loanPurposes = [
  { id: "education", label: "Education" },
  { id: "business", label: "Business" },
  { id: "home_improvement", label: "Home Improvement" },
  { id: "debt_consolidation", label: "Debt Consolidation" },
  { id: "medical", label: "Medical Expenses" },
  { id: "vehicle", label: "Vehicle Purchase" },
  { id: "wedding", label: "Wedding" },
  { id: "vacation", label: "Vacation" },
  { id: "other", label: "Other" },
]

const loanTerms = [
  { id: "3", label: "3 months" },
  { id: "6", label: "6 months" },
  { id: "12", label: "12 months" },
  { id: "24", label: "24 months" },
  { id: "36", label: "36 months" },
  { id: "48", label: "48 months" },
  { id: "60", label: "60 months" },
]

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  amountToLend: z.coerce
    .number()
    .min(1000, { message: "Amount must be at least $1,000." })
    .max(1000000, { message: "Amount cannot exceed $1,000,000." }),
  minCreditScore: z.coerce
    .number()
    .min(300, { message: "Minimum credit score must be at least 300." })
    .max(850, { message: "Credit score cannot exceed 850." }),
  interestRate: z.coerce
    .number()
    .min(1, { message: "Interest rate must be at least 1%." })
    .max(30, { message: "Interest rate cannot exceed 30%." }),
  maxRiskTolerance: z.coerce
    .number()
    .min(0, { message: "Risk tolerance must be at least 0%." })
    .max(100, { message: "Risk tolerance cannot exceed 100%." }),
  preferredPurposes: z.array(z.string()).min(1, { message: "Please select at least one loan purpose." }),
  loanTerms: z.array(z.string()).min(1, { message: "Please select at least one loan term." }),
})

interface LenderFormProps {
  onSubmit: (data: Lender) => void
  isProcessing: boolean
  marketRates: { [key: string]: number }
}

export default function LenderForm({ onSubmit, isProcessing, marketRates }: LenderFormProps) {
  const [minCreditScore, setMinCreditScore] = useState<number>(650)
  const [interestRate, setInterestRate] = useState<number>(8)
  const [maxRiskTolerance, setMaxRiskTolerance] = useState<number>(50)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      amountToLend: 10000,
      minCreditScore: 650,
      interestRate: 8,
      maxRiskTolerance: 50,
      preferredPurposes: ["education", "business"],
      loanTerms: ["12", "24"],
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as Lender)
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Smith" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="jane@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="amountToLend"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Lend ($)</FormLabel>
              <FormControl>
                <Input type="number" min={1000} max={1000000} {...field} />
              </FormControl>
              <FormDescription>Amount between $1,000 and $1,000,000</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-slate-50 p-4 rounded-md mb-4">
          <h3 className="text-sm font-medium mb-2">Current Market Rates</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(marketRates).map(([term, rate]) => (
              <Badge key={term} variant="outline" className="bg-white">
                {term} months: {rate.toFixed(2)}%
              </Badge>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="interestRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interest Rate: {interestRate}%</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={30}
                  step={0.5}
                  value={[interestRate]}
                  onValueChange={(value) => {
                    setInterestRate(value[0])
                    field.onChange(value[0])
                  }}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>Annual interest rate between 1% and 30%</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minCreditScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Credit Score: {minCreditScore}</FormLabel>
              <FormControl>
                <Slider
                  min={300}
                  max={850}
                  step={10}
                  value={[minCreditScore]}
                  onValueChange={(value) => {
                    setMinCreditScore(value[0])
                    field.onChange(value[0])
                  }}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>Minimum acceptable credit score</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxRiskTolerance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Risk Tolerance: {maxRiskTolerance}%</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[maxRiskTolerance]}
                  onValueChange={(value) => {
                    setMaxRiskTolerance(value[0])
                    field.onChange(value[0])
                  }}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>
                Maximum risk level you're willing to accept (higher = riskier borrowers)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="loanTerms"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Loan Terms</FormLabel>
                <FormDescription>Select the loan durations you're willing to offer</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {loanTerms.map((term) => (
                  <FormField
                    key={term.id}
                    control={form.control}
                    name="loanTerms"
                    render={({ field }) => {
                      return (
                        <FormItem key={term.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(term.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, term.id])
                                  : field.onChange(field.value?.filter((value) => value !== term.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{term.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="preferredPurposes"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>Preferred Loan Purposes</FormLabel>
                <FormDescription>Select the types of loans you're interested in funding</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {loanPurposes.map((purpose) => (
                  <FormField
                    key={purpose.id}
                    control={form.control}
                    name="preferredPurposes"
                    render={({ field }) => {
                      return (
                        <FormItem key={purpose.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(purpose.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, purpose.id])
                                  : field.onChange(field.value?.filter((value) => value !== purpose.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{purpose.label}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Register as Lender"
          )}
        </Button>
      </form>
    </Form>
  )
}

