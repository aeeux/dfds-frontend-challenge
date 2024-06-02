import type { NextApiHandler, NextApiResponse, NextApiRequest } from "next";
import { prisma } from "~/server/db";

/**
 * @swagger
 * /api/voyage/create:
 *   post:
 *     tags: [Voyage]
 *     summary: Creates a new voyage
 *     description: Creates a new voyage with specified details including departure, arrival, ports, vessel, and unit types.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - departure
 *               - arrival
 *               - portOfLoading
 *               - portOfDischarge
 *               - vessel
 *               - unitTypes
 *             properties:
 *               departure:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled departure date and time.
 *               arrival:
 *                 type: string
 *                 format: date-time
 *                 description: Scheduled arrival date and time.
 *               portOfLoading:
 *                 type: string
 *                 description: The port where the voyage starts.
 *               portOfDischarge:
 *                 type: string
 *                 description: The port where the voyage ends.
 *               vessel:
 *                 type: string
 *                 description: ID of the vessel used for the voyage.
 *               unitTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of unit type IDs associated with the voyage.
 *     responses:
 *       201:
 *         description: Voyage created successfully.
 *       500:
 *         description: Internal server error, indicates failure to create the voyage.
 *       405:
 *         description: Method not allowed, indicates that the request method is not supported by the endpoint.
 */
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse,
) => {
  if (req.method === "POST") {
    const {
      departure,
      arrival,
      portOfLoading,
      portOfDischarge,
      vessel,
      unitTypes,
    } = req.body;

    try {
      const createdVoyage = await prisma.voyage.create({
        data: {
          scheduledDeparture: departure,
          scheduledArrival: arrival,
          portOfLoading,
          portOfDischarge,
          vesselId: vessel,
          unitTypes: {
            connect: unitTypes.map((id: string) => ({ id })),
          },
        },
      });

      res.status(201).json(createdVoyage); // Return the created voyage as JSON -> so we can act upon successful requests in the UI - used by toast, to refresh voyage list & to close sheet component
    } catch (error) {
      console.error('Error creating voyage:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
};

export default handler;
