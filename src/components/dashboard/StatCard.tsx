interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md p-6 border-t-4"
      style={{ borderTopColor: `var(--${color})` }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div
          className="p-3 rounded-full"
          style={{
            backgroundColor: `var(--${color.replace("-", "-")})20`,
            color: `var(--${color.replace("-", "-")})`,
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
