import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../_lib/auth";
import { db } from "../_lib/prisma";

const bookingInclude = {
  service: { include: { barbershop: true } },
} satisfies Prisma.BookingInclude;

type BookingWithService = Prisma.BookingGetPayload<{
  include: typeof bookingInclude;
}>;

// Decimal isn't serializable to client components, so price becomes a number
const serializeBooking = (booking: BookingWithService) => ({
  ...booking,
  service: { ...booking.service, price: Number(booking.service.price) },
});

export type UserBooking = ReturnType<typeof serializeBooking>;

const getUserBookings = async (
  dateFilter: Prisma.DateTimeFilter,
  order: Prisma.SortOrder,
): Promise<UserBooking[]> => {
  const session = await getServerSession(authOptions);
  if (!session?.user) return [];

  const bookings = await db.booking.findMany({
    where: { userId: session.user.id, date: dateFilter },
    include: bookingInclude,
    orderBy: { date: order },
  });
  return bookings.map(serializeBooking);
};

export const getConfirmedBookings = () =>
  getUserBookings({ gte: new Date() }, "asc");

export const getConcludedBookings = () =>
  getUserBookings({ lt: new Date() }, "desc");
