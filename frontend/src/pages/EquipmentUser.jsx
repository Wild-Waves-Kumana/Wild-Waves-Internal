import React from 'react';
import UserDoorList from '../components/UserDoorList';
import UserLightList from '../components/UserLightList';
import ACList from '../components/ACList';

const EquipmentUser = () => {
  const userId = localStorage.getItem('userId'); // Get logged-in user's ID

  return (
    <div>
      <UserDoorList userId={userId}/>  {/* Pass userId only for user filtering */}
      <UserLightList userId={userId} />
      <ACList userId={userId} />
    </div>
  );
};

export default EquipmentUser;
