import type { Vessel, Voyage } from "@prisma/client";
import type { NextApiHandler, NextApiResponse, NextApiRequest } from "next";
import { prisma } from "~/server/db";

export type ReturnType = (Voyage & { vessel: Vessel })[];

/**
 * @swagger
 * /api/voyage/delete/{id}:
 *   delete:
 *     tags:
 *       - Voyage
 *     summary: Deletes a voyage
 *     description: Deletes a voyage by its ID. Note that this operation randomly fails to demonstrate error handling.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the voyage to delete.
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: The voyage was successfully deleted.
 *       400:
 *         description: Failed to delete the voyage due to a random error.
 *       404:
 *         description: The voyage with the specified ID was not found.
 *       405:
 *         description: Method Not Allowed. Only DELETE method is supported on this endpoint.
 */
const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<undefined>,
) => {
  if (req.method === "DELETE") {
    // randomly fail the delete request
    const maybe = Math.round(Math.random());
    if (maybe) {
      res.status(400).end();
      return;
    }
    const deletedVoyage = await prisma.voyage.delete({
      where: {
        id: req.query.id as string,
      },
    });

    deletedVoyage ? res.status(204) : res.status(404);
    res.end();
    return;
  }

  res.status(405).end();
};

export default handler;
