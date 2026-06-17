"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface SerializedCompany {
  id: string
  name: string
  industry: string | null
  address: string | null
  registrationNumber: string | null
}

interface SerializedContact {
  id: string
  fullName: string
  title: string | null
  email: string | null
  phone: string | null
  company: { name: string } | null
}

interface SerializedDeal {
  id: string
  title: string
  stage: string | null
  amount: number | null
  currency: string
  company: { name: string } | null
  contact: { fullName: string } | null
}

export function CrmTabs({
  companies,
  contacts,
  deals,
}: {
  companies: SerializedCompany[]
  contacts: SerializedContact[]
  deals: SerializedDeal[]
}) {
  return (
    <Tabs defaultValue="companies">
      <TabsList>
        <TabsTrigger value="companies">חברות</TabsTrigger>
        <TabsTrigger value="contacts">אנשי קשר</TabsTrigger>
        <TabsTrigger value="deals">עסקאות</TabsTrigger>
      </TabsList>

      <TabsContent value="companies" className="mt-4">
        {companies.length === 0 ? (
          <EmptyState text="אין חברות עדיין" />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>תעשייה</TableHead>
                  <TableHead>כתובת</TableHead>
                  <TableHead>ח.פ.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell className="text-muted-foreground">{company.industry ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{company.address ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{company.registrationNumber ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="contacts" className="mt-4">
        {contacts.length === 0 ? (
          <EmptyState text="אין אנשי קשר עדיין" />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>שם</TableHead>
                  <TableHead>תפקיד</TableHead>
                  <TableHead>חברה</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>טלפון</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.fullName}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.title ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.company?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.email ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.phone ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>

      <TabsContent value="deals" className="mt-4">
        {deals.length === 0 ? (
          <EmptyState text="אין עסקאות עדיין" />
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>עסקה</TableHead>
                  <TableHead>חברה</TableHead>
                  <TableHead>שלב</TableHead>
                  <TableHead>שווי</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deals.map((deal) => (
                  <TableRow key={deal.id}>
                    <TableCell className="font-medium">{deal.title}</TableCell>
                    <TableCell className="text-muted-foreground">{deal.company?.name ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{deal.stage ?? "—"}</Badge>
                    </TableCell>
                    <TableCell>
                      {deal.amount ? `₪${deal.amount.toLocaleString("he-IL")}` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
      <p className="text-muted-foreground">{text}</p>
    </div>
  )
}
