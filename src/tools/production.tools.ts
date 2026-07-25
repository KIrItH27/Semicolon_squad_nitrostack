import { z } from '@nitrostack/core';
import { defineTool } from './define-tool.js';

/**
 * Mock data store for production lines
 */
const mockProductionLines: Record<
  string,
  {
    lineId: string;
    lineName: string;
    lineSpeedUnitsPerHour: number;
    nominalSpeedUnitsPerHour: number;
    speedPercentage: number;
    batchTarget: number;
    unitsProduced: number;
    bottlenecks: string[];
    status: 'RUNNING' | 'DEGRADED' | 'STOPPED';
  }
> = {
  'LINE-A1': {
    lineId: 'LINE-A1',
    lineName: 'Main Assembly Line A1',
    lineSpeedUnitsPerHour: 450,
    nominalSpeedUnitsPerHour: 500,
    speedPercentage: 90,
    batchTarget: 5000,
    unitsProduced: 3420,
    bottlenecks: ['Feeder Station #2 micro-stalls', 'Cooling Bay thermal limit near threshold'],
    status: 'RUNNING',
  },
  'LINE-B2': {
    lineId: 'LINE-B2',
    lineName: 'High-Precision Packaging Line B2',
    lineSpeedUnitsPerHour: 300,
    nominalSpeedUnitsPerHour: 600,
    speedPercentage: 50,
    batchTarget: 3000,
    unitsProduced: 1200,
    bottlenecks: ['Robotic Arm B2-3 vision calibration delay', 'Part PART-SERVO-01 buffer low'],
    status: 'DEGRADED',
  },
  'LINE-C3': {
    lineId: 'LINE-C3',
    lineName: 'Component Stamping Line C3',
    lineSpeedUnitsPerHour: 0,
    nominalSpeedUnitsPerHour: 400,
    speedPercentage: 0,
    batchTarget: 2500,
    unitsProduced: 2500,
    bottlenecks: ['Scheduled tool changeover in progress'],
    status: 'STOPPED',
  },
};

/**
 * getProductionStatus
 * Returns line speed, batch targets, units produced, and current bottlenecks.
 */
export const getProductionStatus = defineTool({
  name: 'getProductionStatus',
  description: 'Returns real-time operational status for plant production lines, including line speed, batch targets, units produced, OEE performance, and active bottlenecks.',
  parameters: z.object({
    lineId: z
      .string()
      .optional()
      .describe('Optional production line ID (e.g., "LINE-A1", "LINE-B2"). If omitted, returns status for all active lines.'),
  }),
  execute: async ({ lineId }: { lineId?: string }) => {
    if (lineId) {
      const line = mockProductionLines[lineId.toUpperCase()];
      if (!line) {
        return {
          success: false,
          error: `Production line "${lineId}" not found. Available lines: ${Object.keys(mockProductionLines).join(', ')}`,
        };
      }
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: {
          ...line,
          completionPercentage: Number(((line.unitsProduced / line.batchTarget) * 100).toFixed(1)),
          remainingUnits: Math.max(0, line.batchTarget - line.unitsProduced),
        },
      };
    }

    const lines = Object.values(mockProductionLines).map((line) => ({
      ...line,
      completionPercentage: Number(((line.unitsProduced / line.batchTarget) * 100).toFixed(1)),
      remainingUnits: Math.max(0, line.batchTarget - line.unitsProduced),
    }));

    const totalTarget = lines.reduce((acc, l) => acc + l.batchTarget, 0);
    const totalProduced = lines.reduce((acc, l) => acc + l.unitsProduced, 0);
    const activeBottlenecks = lines.flatMap((l) => l.bottlenecks.map((b) => `[${l.lineId}] ${b}`));

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalLines: lines.length,
        runningLines: lines.filter((l) => l.status === 'RUNNING').length,
        degradedLines: lines.filter((l) => l.status === 'DEGRADED').length,
        stoppedLines: lines.filter((l) => l.status === 'STOPPED').length,
        overallProgress: Number(((totalProduced / totalTarget) * 100).toFixed(1)),
        totalProduced,
        totalTarget,
        activeBottlenecksCount: activeBottlenecks.length,
      },
      lines,
      allActiveBottlenecks: activeBottlenecks,
    };
  },
});

/**
 * adjustLineSpeed
 * Inputs: lineId: string, speedPercentage: number. Updates operational speed.
 */
export const adjustLineSpeed = defineTool({
  name: 'adjustLineSpeed',
  description: 'Adjusts the operational speed percentage of a specified production line and computes the resulting units-per-hour output.',
  parameters: z.object({
    lineId: z.string().describe('ID of the production line to adjust (e.g., "LINE-A1", "LINE-B2")'),
    speedPercentage: z
      .number()
      .min(0)
      .max(150)
      .describe('Target speed percentage relative to nominal capacity (0% to 150%)'),
  }),
  execute: async ({ lineId, speedPercentage }: { lineId: string; speedPercentage: number }) => {
    const normalizedId = lineId.toUpperCase();
    const line = mockProductionLines[normalizedId];

    if (!line) {
      return {
        success: false,
        error: `Production line "${lineId}" not found. Available lines: ${Object.keys(mockProductionLines).join(', ')}`,
      };
    }

    const previousSpeed = line.lineSpeedUnitsPerHour;
    const previousPercentage = line.speedPercentage;

    // Update in-memory state
    line.speedPercentage = speedPercentage;
    line.lineSpeedUnitsPerHour = Math.round((line.nominalSpeedUnitsPerHour * speedPercentage) / 100);

    if (speedPercentage === 0) {
      line.status = 'STOPPED';
    } else if (speedPercentage < 75 || line.bottlenecks.length > 1) {
      line.status = 'DEGRADED';
    } else {
      line.status = 'RUNNING';
    }

    return {
      success: true,
      timestamp: new Date().toISOString(),
      message: `Production speed for ${line.lineName} (${line.lineId}) updated to ${speedPercentage}%.`,
      adjustmentDetails: {
        lineId: line.lineId,
        lineName: line.lineName,
        previousSpeedPercentage: previousPercentage,
        newSpeedPercentage: speedPercentage,
        previousUnitsPerHour: previousSpeed,
        newUnitsPerHour: line.lineSpeedUnitsPerHour,
        nominalUnitsPerHour: line.nominalSpeedUnitsPerHour,
        newStatus: line.status,
        estimatedHoursToCompleteBatch:
          line.lineSpeedUnitsPerHour > 0
            ? Number(((line.batchTarget - line.unitsProduced) / line.lineSpeedUnitsPerHour).toFixed(2))
            : null,
      },
    };
  },
});
