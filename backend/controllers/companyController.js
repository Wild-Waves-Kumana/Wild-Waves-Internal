import Company from '../models/company.js';

export const createCompany = async (req, res) => {
  const { companyName, companyId } = req.body;
  if (!companyName || !companyId) {
    return res.status(400).json({ message: 'Company name and ID are required.' });
  }
  try {
    // Optional: Check for duplicate companyId
    const exists = await Company.findOne({ companyId });
    if (exists) {
      return res.status(400).json({ message: 'Company ID already exists.' });
    }
    const company = new Company({ companyName, companyId });
    await company.save();
    res.status(201).json({ message: 'Company created successfully', company });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch companies' });
  }
};