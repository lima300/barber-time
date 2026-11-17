"use server";

import { db } from "../_lib/prisma";

interface GetBookingsParams {
  barbershopId: string;
  // Day boundaries are computed on the client so they match the user's timezone
  startDate: Date;
  endDate: Date;
}

export const getBookings = async ({
  barbershopId,
  startDate,
  endDate,
}: GetBookingsParams) => {
  return db.booking.findMany({
    where: {
      service: { barbershopId },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { id: true, date: true },
  });
};
