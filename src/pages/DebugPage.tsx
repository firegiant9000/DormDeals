// src/pages/DebugPage.tsx
import { useEffect, useState } from 'react';
import { auth } from '@/firebase';
import { fetchMarketplace } from '@/data/listingsProvider';
import { dlog } from '@/utils/debug';

export default function DebugPage() {
  const [state, setState] = useState<any>({});

  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid ?? null;
      const { items } = await fetchMarketplace({});

      dlog('[DEBUG] uid', uid, 'items', items);
      setState({ uid, items: items?.slice(0, 3) });
    })();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}

