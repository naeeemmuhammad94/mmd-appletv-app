
// Assets
// We use require here to resolve the local assets.
// Note: In a real app, these might come from an API or a more robust asset manager.

import { ImageSourcePropType } from 'react-native';

const ProgramImages = [
    require('../../assets/dummy/programs/1.png'),
    require('../../assets/dummy/programs/2.png'),
    require('../../assets/dummy/programs/3.png'),
    require('../../assets/dummy/programs/4.png'),
];

const TrainingAreaImages = [
    require('../../assets/dummy/training-area/1.png'),
    require('../../assets/dummy/training-area/2.png'),
    require('../../assets/dummy/training-area/3.png'),
    require('../../assets/dummy/training-area/4.png'),
    require('../../assets/dummy/training-area/5.png'),
    require('../../assets/dummy/training-area/6.png'),
];

const VIMEO_VIDEO_URL = 'https://player.vimeo.com/video/329399309';

const CATEGORIES = [
    'Karate', 'Judo', 'Kung Fu', 'MMA',
    'BJJ', 'Taekwondo', 'Boxing', 'Wrestling',
    'Muay Thai', 'Self Defense',
];

const SUBCATEGORIES = [
    'Forms', 'Throws', 'Strikes', 'Combos',
    'Ground Game', 'Kicks', 'Drills', 'Takedowns',
    'Clinch Work', 'Techniques',
];

export const PROGRAMS_DATA = Array.from({ length: 10 }).map((_, index) => ({
    id: `prog-${index + 1}`,
    title: [
        'Karate Fundamentals', 'Judo Basics', 'Kung Fu Master', 'MMA Striking',
        'BJJ Grappling', 'Taekwondo Kicks', 'Boxing Drills', 'Wrestling Takedowns',
        'Muay Thai Clinch', 'Self Defense'
    ][index],
    progress: [61, 45, 10, 5, 80, 0, 0, 100, 25, 14][index],
    image: ProgramImages[index % ProgramImages.length],
    videoUrl: VIMEO_VIDEO_URL,
    category: CATEGORIES[index],
    subcategory: SUBCATEGORIES[index],
}));

export const TRAINING_AREA_DATA = Array.from({ length: 10 }).map((_, index) => ({
    id: `train-${index + 1}`,
    title: [
        'Weapons', 'Conditioning', 'General', 'Structure & Posture',
        'Floor Walking', 'Temple Exercises', 'Sparring', 'Stretching',
        'Meditation', 'History'
    ][index],
    image: TrainingAreaImages[index % TrainingAreaImages.length],
}));

export const RECENTLY_WATCHED_DATA = Array.from({ length: 10 }).map((_, index) => ({
    id: `recent-${index + 1}`,
    title: PROGRAMS_DATA[index].title,
    progress: PROGRAMS_DATA[index].progress,
    image: PROGRAMS_DATA[index].image,
}));

// ── Lesson tier data for Program Detail page ──

export interface Lesson {
    id: string;
    title?: string;
    duration?: string;
    image?: ImageSourcePropType;
}

export interface LessonTier {
    name: string;
    description: string;
    locked: boolean;
    lockMessage?: string;
    lessons: Lesson[];
}

export interface ProgramLessons {
    category: string;
    subcategory: string;
    tiers: LessonTier[];
}

const BEGINNER_LESSONS: Lesson[] = [
    { id: 'l1', title: 'Basic Stances', duration: '4:12', image: ProgramImages[0] },
    { id: 'l2', title: 'Punching Techniques', duration: '5:20', image: ProgramImages[1] },
    { id: 'l3', title: 'Heian Shodan', duration: '6:05', image: ProgramImages[2] },
    { id: 'l4', title: 'Kicking Drills', duration: '3:45', image: ProgramImages[3] },
];

const LOCKED_LESSONS: Lesson[] = [
    { id: 'l5' }, { id: 'l6' }, { id: 'l7' }, { id: 'l8' },
];

const makeTiers = (category: string, subcategory: string): ProgramLessons => ({
    category,
    subcategory,
    tiers: [
        {
            name: 'Beginner',
            description: 'Foundation movements and basic karate',
            locked: false,
            lessons: BEGINNER_LESSONS,
        },
        {
            name: 'Intermediate',
            description: 'Refinement, transitions, timing',
            locked: true,
            lockMessage: 'Complete Beginner level',
            lessons: LOCKED_LESSONS,
        },
        {
            name: 'Advanced',
            description: 'Complex forms and mastery sequences',
            locked: true,
            lockMessage: 'Complete Beginner level',
            lessons: LOCKED_LESSONS,
        },
    ],
});

// Build a map of programId → ProgramLessons (all programs share the same tier template)
export const PROGRAM_LESSONS_DATA: Record<string, ProgramLessons> = Object.fromEntries(
    PROGRAMS_DATA.map((p) => [p.id, makeTiers(p.category, p.subcategory)])
);
