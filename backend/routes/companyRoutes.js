import express from 'express';
import { createCompany, getCompanies, getCompanyById } from '../controllers/companyController.js';

const router = express.Router();

router.post('/create', createCompany);
router.get('/all', getCompanies);
router.get('/:id', getCompanyById);

export default router;