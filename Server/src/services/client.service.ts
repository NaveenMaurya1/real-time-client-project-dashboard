import { prisma } from "../config/database.js";

export const getClients = async () => {
  return prisma.client.findMany({
    orderBy: {
      name: "asc",
    },
  });
};