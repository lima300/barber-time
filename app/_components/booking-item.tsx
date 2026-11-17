"use client";
import { format, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { deleteBooking } from "../_actions/delete-booking";
import { UserBooking } from "../_data/get-user-bookings";
import BookingSummary from "./booking-summary";
import PhoneItem from "./phone-item";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

interface BookingItemProps {
  booking: UserBooking;
}

const BookingItem = ({ booking }: BookingItemProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { service } = booking;
  const { barbershop } = service;
  const isConfirmed = isFuture(booking.date);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await deleteBooking(booking.id);
      setIsCancelDialogOpen(false);
      setIsSheetOpen(false);
      toast.success("Reserva cancelada com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao cancelar reserva. Tente novamente.");
    } finally {
      setIsCancelling(false);
    }
  };

  const statusBadge = (
    <Badge className="w-fit" variant={isConfirmed ? "default" : "secondary"}>
      {isConfirmed ? "Confirmado" : "Finalizado"}
    </Badge>
  );

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger className="w-full min-w-[90%] text-left">
        <Card className="min-w-[90%]">
          <CardContent className="flex justify-between p-0">
            <div className="flex flex-col gap-2 py-5 pl-5">
              {statusBadge}
              <h3 className="font-semibold">{service.name}</h3>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={barbershop.imageUrl} />
                </Avatar>
                <p className="text-sm">{barbershop.name}</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center border-l-2 border-solid px-5">
              <p className="text-sm capitalize">
                {format(booking.date, "MMMM", { locale: ptBR })}
              </p>
              <p className="text-2xl">{format(booking.date, "dd")}</p>
              <p className="text-sm">{format(booking.date, "HH:mm")}</p>
            </div>
          </CardContent>
        </Card>
      </SheetTrigger>

      <SheetContent className="w-[85%] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Informações da reserva</SheetTitle>
        </SheetHeader>

        <div className="relative mt-6 flex h-[180px] w-full items-end">
          <Image
            src="/map.png"
            alt={`Mapa da barbearia ${barbershop.name}`}
            fill
            className="rounded-xl object-cover"
          />

          <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
            <CardContent className="flex items-center gap-3 px-5 py-3">
              <Avatar>
                <AvatarImage src={barbershop.imageUrl} />
              </Avatar>
              <div>
                <h3 className="font-bold">{barbershop.name}</h3>
                <p className="text-xs">{barbershop.address}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          {statusBadge}

          <div className="mb-3 mt-6">
            <BookingSummary
              service={service}
              barbershop={barbershop}
              selectedDate={booking.date}
            />
          </div>

          <div className="space-y-3">
            {barbershop.phones.map((phone) => (
              <PhoneItem key={phone} phone={phone} />
            ))}
          </div>
        </div>

        <SheetFooter className="mt-6">
          <div className="flex w-full items-center gap-3">
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Voltar
              </Button>
            </SheetClose>

            {isConfirmed && (
              <Dialog
                open={isCancelDialogOpen}
                onOpenChange={setIsCancelDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    Cancelar reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle>Você deseja cancelar sua reserva?</DialogTitle>
                    <DialogDescription>
                      Ao cancelar, você perderá sua reserva e não poderá
                      recuperá-la. Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleCancelBooking}
                      disabled={isCancelling}
                    >
                      {isCancelling ? "Cancelando..." : "Confirmar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default BookingItem;
