import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureDefaultAdminUser } from '../src/lib/admin-auth.mjs';

test('ensureDefaultAdminUser creates an admin user when missing', async () => {
  const createdUsers = [];
  const prisma = {
    user: {
      findUnique: async () => null,
      create: async (args) => {
        createdUsers.push(args.data);
        return { ...args.data, id: 1 };
      },
    },
  };

  const bcrypt = {
    hash: async () => 'hashed-password',
  };

  const result = await ensureDefaultAdminUser({ prisma, bcrypt, email: 'admin@senakids.com', password: 'secret' });

  assert.equal(result.created, true);
  assert.equal(createdUsers[0].role, 'admin');
  assert.equal(createdUsers[0].email, 'admin@senakids.com');
});

test('ensureDefaultAdminUser promotes an existing non-admin account', async () => {
  const updatedUsers = [];
  const prisma = {
    user: {
      findUnique: async () => ({ id: 1, role: 'user', email: 'admin@senakids.com' }),
      update: async (args) => {
        updatedUsers.push(args.data);
        return { ...args.data, id: 1 };
      },
    },
  };

  const bcrypt = {
    hash: async () => 'hashed-password',
  };

  const result = await ensureDefaultAdminUser({ prisma, bcrypt, email: 'admin@senakids.com', password: 'secret' });

  assert.equal(result.created, false);
  assert.deepEqual(updatedUsers[0], { role: 'admin' });
});
