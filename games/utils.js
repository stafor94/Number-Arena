export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const clamp = (value, min, max = Number.POSITIVE_INFINITY) => Math.min(max, Math.max(min, value));
