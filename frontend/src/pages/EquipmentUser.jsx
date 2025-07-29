import React from 'react'
import UserDoorList from '../components/UserDoorList'
import UserLightList from '../components/UserLightList'
import UserACList from '../components/UserACList'

const EquipmentUser = () => {
  return (
    <div>
      <UserDoorList/>

      <UserLightList/>

      <UserACList/>
    </div>
  )
}

export default EquipmentUser
