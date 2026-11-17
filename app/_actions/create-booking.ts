"use server";

import { isPast } from "date-fns";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "../_lib/auth";
import { db } from "../_lib/prisma";

interface CreateBookingParams {
  serviceId: string;
  date: Date;
}

export const createBooking = async ({
  serviceId,
  date,
}: CreateBookingParams) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Usuário não autenticado");
  }

  if (isPast(date)) {
    throw new Error("Não é possível agendar em um horário passado");
  }

  const service = await db.barbershopService.findUnique({
    where: { id: serviceId },
  });
  if (!service) {
    throw new Error("Serviço não encontrado");
  }

  const conflictingBooking = await db.booking.findFirst({
    where: {
      date,
      service: { barbershopId: service.barbershopId },
    },
  });
  if (conflictingBooking) {
    throw new Error("Horário indisponível");
  }

  await db.booking.create({
    data: { serviceId, date, userId: session.user.id },
  });

  revalidatePath("/barbershops/[id]", "page");
  revalidatePath("/bookings");
  revalidatePath("/");
};
