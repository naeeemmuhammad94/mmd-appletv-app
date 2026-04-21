import { filterAndSortDecks } from '../src/utils/dojoCastFilters';
import type { DojoCastDeck } from '../src/types/dojo';

function mkDeck(over: Partial<DojoCastDeck>): DojoCastDeck {
  return {
    _id: 'd',
    dojo: 'x',
    source: 'google_slides',
    sourceId: 's',
    label: 'L',
    order: 0,
    authMethod: 'oauth',
    syncIntervalMin: 30,
    syncStatus: 'synced',
    lastSyncAt: null,
    isActive: true,
    slides: [],
    ...over,
  };
}

describe('filterAndSortDecks', () => {
  it('drops inactive decks', () => {
    const input = [mkDeck({ _id: 'a', isActive: false }), mkDeck({ _id: 'b' })];
    expect(filterAndSortDecks(input).map(d => d._id)).toEqual(['b']);
  });

  it('drops non-synced statuses', () => {
    const input = [
      mkDeck({ _id: 'p', syncStatus: 'pending' }),
      mkDeck({ _id: 's', syncStatus: 'syncing' }),
      mkDeck({ _id: 'e', syncStatus: 'error' }),
      mkDeck({ _id: 'ok', syncStatus: 'synced' }),
    ];
    expect(filterAndSortDecks(input).map(d => d._id)).toEqual(['ok']);
  });

  it('sorts synced+active decks by order ascending', () => {
    const input = [
      mkDeck({ _id: 'c', order: 2 }),
      mkDeck({ _id: 'a', order: 0 }),
      mkDeck({ _id: 'b', order: 1 }),
    ];
    expect(filterAndSortDecks(input).map(d => d._id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate input', () => {
    const input = [
      mkDeck({ _id: 'c', order: 2 }),
      mkDeck({ _id: 'a', order: 0 }),
    ];
    const snapshot = input.map(d => d._id);
    filterAndSortDecks(input);
    expect(input.map(d => d._id)).toEqual(snapshot);
  });
});
