import React from 'react';
import DoorList from '../components/equipment-lists/DoorList';
import LightList from '../components/equipment-lists/LightList';
import ACList from '../components/equipment-lists/ACList';

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
