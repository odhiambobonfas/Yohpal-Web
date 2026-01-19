"use client"

import { AlertCircle, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DepositForm } from "@/components/custom/account/deposit/DepositForm"

export default function DepositPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">
          Add money to your Yohpal account using M-Pesa
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <DepositForm />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    1
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Enter your M-Pesa registered phone number
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    2
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Enter the amount you want to deposit (minimum KES 10)
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    3
                  </span>
                  <p className="text-sm text-muted-foreground">
                    You will receive an M-Pesa STK push on your phone
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                    4
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Enter your M-Pesa PIN to complete the transaction
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-green-500" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  Your M-Pesa PIN is never stored or seen by us
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  All transactions are encrypted and secure
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">&#10003;</span>
                  Funds are credited instantly after successful payment
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
