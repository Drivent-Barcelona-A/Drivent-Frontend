import styled from 'styled-components';
import { useEffect, useState } from 'react';
import useToken from '../../../hooks/useToken';
import { createTicket, searchTikets } from '../../../services/ticketApi';
import Button from '../../../components/Form/Button';
import { getPersonalInformations } from '../../../services/enrollmentApi';
import { toast } from 'react-toastify';

let colorCardHotel = '';
let formBodyticketTypeId, priceTicket, priceHotel, colorCardTicket = 0;
let ticketModalityOnline = undefined;

function TemplateTicket({ id, name, price, isRemote, setChooseTicket, setChooseHotel }) {
  function selectTicket() {
    setChooseTicket(id);
    setChooseHotel('');
    colorCardHotel = '';
    colorCardTicket = id;
    formBodyticketTypeId = id;
    ticketModalityOnline = isRemote;
    priceTicket = price / 100; 
  };

  return (
    <TicketModality className="ticketModality" onClick={selectTicket} id={id}>
      <Modality className="typo">{name}</Modality>
      <Price className="price">R$ {price/100}</Price>
    </TicketModality>
  );
}

export default function TicketPayment({ refreshTicket, setRefreshTicket }) {
  const [ticketTypes, setTicket] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState(0);
  const [chooseTicket, setChooseTicket] = useState(0);
  const [chooseHotel, setChooseHotel] = useState('');

  const token = useToken();
  useEffect(async() => {
    await searchTikets(token)
      .then((response) => {
        setTicket(response);
      })
      .catch(() => {
        alert('malformed request');
      });
  }, []);

  function SelectHotel({ setChooseHotel, name }) {
    setChooseHotel(name);
    colorCardHotel = name;
    if(name === 'Sem hotel') {
      const ticketType = ticketTypes.find(({ includesHotel, isRemote }) => !includesHotel && !isRemote);
      formBodyticketTypeId = ticketType.id;
      priceHotel = 0;
    }
    
    if(name === 'Com hotel') {
      const ticketType = ticketTypes.find(({ includesHotel }) => includesHotel);
      formBodyticketTypeId = ticketType.id;
      priceHotel = 350;
    }
  };
 
  const body = {
    enrollmentId,
    ticketTypeId: formBodyticketTypeId,
    status: 'RESERVED',
  };
  
  async function ReservedTicket() {
    try {
      const enrollmented = await getPersonalInformations(token);
      if(!enrollmented) return;
      setEnrollmentId(enrollmented.id);

      const createdTicket = await createTicket(body, token);
      if(createdTicket) {
        setRefreshTicket(!refreshTicket);
        return toast('ticket Reservado!');
      };
    } catch (error) {
      if (error.response.data) {
        return toast('Voçê já possui ticket Reservado!');
      }
      alert('malformed request');
    }
  }

  return ticketTypes.length === 0 ? (
    <SubTitle>Aguarde</SubTitle>
  ) : (
    <>
      <SubTitle>Primeiro, escolha sua modalidade de ingresso</SubTitle>
      <Applyhorizontal>
        {ticketTypes.map(({ id, name, price, isRemote, includesHotel }, index) => ( !includesHotel ?
          <TemplateTicket
            id={id}
            name={name}
            price={price}
            isRemote={isRemote}
            includesHotel={includesHotel}
            setChooseTicket={setChooseTicket}
            setChooseHotel={setChooseHotel}
            key={index}
          /> : ''
        ))}
      </Applyhorizontal>
      {ticketModalityOnline === undefined ? (
        ''
      ) : ticketModalityOnline === true ? (
        <>
          <SubTitle >Fechado! O total ficou em <strong style={{ paddingLeft: 3 }}> R$ {priceTicket}</strong>. Agora é só confirmar:</SubTitle>
          <Button onClick={ReservedTicket}>RESERVAR INGRESSO</Button>
        </>
        
      ) : (
        <>
          <SubTitle>Ótimo! Agora escolha sua modalidade de hospedagem</SubTitle>
          <Applyhorizontal>
            <TicketModality
              className="ticketModality"
              onClick={() => SelectHotel({ setChooseHotel, name: 'Sem hotel' })}
              accommodation="Sem hotel"
            >
              <Modality className="typo">Sem Hotel</Modality>
              <Price className="price">+ R$ 0</Price>
            </TicketModality>{' '}

            <TicketModality
              className="ticketModality"
              onClick={() => SelectHotel({ setChooseHotel, name: 'Com hotel' })}
              accommodation="Com hotel"
            >
              <Modality className="typo">Com Hotel</Modality>
              <Price className="price">+ R$ 350</Price>
            </TicketModality>
          </Applyhorizontal>

          {colorCardHotel === '' ? '' : (<>
            <SubTitle >Fechado! O total ficou em <strong style={{ paddingLeft: 3 }}> R$ {priceHotel + priceTicket}</strong>. Agora é só confirmar:</SubTitle>
            <Button onClick={ReservedTicket}>RESERVAR INGRESSO</Button>
          </>)
          }
        </>
      )}
    </>
  );
}

export const Modality = styled.div`
  font-family: 'Roboto';
font-size: 16px;
font-weight: 400;
margin-bottom: 8px;
`;

export const Price = styled.div`
color: #898989;
font-size: 14px;
`;

export const SubTitle = styled.div`
  display: flex;
  width: 550px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  margin-top: 25px;
  margin-bottom: 12px;
  font-size: 20px;
  color: #8e8e8e;
`;

export const Title = styled.div`
  display: flex;
  justify-content: left;
  width: 400px;
  height: 40px;
  font-family: 'Roboto';
  font-style: normal;
  font-weight: 400;
  font-size: 34px;
`;

const Applyhorizontal = styled.div`
  display: flex;
  justify-content: left;
  align-items: center;
  
`;

const TicketModality = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: 'Roboto';
  align-items: center;
  width: 145px;
  height: 145px;
  margin-right: 25PX;
  margin-bottom: 8px;
  border-radius: 20px;
  cursor: pointer;
  background-color: ${({ id, accommodation }) => 
    (id === colorCardTicket || colorCardHotel ===  accommodation ? '#FFEED2' : '#E5E5E5')};
  border: 1px solid #cecece;
`;
