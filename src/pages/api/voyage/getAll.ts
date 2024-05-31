import type { Vessel, Voyage, UnitType } from "@prisma/client";
import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

export type ReturnType = (Voyage & { vessel: Vessel } & {
  unitTypes: UnitType[];
})[];

/**
 * @swagger
 * /api/voyage/getAll:
 *   get:
 *     tags:
 *       - Voyage
 *     summary: Retrieves all voyages
 *     description: Returns a list of all voyages, including details about the vessel and unit types associated with each voyage.
 *     responses:
 *       200:
 *         description: A list of voyages with their associated vessel and unit types.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   portOfLoading:
 *                     type: string
 *                   portOfDischarge:
 *                     type: string
 *                   vesselId:
 *                     type: string
 *                   scheduledDeparture:
 *                     type: string
 *                     format: date-time
 *                   scheduledArrival:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   vessel:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                   unitTypes:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         defaultLength:
 *                           type: number
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 */
const handler: NextApiHandler = async (_, res: NextApiResponse<ReturnType>) => {
  const voyages = await prisma.voyage.findMany({
    include: {
      vessel: {},
      unitTypes: {},
    },
  });

  res.status(200).json(voyages);
};

export default handler;
