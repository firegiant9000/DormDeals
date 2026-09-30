// @vitest-environment node
//
// Firestore security-rules tests for Month 1 #5 (rules hardening).
// Run against the Firestore emulator:  npm run test:rules
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'dormdeals-rules-test';
let testEnv: RulesTestEnvironment;

const ALICE = 'alice';
const BOB = 'bob';

// Exactly the keys listingService.createListing writes.
function validListing(ownerId: string) {
  return {
    title: 'Desk lamp',
    description: 'Barely used',
    price: 12,
    category: 'furniture',
    condition: 'good',
    ownerId,
    status: 'active',
    createdAt: serverTimestamp(),
    imageUrls: [],
    isFeatured: false
  };
}

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(resolve(__dirname, '../firestore.rules'), 'utf8')
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('users/{uid} profile', () => {
  it('lets a user read and write their own profile', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(alice, 'users', ALICE), { displayName: 'Alice' }));
    await assertSucceeds(getDoc(doc(alice, 'users', ALICE)));
  });

  it('blocks reading another user private profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', BOB), { email: 'bob@x.edu', phone: '555' });
    });
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(getDoc(doc(alice, 'users', BOB)));
  });

  it('blocks writing to a foreign user doc', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(alice, 'users', BOB), { displayName: 'hacked' }));
  });

  it('blocks an unauthenticated read of a user doc', async () => {
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anon, 'users', ALICE)));
  });

  it('lets an admin (admins/{uid} doc) read and update a foreign user doc', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'admins', ALICE), { since: Timestamp.fromMillis(0) });
      await setDoc(doc(ctx.firestore(), 'users', BOB), { email: 'bob@x.edu', banned: false });
    });
    const adminAlice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(getDoc(doc(adminAlice, 'users', BOB)));
    await assertSucceeds(updateDoc(doc(adminAlice, 'users', BOB), { banned: true }));
  });

  it('does not let a non-admin self-promote (admins is not client-writable)', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(alice, 'admins', ALICE), { since: serverTimestamp() }));
  });

  it('allows the default profile shape userService.createUserProfile writes', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(alice, 'users', ALICE), {
      email: 'alice@x.edu', displayName: 'Alice', userType: 'regular',
      isVerified: false, rating: 0, reviewCount: 0, totalSales: 0
    }));
  });

  it('blocks creating a self profile with privileged values', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(alice, 'users', ALICE), { displayName: 'Alice', userType: 'admin' }));
    await assertFails(setDoc(doc(alice, 'users', ALICE), { displayName: 'Alice', isVerified: true }));
    await assertFails(setDoc(doc(alice, 'users', ALICE), { displayName: 'Alice', rating: 5 }));
    await assertFails(setDoc(doc(alice, 'users', ALICE), { displayName: 'Alice', isBanned: false }));
  });

  it('blocks a user from changing their own role, ban or reputation fields', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', ALICE), {
        displayName: 'Alice', userType: 'regular', isBanned: true, rating: 0
      });
    });
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(updateDoc(doc(alice, 'users', ALICE), { userType: 'admin' }));
    await assertFails(updateDoc(doc(alice, 'users', ALICE), { userType: 'premium' }));
    await assertFails(updateDoc(doc(alice, 'users', ALICE), { isBanned: false }));
    await assertFails(updateDoc(doc(alice, 'users', ALICE), { rating: 5 }));
    // Ordinary profile edits (what Profile.tsx sends) still go through.
    await assertSucceeds(updateDoc(doc(alice, 'users', ALICE), {
      displayName: 'Alice K', school: 'UL', updatedAt: serverTimestamp()
    }));
  });

  it('exposes the publicProfile subdoc to anyone but only the owner writes it', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'users', ALICE, 'publicProfile', 'card'), {
        displayName: 'Alice', school: 'UL', rating: 5
      });
    });
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertSucceeds(getDoc(doc(bob, 'users', ALICE, 'publicProfile', 'card')));
    await assertFails(setDoc(doc(bob, 'users', ALICE, 'publicProfile', 'card'), { rating: 1 }));

    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(alice, 'users', ALICE, 'publicProfile', 'card'), { rating: 4 }));
  });
});

describe('users/{uid} cart + favorites', () => {
  it('scopes cart and favorites to the owner', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(alice, 'users', ALICE, 'cart', 'l1'), { qty: 1 }));
    await assertSucceeds(setDoc(doc(alice, 'users', ALICE, 'favorites', 'l1'), { addedAt: serverTimestamp() }));

    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(getDoc(doc(bob, 'users', ALICE, 'cart', 'l1')));
    await assertFails(setDoc(doc(bob, 'users', ALICE, 'favorites', 'l1'), { addedAt: serverTimestamp() }));
  });
});

describe('listings', () => {
  it('allows anyone to read listings', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'l1'), validListing(ALICE));
    });
    const anon = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(anon, 'listings', 'l1')));
  });

  it('allows the owner to create a well-formed listing', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(setDoc(doc(alice, 'listings', 'l1'), validListing(ALICE)));
  });

  it('rejects a listing whose ownerId is not the caller', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(setDoc(doc(alice, 'listings', 'l1'), validListing(BOB)));
  });

  it('rejects field injection on create (hasOnly)', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, 'listings', 'l1'), { ...validListing(ALICE), isAdmin: true })
    );
  });

  it('rejects a spoofed createdAt that is not request.time', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, 'listings', 'l1'), {
        ...validListing(ALICE),
        createdAt: Timestamp.fromMillis(0)
      })
    );
  });

  it('rejects a create with a status outside the allowlist', async () => {
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(
      setDoc(doc(alice, 'listings', 'l1'), { ...validListing(ALICE), status: 'sold' })
    );
  });

  it('lets the owner update but keeps ownerId immutable', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'l1'), {
        ...validListing(ALICE),
        createdAt: Timestamp.fromMillis(1000)
      });
    });
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertSucceeds(updateDoc(doc(alice, 'listings', 'l1'), { price: 20 }));
    await assertFails(updateDoc(doc(alice, 'listings', 'l1'), { ownerId: BOB }));
    await assertFails(updateDoc(doc(alice, 'listings', 'l1'), { createdAt: serverTimestamp() }));
  });

  it('blocks a non-owner from updating non-view fields or deleting a listing', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'l1'), {
        ...validListing(ALICE),
        createdAt: Timestamp.fromMillis(1000)
      });
    });
    const bob = testEnv.authenticatedContext(BOB).firestore();
    await assertFails(updateDoc(doc(bob, 'listings', 'l1'), { price: 1 }));
    await assertFails(deleteDoc(doc(bob, 'listings', 'l1')));
  });

  it('rejects field injection on update (hasOnly)', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'l1'), {
        ...validListing(ALICE),
        createdAt: Timestamp.fromMillis(1000)
      });
    });
    const alice = testEnv.authenticatedContext(ALICE).firestore();
    await assertFails(updateDoc(doc(alice, 'listings', 'l1'), { isAdmin: true }));
  });

  it('lets any signed-in viewer increment views by exactly one', async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), 'listings', 'l1'), {
        ...validListing(ALICE),
        createdAt: Timestamp.fromMillis(1000)
      });
    });
    const bob = testEnv.authenticatedContext(BOB).firestore();
    // First view on a listing with no `views` field yet (get(...,0) default).
    await assertSucceeds(updateDoc(doc(bob, 'listings', 'l1'), { views: 1, updatedAt: serverTimestamp() }));
    // A jump that is not +1 is rejected.
    await assertFails(updateDoc(doc(bob, 'listings', 'l1'), { views: 50 }));
    // Smuggling another field alongside views is rejected.
    await assertFails(updateDoc(doc(bob, 'listings', 'l1'), { views: 2, price: 1 }));
  });
});

describe('reject-by-default stubs', () => {
  const collections = ['reviews', 'conversations', 'reports', 'transactions', 'auditLog', 'campusMeta'];
  for (const c of collections) {
    it(`denies read and write on ${c}`, async () => {
      const alice = testEnv.authenticatedContext(ALICE).firestore();
      await assertFails(getDocs(collection(alice, c)));
      await assertFails(setDoc(doc(alice, c, 'x'), { a: 1 }));
    });
  }
});
