// function OrderTabs({ active, onChange }) {
//   return (
//     <div className="flex w-fit items-center gap-1 rounded-full bg-surfaceMuted p-1">
//       {TABS.map((tab) => {
//         const isActive = tab.key === active;

//         return (
//           <button
//             key={tab.key}
//             onClick={() => onChange(tab.key)}
//             className={[
//               "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
//               isActive
//                 ? "bg-primary text-inverse shadow-card"
//                 : "text-muted hover:text-text",
//             ].join(" ")}
//           >
//             {tab.label}
//           </button>
//         );
//       })}
//     </div>
//   );
// }