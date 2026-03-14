import React from "react";
import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
ResponsiveContainer
} from "recharts";

import { TrendingUp } from "lucide-react";

const PatientVitalsChart = ({vitals})=>{

const chartData = vitals.map(v=>({

date:new Date(v.createdAt).toLocaleDateString(),
weight:Number(v.weight),
glucose:Number(v.glucose)

}));

return(

<div className="bg-white rounded-3xl p-6 shadow-xl">

<h3 className="flex items-center gap-2 font-bold mb-4">
<TrendingUp size={18}/> Health Trends
</h3>

<div className="h-64">

<ResponsiveContainer width="100%" height="100%">

<LineChart data={chartData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="date"/>

<YAxis/>

<Tooltip/>

<Line
type="monotone"
dataKey="weight"
stroke="#16a34a"
strokeWidth={3}
/>

<Line
type="monotone"
dataKey="glucose"
stroke="#2563eb"
strokeWidth={3}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

);

};

export default PatientVitalsChart;