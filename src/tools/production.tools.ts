import { supabase } from '../db/supabase.js';
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

export interface ProductionLineRow {
  line_id: string;
  line_name: string;
  plant_location: string;
  operational_status: string;
  target_units_per_hour: number;
  actual_units_per_hour: number;
  oee_percentage: number;
  shift_leader_id: string | null;
  updated_at: string;
}

/**
 * getProductionStatus
 * Returns line speed, batch targets, units produced, and current bottlenecks directly from Supabase DB.
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
    let query = supabase.from('production_lines').select('*');
    if (lineId) {
      query = query.eq('line_id', lineId.toUpperCase());
    }

    const { data: dbRows, error } = await query;

    if (error) {
      console.error('❌ Supabase Production Lines Fetch Error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }

    const rows: ProductionLineRow[] = dbRows || [];

    if (lineId && rows.length === 0) {
      return {
        success: false,
        error: `Production line "${lineId}" not found in database.`,
      };
    }

    const formattedLines = rows.map((row) => ({
      lineId: row.line_id,
      lineName: row.line_name,
      plantLocation: row.plant_location,
      operationalStatus: row.operational_status,
      targetUnitsPerHour: Number(row.target_units_per_hour),
      actualUnitsPerHour: Number(row.actual_units_per_hour),
      oeePercentage: Number(row.oee_percentage),
      shiftLeaderId: row.shift_leader_id,
      updatedAt: row.updated_at,
    }));

    if (lineId) {
      return {
        success: true,
        timestamp: new Date().toISOString(),
        data: formattedLines[0],
      };
    }

    const totalTarget = formattedLines.reduce((acc, l) => acc + l.targetUnitsPerHour, 0);
    const totalActual = formattedLines.reduce((acc, l) => acc + l.actualUnitsPerHour, 0);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalLines: formattedLines.length,
        runningLines: formattedLines.filter((l) => l.operationalStatus === 'RUNNING').length,
        degradedLines: formattedLines.filter((l) => l.operationalStatus === 'DEGRADED').length,
        pausedLines: formattedLines.filter((l) => l.operationalStatus === 'PAUSED' || l.operationalStatus === 'STOPPED').length,
        overallTargetPerHour: totalTarget,
        overallActualPerHour: totalActual,
      },
      lines: formattedLines,
    };
  },
});

/**
 * adjustLineSpeed
 * Inputs: lineId: string, speedPercentage: number. Updates operational speed directly in Supabase DB.
 */
export const adjustLineSpeed = defineTool({
  name: 'adjustLineSpeed',
  description: 'Adjusts the operational speed percentage of a specified production line and updates Supabase DB.',
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

    // 1. Fetch current record from Supabase
    const { data: existingRows, error: fetchErr } = await supabase
      .from('production_lines')
      .select('*')
      .eq('line_id', normalizedId);

    if (fetchErr || !existingRows || existingRows.length === 0) {
      return {
        success: false,
        error: `Production line "${lineId}" not found in Supabase production_lines table.`,
      };
    }

    const currentLine: ProductionLineRow = existingRows[0];
    const newActualSpeed = Math.round((currentLine.target_units_per_hour * speedPercentage) / 100);
    
    let newStatus = currentLine.operational_status;
    if (speedPercentage === 0) {
      newStatus = 'PAUSED';
    } else if (speedPercentage < 75) {
      newStatus = 'DEGRADED';
    } else {
      newStatus = 'RUNNING';
    }

    const updatedAt = new Date().toISOString();

    // 2. Update Supabase DB using exact column names
    const { data: updatedRows, error: updateErr } = await supabase
      .from('production_lines')
      .update({
        actual_units_per_hour: newActualSpeed,
        operational_status: newStatus,
        updated_at: updatedAt,
      })
      .eq('line_id', normalizedId)
      .select();

    if (updateErr) {
      console.error('❌ Supabase Update Error:', updateErr.message);
      return {
        success: false,
        error: updateErr.message,
      };
    }

    return {
      success: true,
      timestamp: updatedAt,
      message: `Production speed for ${currentLine.line_name} (${normalizedId}) updated to ${speedPercentage}%.`,
      adjustmentDetails: {
        lineId: normalizedId,
        lineName: currentLine.line_name,
        targetUnitsPerHour: currentLine.target_units_per_hour,
        previousActualUnitsPerHour: currentLine.actual_units_per_hour,
        newActualUnitsPerHour: newActualSpeed,
        speedPercentage,
        newOperationalStatus: newStatus,
        updatedAt,
      },
    };
  },
});

