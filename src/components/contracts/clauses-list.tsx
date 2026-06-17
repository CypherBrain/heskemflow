"use client"

import { useState } from "react"
import { Search, Copy, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
interface SerializedClause {
  id: string
  title: string
  content: string
  category: string
  riskLevel: string
  language: string
  industry: string | null
  createdAt: string
}

const riskColors: Record<string, string> = {
  high: "bg-red-50 text-red-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-green-50 text-green-700",
}

const riskLabels: Record<string, string> = {
  high: "סיכון גבוה",
  medium: "סיכון בינוני",
  low: "סיכון נמוך",
}

export function ClausesList({ clauses, categories }: { clauses: SerializedClause[]; categories: string[] }) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")

  const filtered = clauses.filter((clause) => {
    const matchesCategory = category === "all" || clause.category === category
    const matchesSearch =
      search === "" ||
      clause.title.includes(search) ||
      clause.content.includes(search)
    return matchesCategory && matchesSearch
  })

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="חיפוש סעיף..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
        {categories.length > 0 && (
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="flex-wrap">
              <TabsTrigger value="all" className="text-xs">הכל</TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <BookOpen className="size-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {clauses.length === 0 ? "אין סעיפים עדיין" : "לא נמצאו סעיפים"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((clause) => (
            <Card key={clause.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">{clause.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {clause.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {clause.category}
                    </Badge>
                    <Badge variant="secondary" className={`text-[10px] ${riskColors[clause.riskLevel] ?? ""}`}>
                      {riskLabels[clause.riskLevel] ?? clause.riskLevel}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                    <Copy className="size-3" />
                    העתק
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
