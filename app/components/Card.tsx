type CardProps = {
  title: string
  value: string
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="rounded-xl border p-5 bg-white shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold mt-2">{value}</h2>
    </div>
  )
}
