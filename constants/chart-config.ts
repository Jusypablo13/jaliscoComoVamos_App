/**
 * Configuration constants for chart rendering based on question types.
 */

/**
 * Threshold for determining when a question's responses should be grouped into ranges.
 * Questions with escala_max greater than this value will have their responses
 * grouped into a maximum of 4 range bars instead of individual value bars.
 * 
 * This helps avoid histograms with too many columns for numeric questions
 * that represent percentages, counts, or frequencies.
 * 
 * Default: 10 (so questions with escala_max > 10 will be grouped)
 */
export const SCALE_MAX_THRESHOLD = 10

/**
 * Maximum number of bars/groups to display for numeric questions
 * that have escala_max > SCALE_MAX_THRESHOLD.
 */
export const MAX_RANGE_GROUPS = 4

/**
 * Labels for yes/no question responses.
 * In the survey, 1 = Yes, 2 = No, 0 = NS/NC (excluded from chart).
 */
export const YES_NO_LABELS = {
    YES: 'Sí',
    NO: 'No',
} as const

/**
 * Numeric values used in the survey for yes/no questions.
 */
export const YES_NO_VALUES = {
    YES: 1,
    NO: 2,
    NS_NC: 0,
} as const
