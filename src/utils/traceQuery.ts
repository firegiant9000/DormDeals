// src/utils/traceQuery.ts
import { Query, getDocs } from 'firebase/firestore';
import { dlog } from './debug';

export async function traceQuery(label: string, q: Query) {
  dlog(`[TRACE] ${label}: running`, q);
  const snap = await getDocs(q);
  const ids = snap.docs.map(d => d.id);
  const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  dlog(`[TRACE] ${label}: size=${snap.size}`, { ids, data });
  return snap as any;
}

