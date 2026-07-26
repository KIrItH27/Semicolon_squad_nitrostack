export async function inspectBatchLogic(input: { batchId: string; machineId: string }) {
  const defectCount = Math.floor(Math.random() * 10);
  const severity =
    defectCount === 0 ? 'none' :
    defectCount <= 2 ? 'minor' :
    defectCount <= 5 ? 'major' : 'critical';
  const status = defectCount <= 2 ? 'PASS' : 'FAIL';

  return {
    batchId: input.batchId,
    machineId: input.machineId,
    defectCount,
    severity,
    status,
  };
}

export async function flagDefectLogic(input: { batchId: string; defectType: string; severity: 'minor' | 'major' | 'critical' }) {
  const actionRequired =
    input.severity === 'critical' ? 'Halt line immediately' :
    input.severity === 'major' ? 'Review within 1 hour' :
    'Log and continue monitoring';

  return {
    batchId: input.batchId,
    defectType: input.defectType,
    severity: input.severity,
    actionRequired,
  };
}

export async function rootCauseAnalysisLogic(input: { machineId: string }) {
  const shifts = ['Morning', 'Afternoon', 'Night'];
  const worstShift = shifts[Math.floor(Math.random() * shifts.length)];
  const defectRate = Math.floor(Math.random() * 40) + 10;

  return {
    machineId: input.machineId,
    worstShift,
    defectRate,
    likelyCause: `${defectRate}% of defects on ${input.machineId} occur during the ${worstShift} shift — likely linked to calibration drift or operator handoff.`,
  };
}