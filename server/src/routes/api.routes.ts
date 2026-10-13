import { Router } from 'express';
import { getHealth, createAnalysis, getAnalysis, getAnalysisStatus, getAnalysisReport } from '../controllers/analysis.controller.ts';

const router = Router();

router.get('/health', getHealth);
router.post('/analysis', createAnalysis);
router.get('/analysis/:id', getAnalysis);
router.get('/analysis/:id/status', getAnalysisStatus);
router.get('/analysis/:id/report', getAnalysisReport);

export default router;
