import { password as bunPassword } from 'bun';
// import bcrypt from 'bcrypt'

const bcryptLib = {
  hash(password: string) {
    return bunPassword.hash(password, { algorithm: 'bcrypt', cost: 12 });
    // return bcrypt.hash(password, 12);
  },
  compare(password: string, hash: string) {
    return bunPassword.verify(password, hash, 'bcrypt');
    // return bcrypt.compare(password, hash);
  },
};

export function useBcrypt() {
  return bcryptLib;
}
