import { resolveStudentThumbnail } from '../../src/data/studentThumbnails';

describe('resolveStudentThumbnail', () => {
  describe('null / undefined / empty input', () => {
    it.each([[undefined], [null], ['']])('returns undefined for %s', input => {
      expect(
        resolveStudentThumbnail(input as string | null | undefined),
      ).toBeUndefined();
    });
  });

  describe('exact name matching (one alias per program)', () => {
    it.each([
      'ATA',
      'Tigers',
      'Karate',
      'BJJ',
      'TKD',
      'kravmaga',
      'Tai Chi',
      'leadership',
      'legacy',
    ])('finds an asset for %s', name => {
      expect(resolveStudentThumbnail(name)).toBeDefined();
    });
  });

  describe('case insensitivity', () => {
    it('matches different cases to the same asset', () => {
      const a = resolveStudentThumbnail('Tai Chi');
      const b = resolveStudentThumbnail('tai chi');
      const c = resolveStudentThumbnail('TAI CHI');
      expect(a).toBeDefined();
      expect(a).toBe(b);
      expect(a).toBe(c);
    });
  });

  describe('aliases that share an asset', () => {
    it('all three Tigers aliases resolve to the same asset', () => {
      const a = resolveStudentThumbnail('ATA Tigers');
      const b = resolveStudentThumbnail('Tiny Tigers');
      const c = resolveStudentThumbnail('Tigers');
      expect(a).toBeDefined();
      expect(a).toBe(b);
      expect(b).toBe(c);
    });

    it('all 7 Jiu Jitsu aliases resolve to the same asset', () => {
      const aliases = [
        'Jiu Jitsu',
        'JuJitsu',
        'BJJ',
        'Brazilian Jiu Jitsu',
        'Brazilian Ju Jitsu',
        'Judo',
        'Wrestling',
      ];
      const resolved = aliases.map(resolveStudentThumbnail);
      expect(resolved[0]).toBeDefined();
      for (const r of resolved) expect(r).toBe(resolved[0]);
    });

    it("all three Dragons aliases (including Lil' apostrophe) resolve to the same asset", () => {
      const aliases = ['Dragons', 'Lil Dragons', "Lil' Dragons"];
      const resolved = aliases.map(resolveStudentThumbnail);
      expect(resolved[0]).toBeDefined();
      for (const r of resolved) expect(r).toBe(resolved[0]);
    });

    it('Karate / Adult / Teen share an asset', () => {
      const a = resolveStudentThumbnail('Karate');
      const b = resolveStudentThumbnail('Adult');
      const c = resolveStudentThumbnail('Teen');
      expect(a).toBeDefined();
      expect(a).toBe(b);
      expect(b).toBe(c);
    });

    it('Warrior / Boxing / Muay Thai / Kenpo / Kempo share an asset', () => {
      const aliases = ['Warrior', 'Boxing', 'Muay Thai', 'Kenpo', 'Kempo'];
      const resolved = aliases.map(resolveStudentThumbnail);
      expect(resolved[0]).toBeDefined();
      for (const r of resolved) expect(r).toBe(resolved[0]);
    });
  });

  describe('whitespace normalization', () => {
    it.each([
      ['Tai Chi'], //
      [' Tai Chi'], // leading
      ['Tai Chi '], // trailing
      ['Tai  Chi'], // double internal
      [' Tai   Chi '], // mixed
    ])('treats %s as Tai Chi', input => {
      const expected = resolveStudentThumbnail('Tai Chi');
      expect(resolveStudentThumbnail(input)).toBe(expected);
    });
  });

  describe('training-area names (single alias each)', () => {
    it.each([
      ['Board Breaking'],
      ['Chi Building'],
      ['Conditioning'],
      ['Floor Walking'],
      ['Forms'],
      ['General'],
      ['Meditation'],
      ['Sparring'],
      ['Temple Exercises'],
      ['Weapons'],
    ])('finds an asset for training-area %s', name => {
      expect(resolveStudentThumbnail(name)).toBeDefined();
    });

    it('matches case-insensitively (sparring / SPARRING / Sparring)', () => {
      const a = resolveStudentThumbnail('Sparring');
      const b = resolveStudentThumbnail('SPARRING');
      const c = resolveStudentThumbnail('sparring');
      expect(a).toBeDefined();
      expect(a).toBe(b);
      expect(b).toBe(c);
    });
  });

  describe('unmapped names', () => {
    it.each([
      ['Some Unknown Program'],
      ['Random Stuff'],
      ['Aikido'],
      ['Capoeira'],
    ])('returns undefined for %s', name => {
      expect(resolveStudentThumbnail(name)).toBeUndefined();
    });
  });
});
