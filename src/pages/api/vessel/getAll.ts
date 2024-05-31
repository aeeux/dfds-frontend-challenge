import type { NextApiHandler, NextApiResponse } from "next";
import { prisma } from "~/server/db";

// Assuming the type for a single vessel object.
type Vessel = {
    id: string; // or number, depending on your database schema
    name: string;
  };

export type VesselsType = ({ value: string, label: string })[];

/**
 * @swagger
 * /api/vessel/getAll:
 *   get:
 *     tags:
 *       - Vessel
 *     summary: Retrieves all vessels
 *     description: Returns a list of all vessels formatted for dropdown selection, with each vessel's name as the label and its id as the value.
 *     responses:
 *       200:
 *         description: A list of vessels formatted for dropdown use.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                     description: The ID of the vessel.
 *                   label:
 *                     type: string
 *                     description: The name of the vessel.
 *       500:
 *         description: Internal Server Error - if there's an issue fetching the vessels.
 */
const handler: NextApiHandler = async (_, res: NextApiResponse<VesselsType>) => {
    const allVessel: Vessel[] = await prisma.vessel.findMany();
    const vessels = allVessel.map(vessel => ({ label: vessel.name, value: vessel.id }))

    res.status(200).json(vessels);
};

export default handler;
