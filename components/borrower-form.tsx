"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { Borrower } from "@/lib/types"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  loanAmount: z.coerce
    .number()
    .min(1000, { message: "Loan amount must be at least $1,000." })
    .max(100000, { message: "Loan amount cannot exceed $100,000." }),
  loanPurpose: z.string().min(1, { message: "Please select a loan purpose." }),
  creditScore: z.coerce
    .number()
    .min(300, { message: "Credit score must be at least 300." })
    .max(850, { message: "Credit score cannot exceed 850." }),
  income: z.coerce.number().min(10000, { message: "Annual income must be at least $10,000." }),
  employmentStatus: z.string().min(1, { message: "Please select an employment status." }),
  debtToIncomeRatio: z.coerce
    .number()
    .min(0, { message: "Debt-to-income ratio cannot be negative." })
    .max(100, { message: "Debt-to-income ratio cannot exceed 100%." }),
  loanTerm: z.coerce.number().min(1, { message: "Loan term must be at least 1 month." }),
  housingStatus: z.string().min(1, { message: "Please select a housing status." }),
})

interface BorrowerFormProps {
  onSubmit: (data: Borrower) => void
  isProcessing: boolean
}

export default function BorrowerForm({ onSubmit, isProcessing }: BorrowerFormProps) {
  const [creditScore, setCreditScore] = useState<number>(650)
  const [debtToIncomeRatio, setDebtToIncomeRatio] = useState<number>(30)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      loanAmount: 5000,
      loanPurpose: "",
      creditScore: 650,
      income: 50000,
      employmentStatus: "",
      debtToIncomeRatio: 30,
      loanTerm: 12,
      housingStatus: "",
    },
  })

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values as Borrower)
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
                  <Input placeholder="John Doe" {...field} />
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
                  <Input placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="loanAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount ($)</FormLabel>
                <FormControl>
                  <Input type="number" min={1000} max={100000} {...field} />
                </FormControl>
                <FormDescription>Amount between $1,000 and $100,000</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="loanTerm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term (months)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(Number.parseInt(value))}
                  defaultValue={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 months</SelectItem>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                    <SelectItem value="48">48 months</SelectItem>
                    <SelectItem value="60">60 months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="loanPurpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Purpose</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="home_improvement">Home Improvement</SelectItem>
                    <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
                    <SelectItem value="medical">Medical Expenses</SelectItem>
                    <SelectItem value="vehicle">Vehicle Purchase</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="income"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Income ($)</FormLabel>
                <FormControl>
                  <Input type="number" min={10000} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="full_time">Full-time</SelectItem>
                    <SelectItem value="part_time">Part-time</SelectItem>
                    <SelectItem value="self_employed">Self-employed</SelectItem>
                    <SelectItem value="unemployed">Unemployed</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="housingStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Housing Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="own">Own</SelectItem>
                    <SelectItem value="mortgage">Mortgage</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="living_with_parents">Living with Parents</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="creditScore"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credit Score: {creditScore}</FormLabel>
              <FormControl>
                <Slider
                  min={300}
                  max={850}
                  step={1}
                  value={[creditScore]}
                  onValueChange={(value) => {
                    setCreditScore(value[0])
                    field.onChange(value[0])
                  }}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>Credit score between 300 and 850</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="debtToIncomeRatio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Debt-to-Income Ratio: {debtToIncomeRatio}%</FormLabel>
              <FormControl>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[debtToIncomeRatio]}
                  onValueChange={(value) => {
                    setDebtToIncomeRatio(value[0])
                    field.onChange(value[0])
                  }}
                  className="py-4"
                />
              </FormControl>
              <FormDescription>Percentage of monthly income that goes toward paying debts</FormDescription>
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
            "Submit Loan Request"
          )}
        </Button>
      </form>
    </Form>
  )
}

