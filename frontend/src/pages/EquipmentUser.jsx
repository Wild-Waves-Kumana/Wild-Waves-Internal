import React from 'react';
import DoorList from '../components/DoorList';
import UserLightList from '../components/UserLightList';
import ACList from '../components/ACList';

const EquipmentUser = () => {
  const userId = localStorage.getItem('userId'); // Get logged-in user's ID

  return (
    <div>
      <DoorList userId={userId}/>  {/* Pass userId only for user filtering */}
      <UserLightList userId={userId} />
      <ACList userId={userId} />
    </div>
  );
};

export default EquipmentUser;
