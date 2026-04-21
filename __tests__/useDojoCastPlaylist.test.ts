import { useDojoCastPlaylist } from '../src/hooks/useDojoCastPlaylist';
import { useQuery } from '@tanstack/react-query';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../src/services/dojoCastService', () => ({
  getDojoCastPlaylist: jest.fn(),
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;

describe('useDojoCastPlaylist', () => {
  beforeEach(() => {
    mockedUseQuery.mockReset();
    mockedUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('is disabled when dojoId is null', () => {
    useDojoCastPlaylist(null);
    const cfg = mockedUseQuery.mock.calls[0][0];
    expect(cfg.enabled).toBe(false);
    expect(cfg.queryKey).toEqual(['dojo-cast-playlist', null]);
  });

  it('is enabled with a dojoId and uses expected cache timings', () => {
    useDojoCastPlaylist('abc');
    const cfg = mockedUseQuery.mock.calls[0][0];
    expect(cfg.enabled).toBe(true);
    expect(cfg.queryKey).toEqual(['dojo-cast-playlist', 'abc']);
    expect(cfg.staleTime).toBe(60_000);
    expect(cfg.refetchInterval).toBe(5 * 60_000);
  });
});
