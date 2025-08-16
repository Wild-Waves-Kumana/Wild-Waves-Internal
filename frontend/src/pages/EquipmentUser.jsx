import React from 'react';
import DoorList from '../components/DoorList';
import UserLightList from '../components/UserLightList';
import UserACList from '../components/UserACList';

const EquipmentUser = () => {
  const userId = localStorage.getItem('userId'); // Get logged-in user's ID

  return (
    <div>
      <DoorList userId={userId}/>  {/* Pass userId only for user filtering */}
      <UserLightList userId={userId} />
      <UserACList userId={userId} />
    </div>
  );
};

export default EquipmentUser;
