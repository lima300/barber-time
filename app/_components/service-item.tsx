"use client";
import { Barbershop } from "@prisma/client";
import { endOfDay, isPast, isToday, set, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createBooking } from "../_actions/create-booking";
import { getBookings } from "../_actions/get-bookings";
import { SerializedBarbershopService } from "../_types/serialized";
import BookingSummary from "./booking-summary";
import SignInDialog from "./sign-in-dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface ServiceItemProps {
  service: SerializedBarbershopService;
  barbershop: Pick<Barbershop, "name">;
}

const TIME_LIST = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const parseTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return { hours, minutes };
};

interface GetTimeListParams {
  bookedDates: Date[];
  selectedDay: Date;
}

const getTimeList = ({ bookedDates, selectedDay }: GetTimeListParams) => {
  return TIME_LIST.filter((time) => {
    const { hours, minutes } = parseTime(time);

    const timeIsOnThePast = isPast(
      set(new Date(), { hours, minutes, seconds: 0 }),
    );
    if (isToday(selectedDay) && timeIsOnThePast) {
      return false;
    }

    const isBooked = bookedDates.some(
      (date) => date.getHours() === hours && date.getMinutes() === minutes,
    );
    return !isBooked;
  });
};

const ServiceItem = ({ service, barbershop }: ServiceItemProps) => {
  const { data } = useSession();
  const router = useRouter();
  const [signInDialogIsOpen, setSignInDialogIsOpen] = useState(false);
  const [bookingSheetIsOpen, setBookingSheetIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(
    undefined,
  );
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedDay) return;
    let ignore = false;

    const fetchBookings = async () => {
      setIsLoadingTimes(true);
      try {
        const bookings = await getBookings({
          barbershopId: service.barbershopId,
          startDate: startOfDay(selectedDay),
          endDate: endOfDay(selectedDay),
        });
        if (!ignore) {
          setBookedDates(bookings.map((booking) => new Date(booking.date)));
        }
      } catch (error) {
        console.error(error);
        if (!ignore) toast.error("Erro ao carregar horários disponíveis.");
      } finally {
        if (!ignore) setIsLoadingTimes(false);
      }
    };
    fetchBookings();

    return () => {
      ignore = true;
    };
  }, [selectedDay, service.barbershopId]);

  const timeList = useMemo(() => {
    if (!selectedDay) return [];
    return getTimeList({ bookedDates, selectedDay });
  }, [bookedDates, selectedDay]);

  const selectedDate = useMemo(() => {
    if (!selectedDay || !selectedTime) return;
    return set(selectedDay, { ...parseTime(selectedTime), seconds: 0 });
  }, [selectedDay, selectedTime]);

  const resetBookingState = () => {
    setSelectedDay(undefined);
    setSelectedTime(undefined);
    setBookedDates([]);
  };

  const handleBookingClick = () => {
    if (data?.user) {
      setBookingSheetIsOpen(true);
      return;
    }
    setSignInDialogIsOpen(true);
  };

  const handleBookingSheetOpenChange = (isOpen: boolean) => {
    setBookingSheetIsOpen(isOpen);
    if (!isOpen) resetBookingState();
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDay(date);
    setSelectedTime(undefined);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleCreateBooking = async () => {
    if (!selectedDate) return;
    setIsSubmitting(true);
    try {
      await createBooking({ serviceId: service.id, date: selectedDate });
      handleBookingSheetOpenChange(false);
      toast.success("Reserva criada com sucesso!", {
        action: {
          label: "Ver agendamentos",
          onClick: () => router.push("/bookings"),
        },
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao criar reserva. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
            <Image
              src={service.imageUrl}
              fill
              className="rounded-lg object-cover"
              alt={service.name}
            />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">{service.name}</h3>
            <p className="text-sm text-gray-400">{service.description}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">
                {Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(service.price)}
              </p>

              <Sheet
                open={bookingSheetIsOpen}
                onOpenChange={handleBookingSheetOpenChange}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleBookingClick}
                >
                  Reservar
                </Button>

                <SheetContent className="overflow-y-auto px-0">
                  <SheetHeader>
                    <SheetTitle>Fazer reserva</SheetTitle>
                  </SheetHeader>

                  <div className="border-b border-solid py-5">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={selectedDay}
                      onSelect={handleDateSelect}
                      fromDate={new Date()}
                      styles={{
                        head_cell: {
                          width: "100%",
                          textTransform: "capitalize",
                        },
                        cell: {
                          width: "100%",
                        },
                        button: {
                          width: "100%",
                        },
                        nav_button_previous: {
                          width: "32px",
                          height: "32px",
                        },
                        nav_button_next: {
                          width: "32px",
                          height: "32px",
                        },
                        caption: {
                          textTransform: "capitalize",
                        },
                      }}
                    />
                  </div>

                  {selectedDay && (
                    <div className="flex gap-3 overflow-x-auto border-b border-solid p-5 [&::-webkit-scrollbar]:hidden">
                      {isLoadingTimes ? (
                        <p className="text-xs">Carregando horários...</p>
                      ) : timeList.length > 0 ? (
                        timeList.map((time) => (
                          <Button
                            key={time}
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className="rounded-full"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {time}
                          </Button>
                        ))
                      ) : (
                        <p className="text-xs">
                          Não há horários disponíveis para este dia.
                        </p>
                      )}
                    </div>
                  )}

                  {selectedDate && (
                    <div className="p-5">
                      <BookingSummary
                        service={service}
                        barbershop={barbershop}
                        selectedDate={selectedDate}
                      />
                    </div>
                  )}

                  <SheetFooter className="mt-5 px-5">
                    <Button
                      onClick={handleCreateBooking}
                      disabled={!selectedDate || isSubmitting}
                    >
                      {isSubmitting ? "Confirmando..." : "Confirmar"}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={signInDialogIsOpen} onOpenChange={setSignInDialogIsOpen}>
        <DialogContent className="w-[90%]">
          <SignInDialog />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceItem;
