import React from 'react';
import DoorList from '../components/lists/DoorList';
import LightList from '../components/lists/LightList';
import ACList from '../components/lists/ACList';

const EquipmentUser = () => {
  const userId = localStorage.getItem('userId'); // Get logged-in user's ID

  return (
    <div>
      <DoorList userId={userId}/>  {/* Pass userId only for user filtering */}
      <LightList userId={userId} />
      <ACList userId={userId} />
    </div>
  );
};

export default EquipmentUser;
