import "dotenv/config";
import { PrismaClient, Priority, Role, TaskStatus } from "@prisma/client";
import { hashPassword } from "../src/utils/hash.js";
const prisma = new PrismaClient();
async function main() {
    console.log("Starting database seed...");
    // PASSWORD
    const passwordHash = await hashPassword("Password123!");
    // USERS 
    const admin = await prisma.user.upsert({
        where: {
            email: "admin@dashboard.com",
        },
        update: {},
        create: {
            name: "Admin User",
            email: "admin@dashboard.com",
            passwordHash,
            role: Role.ADMIN,
        },
    });
    const pm1 = await prisma.user.upsert({
        where: {
            email: "pm1@dashboard.com",
        },
        update: {},
        create: {
            name: "Ravi Sharma",
            email: "pm1@dashboard.com",
            passwordHash,
            role: Role.PROJECT_MANAGER,
        },
    });
    const pm2 = await prisma.user.upsert({
        where: {
            email: "pm2@dashboard.com",
        },
        update: {},
        create: {
            name: "Priya Singh",
            email: "pm2@dashboard.com",
            passwordHash,
            role: Role.PROJECT_MANAGER,
        },
    });
    const dev1 = await prisma.user.upsert({
        where: {
            email: "dev1@dashboard.com",
        },
        update: {},
        create: {
            name: "Aman Verma",
            email: "dev1@dashboard.com",
            passwordHash,
            role: Role.DEVELOPER,
        },
    });
    const dev2 = await prisma.user.upsert({
        where: {
            email: "dev2@dashboard.com",
        },
        update: {},
        create: {
            name: "Neha Gupta",
            email: "dev2@dashboard.com",
            passwordHash,
            role: Role.DEVELOPER,
        },
    });
    const dev3 = await prisma.user.upsert({
        where: {
            email: "dev3@dashboard.com",
        },
        update: {},
        create: {
            name: "Arjun Mehta",
            email: "dev3@dashboard.com",
            passwordHash,
            role: Role.DEVELOPER,
        },
    });
    const dev4 = await prisma.user.upsert({
        where: {
            email: "dev4@dashboard.com",
        },
        update: {},
        create: {
            name: "Sneha Kapoor",
            email: "dev4@dashboard.com",
            passwordHash,
            role: Role.DEVELOPER,
        },
    });
    // CLIENTS
    const client1 = await prisma.client.create({
        data: {
            name: "Rahul Mehra",
            email: "rahul@techcorp.com",
            company: "TechCorp",
        },
    });
    const client2 = await prisma.client.create({
        data: {
            name: "Karan Malhotra",
            email: "karan@finserve.com",
            company: "FinServe",
        },
    });
    const client3 = await prisma.client.create({
        data: {
            name: "Anita Rao",
            email: "anita@healthplus.com",
            company: "HealthPlus",
        },
    });
    // PROJECTS
    const project1 = await prisma.project.create({
        data: {
            name: "TechCorp Website",
            description: "Corporate website redesign",
            clientId: client1.id,
            createdById: pm1.id,
        },
    });
    const project2 = await prisma.project.create({
        data: {
            name: "FinServe Dashboard",
            description: "Financial analytics dashboard",
            clientId: client2.id,
            createdById: pm1.id,
        },
    });
    const project3 = await prisma.project.create({
        data: {
            name: "HealthPlus Mobile App",
            description: "Healthcare mobile application",
            clientId: client3.id,
            createdById: pm2.id,
        },
    });
    // --------------------------------------------------
    // TASKS
    // --------------------------------------------------
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fiveDaysLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const tasks = await Promise.all([
        // PROJECT 1
        prisma.task.create({
            data: {
                projectId: project1.id,
                title: "Design homepage",
                description: "Create homepage UI",
                assignedDeveloperId: dev1.id,
                status: TaskStatus.IN_PROGRESS,
                priority: Priority.HIGH,
                dueDate: tomorrow,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project1.id,
                title: "Build navbar",
                description: "Implement responsive navigation",
                assignedDeveloperId: dev2.id,
                status: TaskStatus.TODO,
                priority: Priority.MEDIUM,
                dueDate: threeDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project1.id,
                title: "Implement authentication UI",
                description: "Create login and registration screens",
                assignedDeveloperId: dev3.id,
                status: TaskStatus.IN_REVIEW,
                priority: Priority.HIGH,
                dueDate: fiveDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project1.id,
                title: "Optimize images",
                description: "Compress and optimize website images",
                assignedDeveloperId: dev4.id,
                status: TaskStatus.DONE,
                priority: Priority.LOW,
                dueDate: yesterday,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project1.id,
                title: "Fix mobile layout",
                description: "Resolve mobile responsive issues",
                assignedDeveloperId: dev1.id,
                status: TaskStatus.TODO,
                priority: Priority.CRITICAL,
                dueDate: tomorrow,
            },
        }),
        // PROJECT 2
        prisma.task.create({
            data: {
                projectId: project2.id,
                title: "Create dashboard UI",
                description: "Build analytics dashboard",
                assignedDeveloperId: dev2.id,
                status: TaskStatus.IN_PROGRESS,
                priority: Priority.HIGH,
                dueDate: threeDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project2.id,
                title: "Create revenue chart",
                description: "Implement revenue visualization",
                assignedDeveloperId: dev3.id,
                status: TaskStatus.TODO,
                priority: Priority.MEDIUM,
                dueDate: fiveDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project2.id,
                title: "Implement export",
                description: "Export reports to CSV",
                assignedDeveloperId: dev4.id,
                status: TaskStatus.TODO,
                priority: Priority.LOW,
                dueDate: sevenDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project2.id,
                title: "Fix API integration",
                description: "Connect dashboard to backend",
                assignedDeveloperId: dev1.id,
                status: TaskStatus.OVERDUE,
                priority: Priority.CRITICAL,
                dueDate: yesterday,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project2.id,
                title: "Add filtering",
                description: "Add dashboard filtering options",
                assignedDeveloperId: dev2.id,
                status: TaskStatus.IN_REVIEW,
                priority: Priority.HIGH,
                dueDate: tomorrow,
            },
        }),
        // PROJECT 3
        prisma.task.create({
            data: {
                projectId: project3.id,
                title: "Create mobile wireframes",
                description: "Prepare application wireframes",
                assignedDeveloperId: dev3.id,
                status: TaskStatus.DONE,
                priority: Priority.MEDIUM,
                dueDate: yesterday,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project3.id,
                title: "Build appointment screen",
                description: "Create appointment booking screen",
                assignedDeveloperId: dev4.id,
                status: TaskStatus.IN_PROGRESS,
                priority: Priority.HIGH,
                dueDate: threeDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project3.id,
                title: "Add notifications",
                description: "Implement push notification UI",
                assignedDeveloperId: dev1.id,
                status: TaskStatus.TODO,
                priority: Priority.MEDIUM,
                dueDate: fiveDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project3.id,
                title: "Implement profile",
                description: "Create patient profile screen",
                assignedDeveloperId: dev2.id,
                status: TaskStatus.TODO,
                priority: Priority.LOW,
                dueDate: sevenDaysLater,
            },
        }),
        prisma.task.create({
            data: {
                projectId: project3.id,
                title: "Fix appointment bug",
                description: "Resolve appointment scheduling issue",
                assignedDeveloperId: dev3.id,
                status: TaskStatus.OVERDUE,
                priority: Priority.CRITICAL,
                dueDate: yesterday,
            },
        }),
    ]);
    // --------------------------------------------------
    // ACTIVITY LOGS
    // --------------------------------------------------
    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        await prisma.activityLog.create({
            data: {
                taskId: task.id,
                projectId: task.projectId,
                userId: i % 2 === 0
                    ? pm1.id
                    : pm2.id,
                fromStatus: null,
                toStatus: task.status,
                createdAt: new Date(now.getTime() - i * 60 * 60 * 1000),
            },
        });
    }
    // NOTIFICATIONS
    await prisma.notification.createMany({
        data: [
            {
                userId: dev1.id,
                message: "You have been assigned a new task: Design homepage",
                taskId: tasks[0].id,
                projectId: project1.id,
            },
            {
                userId: dev2.id,
                message: "You have been assigned a new task: Build navbar",
                taskId: tasks[1].id,
                projectId: project1.id,
            },
            {
                userId: pm1.id,
                message: "Task moved to In Review: Implement authentication UI",
                taskId: tasks[2].id,
                projectId: project1.id,
            },
            {
                userId: pm2.id,
                message: "Task moved to In Review",
                taskId: tasks[9].id,
                projectId: project2.id,
            },
        ],
    });
    console.log("");
    console.log("Seed completed successfully!");
    console.log("");
    console.log("Users:");
    console.log("Admin: admin@dashboard.com");
    console.log("PM 1: pm1@dashboard.com");
    console.log("PM 2: pm2@dashboard.com");
    console.log("Dev 1: dev1@dashboard.com");
    console.log("Dev 2: dev2@dashboard.com");
    console.log("Dev 3: dev3@dashboard.com");
    console.log("Dev 4: dev4@dashboard.com");
    console.log("");
    console.log("Password for all users: Password123!");
    console.log("");
    console.log(`Created ${tasks.length} tasks.`);
}
main()
    .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map