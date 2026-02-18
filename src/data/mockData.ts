import { StudyContentItem, StudyCategory } from '../types/study';

export const MOCK_PROGRAMS: StudyContentItem[] = [
    {
        _id: 'mock-1',
        title: 'Karate Basics',
        contentLink: 'https://images.unsplash.com/photo-1544367563-12123d81a13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        category: { _id: 'cat-1', dojo: 'd1', name: 'Karate', image: 'https://images.unsplash.com/photo-1544367563-12123d81a13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        order: 1,
        tags: [{ _id: 't1', name: 'Beginner', type: 'level' }],
        event: { _id: 'evt-1', title: 'Karate Basics', imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d81a13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' }
    },
    {
        _id: 'mock-2',
        title: 'Judo Fundamentals',
        contentLink: 'https://images.unsplash.com/photo-1518619745898-93e765966dcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        category: { _id: 'cat-2', dojo: 'd1', name: 'Judo', image: 'https://images.unsplash.com/photo-1518619745898-93e765966dcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        order: 2,
        tags: [{ _id: 't2', name: 'Advanced', type: 'level' }],
    },
    {
        _id: 'mock-3',
        title: 'Kung Fu Forms',
        contentLink: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        category: { _id: 'cat-3', dojo: 'd1', name: 'Kung Fu', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        order: 3,
        tags: [{ _id: 't3', name: 'Intermediate', type: 'level' }],
    },
    {
        _id: 'mock-4',
        title: 'MMA Training',
        contentLink: 'https://images.unsplash.com/photo-1509563268479-0f004cf3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        category: { _id: 'cat-4', dojo: 'd1', name: 'MMA', image: 'https://images.unsplash.com/photo-1509563268479-0f004cf3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        order: 4,
        tags: [{ _id: 't4', name: 'Advanced', type: 'level' }],
    },
    {
        _id: 'mock-5',
        title: 'Fitness Conditioning',
        contentLink: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        category: { _id: 'cat-5', dojo: 'd1', name: 'Fitness', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
        order: 5,
        tags: [{ _id: 't5', name: 'All Levels', type: 'level' }],
    },
];

export const MOCK_CATEGORIES: StudyCategory[] = [
    { _id: 'cat-1', dojo: 'd1', name: 'Karate', image: 'https://images.unsplash.com/photo-1544367563-12123d81a13d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { _id: 'cat-2', dojo: 'd1', name: 'Judo', image: 'https://images.unsplash.com/photo-1518619745898-93e765966dcd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { _id: 'cat-3', dojo: 'd1', name: 'Kung Fu', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { _id: 'cat-4', dojo: 'd1', name: 'MMA', image: 'https://images.unsplash.com/photo-1509563268479-0f004cf3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
    { _id: 'cat-5', dojo: 'd1', name: 'Fitness', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80' },
];
