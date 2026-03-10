import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const HealthChart = ({ vitals }) => {

  const data = [
    { day: "Mon", bp: 120 },
    { day: "Tue", bp: 122 },
    { day: "Wed", bp: 118 },
    { day: "Thu", bp: 121 }
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h3 className="font-bold mb-4">
        BP Trend
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>

          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="bp"
            stroke="#2563eb"
          />

        </LineChart>
      </ResponsiveContainer>

    </div>
  );
};

export default HealthChart;