import { useNavigate } from 'react-router-dom';
import BikeForm from '../components/bike/BikeForm';
import { bikeService } from '../services/bikeService';

export default function CreateBike() {
  const navigate = useNavigate();
  return (
    <div className="container page page--narrow">
      <h1>Sell a bike</h1>
      <BikeForm
        submitLabel="List bike"
        onSubmit={async (bike) => {
          await bikeService.create(bike);
          navigate('/transactions?tab=listings');
        }}
      />
    </div>
  );
}
