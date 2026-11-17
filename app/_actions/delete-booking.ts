"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "../_lib/auth";
import { db } from "../_lib/prisma";

export const deleteBooking = async (bookingId: string) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  const { count } = await db.booking.deleteMany({
    where: { id: bookingId, userId: session.user.id },
  });
  if (count === 0) {
    throw new Error("Reserva não encontrada");
  }

  revalidatePath("/bookings");
  revalidatePath("/");
};
