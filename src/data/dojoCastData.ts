import { DojoProgram, DojoSlide } from '../types/dojo';

export const DOJO_PROGRAMS: DojoProgram[] = [
  {
    id: 'tigers',
    title: "Today's Class \u2014 Tigers",
    subtitle: 'Focus & Discipline',
    level: 'Beginner Karate',
    slideCount: 10,
    week: 3,
    isActive: true,
  },
  {
    id: 'dragons',
    title: "Today's Class \u2014 Dragons",
    subtitle: 'Respect & Confidence',
    level: 'Intermediate Karate',
    slideCount: 12,
    week: 6,
    isActive: false,
  },
  {
    id: 'teens-adults',
    title: "Today's Class \u2014 Teens & Adults",
    subtitle: 'Self-Defense Skills',
    level: 'All Levels',
    slideCount: 8,
    week: 5,
    isActive: false,
  },
  {
    id: 'advanced',
    title: "Today's Class \u2014 Advanced",
    subtitle: 'Speed & Precision',
    level: 'Black Belt Training',
    slideCount: 15,
    week: 10,
    isActive: false,
  },
  {
    id: 'advanced-2',
    title: "Today's Class \u2014 Advanced",
    subtitle: 'Speed & Precision',
    level: 'Black Belt Training',
    slideCount: 15,
    week: 10,
    isActive: false,
  },
];

export const DUMMY_SLIDES: DojoSlide[] = [
  {
    id: 'slide-1',
    imageUrl:
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1920&q=80',
    title: 'FOCUS & DISCIPLINE BUILD CHAMPIONS',
    subtitle: "Today's Class \u2014 Tigers",
  },
  {
    id: 'slide-2',
    imageUrl:
      'https://images.unsplash.com/photo-1564415315949-7a0c4c73aab4?w=1920&q=80',
    title: 'RESPECT STARTS ON THE MAT',
    subtitle: 'Core Values',
  },
  {
    id: 'slide-3',
    imageUrl:
      'https://images.unsplash.com/photo-1514050566906-8d077bae7046?w=1920&q=80',
    title: 'TECHNIQUE OVER STRENGTH',
    subtitle: 'Kata Practice',
  },
  {
    id: 'slide-4',
    imageUrl:
      'https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=1920&q=80',
    title: 'TRAIN HARD, STAY HUMBLE',
    subtitle: 'Belt Progression',
  },
];

export const DOJO_ACCOUNT = {
  name: 'MMD Dojo',
  displayName: 'Dojo Display',
};
