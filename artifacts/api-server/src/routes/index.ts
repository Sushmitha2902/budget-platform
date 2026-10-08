import { Router, type IRouter } from "express";
import healthRouter from "./health";
import budgetRouter from "./budget";
import exportRouter from "./export-route";
import pipelineRouter from "./pipeline-route";

const router: IRouter = Router();

router.use(healthRouter);
router.use(budgetRouter);
router.use(exportRouter);
router.use(pipelineRouter);

export default router;
