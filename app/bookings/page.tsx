import { getServerSession } from "next-auth";
import BookingItem from "../_components/booking-item";
import Header from "../_components/header";
import SignInDialog from "../_components/sign-in-dialog";
import { Button } from "../_components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../_components/ui/dialog";
import {
  getConcludedBookings,
  getConfirmedBookings,
} from "../_data/get-user-bookings";
import { authOptions } from "../_lib/auth";

const BookingsPage = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <>
        <Header />
        <div className="space-y-3 p-5">
          <h1 className="text-xl font-bold">Agendamentos</h1>
          <p className="text-gray-400">
            Faça login para ver seus agendamentos.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Fazer login</Button>
            </DialogTrigger>
            <DialogContent className="w-[90%]">
              <SignInDialog />
            </DialogContent>
          </Dialog>
        </div>
      </>
    );
  }

  const [confirmedBookings, concludedBookings] = await Promise.all([
    getConfirmedBookings(),
    getConcludedBookings(),
  ]);

  return (
    <>
      <Header />
      <div className="space-y-3 p-5">
        <h1 className="text-xl font-bold">Agendamentos</h1>

        {confirmedBookings.length === 0 && concludedBookings.length === 0 && (
          <p className="text-gray-400">Você não tem agendamentos.</p>
        )}

        {confirmedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Confirmados
            </h2>
            {confirmedBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </>
        )}

        {concludedBookings.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
              Finalizados
            </h2>
            {concludedBookings.map((booking) => (
              <BookingItem key={booking.id} booking={booking} />
            ))}
          </>
        )}
      </div>
    </>
  );
};

export default BookingsPage;
