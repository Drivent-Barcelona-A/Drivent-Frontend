import styled from 'styled-components';
import Room from './Room';
import Button from '../../Form/Button';
import { useState } from 'react';
import { postBooking, putBooking } from '../../../services/bookingApi';
import useToken from '../../../hooks/useToken';
import { toast } from 'react-toastify';
import Title from '../../Title';
import sleep from '../../../helpers/sleep';

export default function RoomSelector({
  hotelSelected,
  hotelRooms,
  setHasBooking,
  booking,
  isChange,
  setIsChange,
  setCallApi
}) {
  const token = useToken();
  const [keyRoomSelected, setKeyRoomSelected] = useState(0);

  async function handleBooking(roomId) {
    const newBooking = { roomId };
    try {
      let bookingResponse;
      if (isChange) bookingResponse = putBooking(newBooking, booking.bookingId, token);
      else bookingResponse = postBooking(newBooking, token);
      if (bookingResponse) {
        await sleep(100);
        setHasBooking(current => true);
        setIsChange(current => false);
        toast('Reserva feita!');
      };
    } catch (error) {
      toast('Algum erro ocorreu, por favor tente novamente mais tarde!');
    }
  }

  const hotel = hotelRooms.filter(hotel => hotel.id === hotelSelected)[0];
  const rooms = hotel.Rooms;

  return (
    <>
      <Title>Ótima pedida! Agora escolha seu quarto:</Title>
      <Rooms roomsLength={rooms.length}>
        {rooms.map(room => <Room key={room.id} id={room.id} isSelected={room.id === keyRoomSelected} setKeyRoomSelected={setKeyRoomSelected} room={room} />)}
      </Rooms>
      {keyRoomSelected > 0 ?
        <Button onClick={() => handleBooking(keyRoomSelected)}>RESERVAR QUARTO</Button>
        : ''}
    </>
  );
}

const Rooms = styled.div`
  margin: 1.5rem 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: ${props => props.roomsLength % 4 !== 0 ? 'flex-start' : 'space-between'};

  @media (max-width: 600px) {
    justify-content: center;
  } 
`;
