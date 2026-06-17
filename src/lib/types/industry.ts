/** חבילת ענף – תבניות וסעיפים מותאמים לענף מסוים */
export interface IndustryPack {
  id: string;
  /** שם החבילה */
  name: string;
  /** תיאור */
  description: string | null;
  /** שם הענף */
  industry: string;
  /** תבניות חוזה מוכנות */
  templates: Record<string, unknown>[];
  /** סעיפים מומלצים */
  clauses: Record<string, unknown>[];
  /** האם פעילה */
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
