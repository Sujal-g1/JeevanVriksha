// const AlertsPanel = ({ vaccines }) => {

//   const alerts = vaccines.map(
//     v => `${v.vaccineName} due on ${new Date(v.dueDate).toLocaleDateString()}`
//   );

//   return (
//     <div className="bg-white rounded-xl p-6 shadow">

//       <h3 className="font-bold mb-3">
//         Alerts
//       </h3>

//       {alerts.length === 0 && (
//         <p className="text-sm text-gray-500">
//           No alerts
//         </p>
//       )}

//       {alerts.map((a, i) => (
//         <p key={i} className="text-sm border-b py-2">
//           {a}
//         </p>
//       ))}

//     </div>
//   );
// };

// export default AlertsPanel;

import React from 'react'

const AlertPanel = () => {
  return (
    <div>AlertPanel</div>
  )
}

export default AlertPanel