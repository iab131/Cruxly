
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // Create Users
    // Create Users
    const alex = await prisma.user.upsert({
        where: { id: 'user_alex' },
        update: {},
        create: {
            id: 'user_alex',
            username: 'alexh',
            bio: 'Route Setter | V3 Enthusiast',
            image: 'https://github.com/shadcn.png',
        },
    })

    const sarah = await prisma.user.upsert({
        where: { id: 'user_sarah' },
        update: {},
        create: {
            id: 'user_sarah',
            username: 'sarahj',
            bio: 'Local Crusher',
            image: 'https://github.com/shadcn.png',
        },
    })

    const mike = await prisma.user.upsert({
        where: { id: 'user_mike' },
        update: {},
        create: {
            id: 'user_mike',
            username: 'miker',
            bio: 'Crimps are life',
            image: 'https://github.com/shadcn.png',
        },
    })

    const chris = await prisma.user.upsert({
        where: { id: 'user_chris' },
        update: {},
        create: {
            id: 'user_chris',
            username: 'chriss',
            bio: 'Sport climbing mostly',
            image: 'https://github.com/shadcn.png',
        },
    })

    // Create Problems
    const problems = [
        {
            id: '1',
            name: 'The Slab',
            grade: 'V3',
            gym: 'Crux Climbing',
            image: 'https://images.unsplash.com/photo-1598555845686-25f00e2a8627?auto=format&fit=crop&q=80&w=800',
            type: 'Boulder',
            userId: alex.id,
            description: 'A technical slab problem requiring precise footwork and balance. Use the small crimp on the left to stabilize before making the move to the volume.',
        },
        {
            id: '2',
            name: 'Overhang Beast',
            grade: 'V5',
            gym: 'Vertical Limits',
            image: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&q=80&w=800',
            type: 'Boulder',
            userId: sarah.id,
            description: 'Steep and powerful capabilities.',
        },
        {
            id: '3',
            name: 'Crimpy Boi',
            grade: 'V4',
            gym: 'Crux Climbing',
            image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&q=80&w=800',
            type: 'Boulder',
            userId: mike.id,
            description: 'Finger strength test piece.',
        },
        {
            id: '4',
            name: 'Project X',
            grade: 'V7',
            gym: 'Boulders Inc',
            image: 'https://images.unsplash.com/photo-1578306071477-0c7da0d2e5b7?auto=format&fit=crop&q=80&w=800',
            type: 'Boulder',
            userId: alex.id,
            description: 'Mystery problem set by unknown.',
        },
        {
            id: '5',
            name: 'Pink One in Corner',
            grade: 'V2',
            gym: 'Gravity Vault',
            image: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&q=80&w=800',
            type: 'Boulder',
            userId: sarah.id,
            description: 'Classic corner problem.',
        },
        {
            id: '6',
            name: 'Cave Route',
            grade: '5.12b',
            gym: 'Rock Spot',
            image: 'https://images.unsplash.com/photo-1516592672327-c36ddab4cf2d?auto=format&fit=crop&q=80&w=800',
            type: 'Sport',
            userId: chris.id,
            description: 'Endurance fest through the roof.',
        },
    ]

    for (const p of problems) {
        await prisma.problem.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        })
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
