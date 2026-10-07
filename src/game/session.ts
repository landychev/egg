import { createEggIdCounter } from '../logic/ids';

// Shared by future scenes. A new round must not create or reset this counter.
export const sessionEggIds = createEggIdCounter();
