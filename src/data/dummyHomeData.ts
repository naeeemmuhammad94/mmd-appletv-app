
// Assets
// We use require here to resolve the local assets.
// Note: In a real app, these might come from an API or a more robust asset manager.

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

export const PROGRAMS_DATA = Array.from({ length: 10 }).map((_, index) => ({
    id: `prog-${index + 1}`,
    title: [
        'Karate Fundamentals', 'Judo Basics', 'Kung Fu Master', 'MMA Striking',
        'BJJ Grappling', 'Taekwondo Kicks', 'Boxing Drills', 'Wrestling Takedowns',
        'Muay Thai Clinch', 'Self Defense'
    ][index],
    progress: [61, 45, 10, 5, 80, 0, 0, 100, 25, 14][index],
    image: ProgramImages[index % ProgramImages.length],
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
