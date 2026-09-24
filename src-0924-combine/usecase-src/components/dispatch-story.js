// One timeline drives the people, LINE details, and HR monitor together.
export const dispatchCases = [
 {date:'09/02',issue:'下班缺卡',expected:'18:00',sentAt:7,doneAt:14},
 {date:'09/04',issue:'上班缺卡',expected:'09:00',sentAt:8.5,doneAt:18},
 {date:'09/05',issue:'下班缺卡',expected:'18:00',sentAt:10,doneAt:Infinity},
];
export function dispatchState(time){
 const phase=time<4?'manual':time<7?'scan':time<12?'send':'track';
 const rows=dispatchCases.map(row=>({...row,sent:time>=row.sentAt,done:time>=row.doneAt}));
 return {phase,rows,pending:rows.filter(row=>!row.done).length,completed:rows.filter(row=>row.done).length};
}
