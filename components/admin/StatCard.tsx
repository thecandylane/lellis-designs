type StatCardProps = {
  label: string
  value: string | number
  sublabel?: string
  highlight?: boolean
}

export default function StatCard({ label, value, sublabel, highlight }: StatCardProps) {
  return (
    <div className={`rounded-lg shadow p-6 ${highlight ? 'bg-amber-50 ring-2 ring-amber-200' : 'bg-white'}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-amber-700' : 'text-gray-900'}`}>{value}</p>
      {sublabel && (
        <p className="text-sm text-gray-500 mt-1">{sublabel}</p>
      )}
    </div>
  )
}
