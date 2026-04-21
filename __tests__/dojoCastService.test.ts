import { getDojoCastPlaylist } from '../src/services/dojoCastService';
import axiosInstance from '../src/services/axios';

jest.mock('../src/services/axios', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockedGet = (axiosInstance as unknown as { get: jest.Mock }).get;

describe('getDojoCastPlaylist', () => {
  beforeEach(() => {
    mockedGet.mockReset();
  });

  it('hits /dojo-cast/playlist/:dojoId and returns the typed body', async () => {
    const body = {
      success: true,
      error: false,
      data: {
        decks: [],
        config: {
          dojo: 'abc',
          defaultSlideDuration: 8,
          transitionType: 'fade',
          transitionDuration: 500,
          loopPlaylist: true,
          shuffleOrder: false,
          showClock: false,
          scheduleStart: null,
          scheduleEnd: null,
        },
        lastUpdatedAt: '2026-04-21T00:00:00.000Z',
        nextSyncAt: '2026-04-21T00:30:00.000Z',
      },
    };
    mockedGet.mockResolvedValueOnce({ data: body });

    const result = await getDojoCastPlaylist('abc');

    expect(mockedGet).toHaveBeenCalledWith('/dojo-cast/playlist/abc');
    expect(result).toEqual(body);
  });
});
