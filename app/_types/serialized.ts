import { BarbershopService } from "@prisma/client";

// Prisma's Decimal can't be passed to client components, so price becomes a number
export type SerializedBarbershopService = Omit<BarbershopService, "price"> & {
  price: number;
};
