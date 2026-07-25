import { Tool, z } from '@nitrostack/core';

export const inspectBatchTool = new Tool({
  name: 'inspect_batch',
  description: 'Inspects a production batch and reports defect count and pass/fail status',
  inputSchema: z.object({
    batchId: z.string().describe('The batch ID to inspect, e.g. B45'),
    machineId: z.string().describe('The machine that produced this batch, e.g. M3'),
  }),
  handler: async (input: { batchId: string; machineId: string }, context) => {
    const defectCount = Math.floor(Math.random() * 10);
    const severity =
      defectCount === 0 ? 'none' :
      defectCount <= 2 ? 'minor' :
      defectCount <= 5 ? 'major' : 'critical';
    const status = defectCount <= 2 ? 'PASS' : 'FAIL';

    context.logger.info(`Inspected batch ${input.batchId}: ${status}`);

    return {
      batchId: input.batchId,
      machineId: input.machineId,
      defectCount,
      severity,
      status,
    };
  },
});

export const flagDefectTool = new Tool({
  name: 'flag_defect',
  description: 'Flags a specific defect found in a batch with its severity level',
  inputSchema: z.object({
    batchId: z.string().describe('The batch ID where the defect was found'),
    defectType: z.string().describe('Type of defect, e.g. scratch, misalignment, crack'),
    severity: z.enum(['minor', 'major', 'critical']).describe('How severe the defect is'),
  }),
  handler: async (
    input: { batchId: string; defectType: string; severity: 'minor' | 'major' | 'critical' },
    context
  ) => {
    const actionRequired =
      input.severity === 'critical' ? 'Halt line immediately' :
      input.severity === 'major' ? 'Review within 1 hour' :
      'Log and continue monitoring';

    context.logger.info(`Defect flagged on ${input.batchId}: ${input.severity}`);

    return {
      batchId: input.batchId,
      defectType: input.defectType,
      severity: input.severity,
      actionRequired,
    };
  },
});

export const rootCauseAnalysisTool = new Tool({
  name: 'root_cause_analysis',
  description: 'Analyzes defect patterns across shifts and machines to suggest the likely root cause',
  inputSchema: z.object({
    machineId: z.string().describe('The machine to analyze, e.g. M3'),
  }),
  handler: async (input: { machineId: string }, context) => {
    const shifts = ['Morning', 'Afternoon', 'Night'];
    const worstShift = shifts[Math.floor(Math.random() * shifts.length)];
    const defectRate = Math.floor(Math.random() * 40) + 10;

    return {
      machineId: input.machineId,
      worstShift,
      defectRate,
      likelyCause: `${defectRate}% of defects on ${input.machineId} occur during the ${worstShift} shift — likely linked to calibration drift or operator handoff.`,
    };
  },
});