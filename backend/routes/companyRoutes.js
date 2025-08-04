import express from 'express';
import { createCompany, getCompanies } from '../controllers/companyController.js';

const router = express.Router();

router.post('/create', createCompany);
router.get('/all', getCompanies);

export default router;