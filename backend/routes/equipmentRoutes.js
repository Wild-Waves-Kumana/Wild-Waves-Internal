import express from 'express';
import { createEquipment, displaydoors, displaylights, displayACs, updateAirConditioner, updateDoor, updateLight, getNextItemCode } from '../controllers/equipmentController.js';

const router = express.Router();

router.post('/create', createEquipment);
router.get('/doors', displaydoors); // Add route to display doors   
router.get('/lights', displaylights); // Add route to display lights
router.get('/air-conditioners', displayACs); // Add route to display air conditioners

router.put('/air-conditioners/:acId', updateAirConditioner); // Add route to update air conditioner
router.put('/doors/:doorId', updateDoor); // Add route to update door
router.put('/lights/:lightId', updateLight); // Add route to update light

router.get('/next-item-code/:category', getNextItemCode);

export default router;
