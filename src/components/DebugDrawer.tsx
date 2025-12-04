import { useCartWishlist } from '@/hooks/useCommerce';
import { auth } from '@/firebase';
import { useState, useEffect } from 'react';

function DebugDrawer() {
  const { cartCount, wishlistCount, listenerStatus } = useCartWishlist();
  const [lastOp, setLastOp] = useState<string>('none');
  const [lastErrorCode, setLastErrorCode] = useState<string>('none');

  // Track last operation and error via a simple state update mechanism
  // This is simpler than intercepting console - components will update this directly if needed
  // For now, we'll rely on the console messages being visible to developers

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 rounded-lg border bg-white/95 dark:bg-slate-900/95 p-3 text-xs shadow-lg z-50 max-w-xs">
      <div className="font-semibold mb-2 text-gray-900 dark:text-slate-100 border-b pb-1">
        Debug Info
      </div>
      <div className="space-y-1 text-gray-700 dark:text-slate-300">
        <div>
          <span className="font-medium">uid:</span>{' '}
          <span className="font-mono text-xs">{auth.currentUser?.uid ?? 'none'}</span>
        </div>
        <div>
          <span className="font-medium">cart:</span> {cartCount} ·{' '}
          <span className="font-medium">wishlist:</span> {wishlistCount}
        </div>
        <div>
          <span className="font-medium">last op:</span> {lastOp}
        </div>
        <div>
          <span className="font-medium">last error:</span> {lastErrorCode}
        </div>
        <div>
          <span className="font-medium">listener:</span>{' '}
          <span className={listenerStatus === 'active' ? 'text-green-600' : listenerStatus === 'error' ? 'text-red-600' : 'text-gray-500'}>
            {listenerStatus}
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 mt-2 pt-2 border-t">
          Watch console for [COMMERCE] and [CREATE_LISTING]
        </div>
      </div>
    </div>
  );
}

export default DebugDrawer;

