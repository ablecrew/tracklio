export default function Card({ title, value, color }) {
  const colors = {
    primary: "text-primary",
    success: "text-success",
    danger: "text-danger",
    secondary: "text-secondary",
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className={`text-xl font-bold ${colors[color]}`}>
        {value}
      </h2>
    </div>
  );
}