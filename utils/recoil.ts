import { atom, AtomOptions } from 'recoil';
import { v1 } from 'uuid';

function useAtom<T>({ key, ...options } : AtomOptions<T>) {
  return atom({
    key: `${key}/${v1()}`,
    ...options
  });
}

export { useAtom };