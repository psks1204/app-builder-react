import { v4 as uuidv4 } from 'uuid';

/** Generate a unique identifier for canvas nodes */
export const generateId = (): string => uuidv4();
