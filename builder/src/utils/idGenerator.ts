import { v4 as uuidv4 } from 'uuid';

/** Generate a unique ID for layout nodes. */
export const generateId = (): string => uuidv4();
