import { atom, AtomOptions } from 'recoil';
import { recoilPersist } from 'recoil-persist';
import { v1 } from 'uuid';

const { persistAtom } = recoilPersist()

function createAtom<T>({ 
  key, 
  persist = false,
  effects_UNSTABLE = [], 
  ...options
 } : AtomOptions<T> & { persist?: boolean }) {
  const default_effects:any[] = [];

  if (persist) default_effects.push(persistAtom);

  return atom({
    key: `${key}/${v1()}`,
    effects_UNSTABLE: [ ...default_effects, ...effects_UNSTABLE ],
    ...options
  });
}

export { createAtom };