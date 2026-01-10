const FeatureTable = () => {
  return (
    <div className="mt-16 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Features</th>
            <th className="p-3">Basic</th>
            <th className="p-3">Pro</th>
            <th className="p-3">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {[
            "Course Access",
            "Certificate",
            "Live Sessions",
            "1-on-1 Mentorship",
          ].map((feature) => (
            <tr
              key={feature}
              className="transition-all hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50
              hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <td className="p-3">{feature}</td>
              <td className="p-3">✔</td>
              <td className="p-3">✔</td>
              <td className="p-3">✔</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FeatureTable
