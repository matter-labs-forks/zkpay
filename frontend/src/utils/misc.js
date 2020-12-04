import Promise from 'bluebird';

import { customAlphabet } from 'nanoid';

export const nanoid = customAlphabet(
  '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  6
);

export const sleep = ms => new Promise(r => setTimeout(r, ms));
