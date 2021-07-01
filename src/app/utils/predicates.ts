/*
    This file contains generic predicates that can be used for filtering / other kinds of
    functional programming patterns.
 */

/**
 * return true if the value is falsey,
 * return false otherwise
 */
export const isFalsey: (v: any) => boolean = v => !v;
