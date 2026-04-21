import type { DojoCastDeck } from '../types/dojo';

export function filterAndSortDecks(decks: DojoCastDeck[]): DojoCastDeck[] {
  return decks
    .filter(d => d.isActive && d.syncStatus === 'synced')
    .slice()
    .sort((a, b) => a.order - b.order);
}
