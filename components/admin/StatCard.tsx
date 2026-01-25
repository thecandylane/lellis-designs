type StatCardProps = {
  label: string
  value: string | number
  sublabel?: string
  highlight?: boolean
}

export default function StatCard({ label, value, sublabel, highlight }: StatCardProps) {
  return (
    <div className={`rounded-lg shadow p-6 ${highlight ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-card'}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</p>
      {sublabel && (
        <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
      )}
    </div>
  )
}
