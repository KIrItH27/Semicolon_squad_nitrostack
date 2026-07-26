import {
  ControllerDecorator as Controller,
  ToolDecorator as Tool,
  z,
  ExecutionContext
} from '@nitrostack/core';
import {
  inspectBatchLogic,
  flagDefectLogic,
  rootCauseAnalysisLogic
} from '../quality.tools.js';

export const inspectBatchSchema = z.object({
  batchId: z.string().describe('The batch ID to inspect, e.g. B45'),
  machineId: z.string().describe('The machine that produced this batch, e.g. M3'),
});

export const flagDefectSchema = z.object({
  batchId: z.string().describe('The batch ID where the defect was found'),
  defectType: z.string().describe('Type of defect, e.g. scratch, misalignment, crack'),
  severity: z.enum(['minor', 'major', 'critical']).describe('How severe the defect is'),
});

export const rootCauseAnalysisSchema = z.object({
  machineId: z.string().describe('The machine to analyze, e.g. M3'),
});

@Controller()
export class QualityController {
  @Tool({
    name: 'inspect_batch',
    description: 'Inspects a production batch and reports defect count and pass/fail status',
    inputSchema: inspectBatchSchema,
  })
  async inspectBatch(input: any, ctx: ExecutionContext) {
    ctx.logger.info(`Inspecting batch: ${input?.batchId}`);
    return inspectBatchLogic(input);
  }

  @Tool({
    name: 'flag_defect',
    description: 'Flags a specific defect found in a batch with its severity level',
    inputSchema: flagDefectSchema,
  })
  async flagDefect(input: any, ctx: ExecutionContext) {
    ctx.logger.info(`Flagging defect on batch: ${input?.batchId}`);
    return flagDefectLogic(input);
  }

  @Tool({
    name: 'root_cause_analysis',
    description: 'Analyzes defect patterns across shifts and machines to suggest the likely root cause',
    inputSchema: rootCauseAnalysisSchema,
  })
  async rootCauseAnalysis(input: any, ctx: ExecutionContext) {
    ctx.logger.info(`Running root cause analysis on: ${input?.machineId}`);
    return rootCauseAnalysisLogic(input);
  }
}