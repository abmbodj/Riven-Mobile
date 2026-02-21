export const GARDEN_STAGES = [
    { days: 0, name: 'Barren Plot', icon: '🏜️', description: 'Your garden awaits its first seeds...' },
    { days: 1, name: 'Seeded Soil', icon: '🌱', description: 'The first seeds have been planted!' },
    { days: 3, name: 'Tiny Sprout', icon: '🌿', description: 'A small sprout peeks through the soil.' },
    { days: 7, name: 'Seedling', icon: '🪴', description: 'Your seedling is growing stronger.' },
    { days: 14, name: 'Young Plant', icon: '🌳', description: 'A young plant reaches for the sun.' },
    { days: 30, name: 'Budding Garden', icon: '🌸', description: 'Buds are forming on your plant!' },
    { days: 60, name: 'Blooming Garden', icon: '🌺', description: 'Your garden is in full bloom!' },
    { days: 100, name: 'Flourishing Oasis', icon: '🌴', description: 'An oasis of knowledge and growth.' },
    { days: 200, name: 'Enchanted Grove', icon: '🍀', description: 'A magical grove of wisdom.' },
    { days: 365, name: 'Ancient Forest', icon: '🌲', description: 'An ancient forest of learning.' },
    { days: 1000, name: 'Celestial Eden', icon: '✨', description: 'You have achieved paradise!' },
];

export function getGardenStage(streakDays: number) {
    return [...GARDEN_STAGES].reverse().find((s) => streakDays >= s.days) || GARDEN_STAGES[0];
}
