import { prisma } from "../config/database.js";

export const getRecentActivities = async (
  userId: number,
  role: string
) => {
  let activities;

  if (role === "ADMIN") {
    activities = await prisma.activityLog.findMany({
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  } else if (role === "PROJECT_MANAGER") {
    activities = await prisma.activityLog.findMany({
      where: {
        project: {
          createdById: userId,
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  } else if (role === "DEVELOPER") {
    activities = await prisma.activityLog.findMany({
      where: {
        task: {
          assignedDeveloperId: userId,
        },
      },
      take: 20,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
    });
  } else {
    throw new Error("Invalid user role");
  }

  return activities;
};