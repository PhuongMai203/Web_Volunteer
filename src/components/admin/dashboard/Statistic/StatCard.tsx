const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100">
    <h3 className="text-lg font-medium text-gray-600">{title}</h3>
    <p className="text-3xl font-bold text-blue-600 mt-2">{value}</p>
  </div>
);

export default StatCard;
