import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import { Alert, Platform } from 'react-native'
import { brandColors } from '../styles/theme'

/**
 * Data required to generate a chart PDF export.
 */
export type ChartPdfData = {
    /** Base64 encoded image of the chart */
    chartImageBase64: string
    /** Title of the question */
    questionTitle: string
    /** Question identifier (e.g., "Q_1") */
    questionId: string
    /** Optional description of the question */
    questionDescription?: string
    /** Total sample size */
    sampleSize: number
    /** Valid responses count */
    validResponses: number
    /** Active filters description */
    activeFiltersText?: string
    /** Survey version or name */
    surveyVersion?: string
}

/**
 * Base64 encoded observatory logo.
 * This is embedded directly to avoid asset loading issues in PDF generation.
 */
const OBSERVATORY_LOGO_BASE64 = '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AQJCAI1IAAA4ABAYAEBIAgIQAQBCQJBQkIACBIEAAOEBAQEBIYAAgBCAAIIIYLCIQFAERACQMCkECYIBAQSBAQCAgGAJCEJCAKBBCJB0AIAJCwggYCAJELIJgSgQBKBDAkMEgBIQJCAwCCBgACAACDBJEhgYLAQgASBgIBIIAsQBRAAQgAjJQgJCQJCKDAQDCSABBQkQQBAQkJAACAgJBIYAIYgAkBIQJAgCCSAkIJAgBIQAkJYQoIAQCCAgBCABJMSQhJAAACCkFCASbADBBICBiUJJMBAABCGJAIJAgCGBJAAgAAkIoQATCCEhICAYIkAQEJAgoAgCDhJCgkIIIhASABBCQAACRJAAIaEFBAk0AgJCAJJgEBIQACCAgJIAHB0ESQAJAgJCAJBMggIJIESAJCAgAYBBCGAESQGAEBARSAIIJJCQYEAIJCABICGBQCBBQBJAEYCgQQqBYOAgQJBgEBAYBIAlgHCIAFggACRAQgAACQkNJJQhISQgQEKBYCIREJBIAAIYCAYJAASBkBICTBA4DAQCNAGBBgEhYIAgOBgEBIaJEAhIAhACpAwBBhiIDQEICCTAJiCQhACIACFxIRBBABICIQFBJYREgHAYIRAEhAgCBQgAhASQIBggCgIghICAMAhIMBhICBASIENCSIBJCAEEIkSQQIAIAIIgJAEKQJCCQgkQJBCQRCJAAgAAJARACAEkIIKAMAQBAgJA0AKGRhAACRAAEABAJJIECCERkQCAEEkAIBJACFIhACGAYEgiCAQSBBJhCAISghIQAgIIAJaANMIECICkBASEBAJBIBCEJIQCkBB0EiC4KAEEBASBIBICEBBIRhIQCEAQkABAgAAgIChCARJBICAQlIAhQCAkIEARJCCgSAMEEgICCAAMCEBCIBBIkASABISAkBJQBCAKBBIGQFBAACEgMJAAIIICQEIKCCAkJCAqAABISEBJAYFhJCEAgCEAACBpBAgKAIACSEASAIAJACAkEAAIoGlAAgKEJAGAgISAKBgMEgJCEAACgIAgBJAMJARABIEAiUgJIAgICSCAJJAEJIACEBASQBICAhAQkCAQCRABASIgJBAkJAQMCgEBCQhCCwCIQIGCRERACABICQBASEAASBBICQhJBASEAIAAAJCQgpBCAIIBIQAQIFAQkIACARJCEiCRACAIKCQISABgBIQGgIIAEhIQCIgICASEBAQQgISECQkJAQEBBCSAoISEBAQEJAkJIGAJEgCAYIkCQRCBICEIElIQACQoBBSCBAkAC7hYCAQJCCkJCAIASCkJCEIEJBQkBYCAhAJJAkJAgkJCQkJAASQIJCChISEgISEBAQSJCRJQEjRJJC4JCABSAMEJCAhJCSEACEECQnYJIQABAIAEBAJCEgSAgIBIShASEgIBCSBQoIgSJIgCCkgJCQkJAQEECSQQIKkhJBCEBISQoKQkJCkIQISEqQkAQggQEJCEAICSiCBIKEECQgSCBACAoIQEBASEgISEhJCQAKQgJCAESCAkJCQEBYoJCQkpEVISAgCSEhISghIiAQkCRAECAkSAkIKISghJCAhISEhIEhJQAgJJEiCIBISICAEJCRGEhKCBIJACBISEhISEgIShICAggSCgCBIQABCCBKEgJICAYJCgoSEhISghAhJQgIJEhISQkJCQkBCYSAIQAghSEhISYgEqQSChIQEEBIkRCSEhICEhISEhJCQQCKQkJCQhEhICIQECQKQkJCQkJCAIBIkEAgSkoSEkJCQkJCQEhIiIQgIhIQEAoIkJAgJEhBEIBASEhISEhIiSAhBQgIBCAhJICACASBAJEgIQQISCkFJCJIQEBYJCQgJCRIiCJGQkJCQkKCEhIQQCAQSEhISSEBAQUJCQpCQoJAQCYKQEBBICgkCCYKCCAlCQgQJCCghBCFJkICAkhAJIEUJKSEJIiRAQEICQkJBAICSAQlIWCSEJIQggYAkhCQQEBCiASEhISEhKUhIQkJCSUgIkAIBISEhARGClASEhITAoAwBAYWUhIQEAiJJCJMEAiRIQoIUCkgICQkhSEhIQDIJkZCQkCAhJAAhJIQkISIggIgEJCQkJCQEBISQQIJkQMIoEhISEhKCBISEhIQEEkRIkJCQkAQQEhKSgJSQJIkEJCQkJASShJSEIAmIBCJJCFGQkJCQRCgEJAkJCQkhJIUEBJACAiIgJCQkhIRAQkJCQhCEhIRAQkJCQkISISIhIQlJSUhIQkhCSECABCSEIISIhISEhIRIEkJCQkhSQkJCJIGUkJCQhJCQEBASJCQkBBgQAgkhIRZIQkJCQkJCgiQRIiEhCUhJiIiEgAIBIeGEhIQkCIkEIaGEhIQQgoSEhIQIJCQhIZJCQiQkJEiCkJIQCCAkJCQkJCEhISEhKSEkKSEhKYgEBIGEhIREkhRCQiQkCCQhJCQkJCQkIBIiEhKSkhCSkJCQJCQkJCQQEhISCUgJSZCShISkhISAhISEpJQkJIUkCQmEJIggISEJCQkJCYiEhIIkJAQpIRGSEBISEhISkpKQkJCQhCAkJCQkJAQkCSEhJCQBCQmSJISEhISEhISEIAQJSUhIQoIkhISEJIQkJBJCSkhJSkhIQoSEhCSkoJCkJCUhJSQkJSQlKSQlJCEkJSQlJCEkJCQkSSEhJCUpISAhJCQkJCQhIUhICCIhhJCQhISEhKSkkJCQpCQlJCRJSJJASCIkISEhISEhJCQhJAEhJCEkJEhJSZKEpCQkJCQkJAEBAgIiEiSIpISEhIQkJCQkJCQJJCkhISEJCQkJJCkhJSEhIUISEhIAJCEhSUJSQkKSJIQkJCQkJCFJCQkJJSEhKSEhJAkJCQlJSEgJBEkISUhIQkJCIkEikBIkJCQkJCQkJCFJSAkJCQkJJCQlJCQhJSEhICkhKSEhAaGUkJCEhISSJCQkIRICIiEhKSEJCQkJCREJCQlJQCQkJCEhISEkIYCkIBEkCCFJAkJSEkISEhKSEhQSJCQkJAEpCQlJCZISEoKEkBCSkCAJCZIkJCQhKSEpJCEhISEhSQlJCQlISEhISEKSEpAEBCRIIUQkJCQkJCQhISEBJCkJCUQICSEJEhISAhKQEIRISEgIQRIKSUhIQkJCQlJCQEJCQoJECEhIiIRASEhISkJCIhISCgkJKUhJSUJJAkhIQIIkJCQkISkJSRCREhIQIkREIQJCSAkJJSEJCUhISEJASQkJIQkJCUhKEBAJCQkBBBISEJJIQkJCCCgkJASRhISEhJCEhASSkJCQJCEhKSEoJCEBkZSQhJQkJCUJJCQhJCEkJCQkIYmEBBCCkJCQQCIkJCQkSEhCQkJCQkJCSEhKQkhCQkJCQgBIQkJCEhKSpIQkJCQhJCgkJCQhEhASkhISEpJCQkISEhISkpCQkBBIQkIQkiQkJCQkEhIgCSEhISEhKSEhISkhIQkJSQlJCQghJCQkJCQhJIQkJCQkJCEkIUlCQiIpCQgJCUlIkJCQkJCQkJCQkJCQkISEhISEJAQJCCEhIUEhCUlJCQkJCRAJCQkJCQkJCQlJQkJCgkSSJCQkJCQkJCQkJCAkIUlIQkhISkpISkJCQkJCQlJSQlJCQkJCSEhIQkJICEJCkISEhIQkJSEhIQkJCQlJCQkJSRJBCElISEhISEhIQEIkJCQkJCQkJCQkJCQkJCQkJCQkISkhKSFBSEJJAiAhJCQkJCQkJCQkJCQkJAkJCQkJQCIhIUlCkJCkJCEhISEhIQlJCUlJSEhIkJCQkJCQkJCQkIgICCEJSEJCQkJCQkKSJCEhISEhSEpIQkhIQkhIQkJCQhISkhICQkJIQkJIQkJCQkJCQkJCQhISkpKSkJCUEJKEkJCQkJCQkJAQEBISEpKQkJCQkICAkJSQkISEJIQkJCEhISkJCQkJCQkJJSEJSQhJEQkJCQkJCQkJCQgSAkJCQoKkhISEhCQlJCQkIUFCQkJCQkJCQkIAISEJSUhISEhISkpCQkJCQkJCQkJCQkJCQkKSEhIQCAkJIUkJSUhISEhIQhJCQkJCQkJCEhKQEJIQgkSCkJCQkJCQkJCQkJCQkISAkJAQEBIQEhIQEJKUlBQSEJKQkJCQkJCQJCQhJCEhCSEpIQkJCUlJSQlJCQkJCQkJCQkJCQkJCEkISSEJCQkJCQkJCQkJCQkJCQkJCUlJSElJSUJIQkJCQkJCQkJCQkJCQkJCQhISEhISEhISEJIQkCQJCQoJCQlJCQkJCQkJCQlISklJSUhJSElJSUJIQkJCQkJCQkJCQkJCQkJCQkJIQhISkpCQkJCQkJCQhJIQkBCSEJISEhKSJCQkJSUlJSUlJSUlJSUlJSUlJSUlJSUJIQkJCQkJCQkJCQkJCQkJCQkJCQlJSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkoSEhCQkJCQkJCQkJCQkJCQkJCQkJCUpKSkpKSkpKSkpKSkpKSkpKSkpKQkJCQkJCQkJCQkJCQkJCQkJCQkJCQlKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCQkJCQkJCQkJSUlJSUpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCQkJCQkJCQlJSklJSUpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCQkJCQkJCUpKSUpKSUpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCQkJCQkJCUpJSklJSklKSkpKSkpKSkpKSkpKSkpKSkhCQkJCQkJCQkJCQkJCQkJCklKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSQkJCQkJCQkJCQkJCQkJCQlJSkpKSkpKSkpKSkpKSkpKSkpKSkpKSklJCQkJCQkJCQkJCQkJCQlJSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpJCQkJCQkJCQkJCQkJCQkJSUpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKQkJCQkJCQkJCQkJCQkJSUpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCQkJCklKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpCQkJCQkJCQkJCQkJCUpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKQkJCQkJCQkJCQkJCUlKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCQpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCQkJCUpJSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpCQkJCQkJCQkJCUlKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKQkJCQkJCQkJCUlKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkJCUpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQkKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJCQkJCQlJSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpCQkJCUlKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKQkJCUpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkJSUpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKQ=='

/**
 * Generates HTML content for the chart PDF.
 */
function generatePdfHtml(data: ChartPdfData): string {
    const {
        chartImageBase64,
        questionTitle,
        questionId,
        questionDescription,
        sampleSize,
        validResponses,
        activeFiltersText,
        surveyVersion,
    } = data

    // Format current date in Spanish
    const currentDate = new Date().toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 40px;
            background-color: #ffffff;
            color: #211F30;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid #163C74;
            padding-bottom: 20px;
        }
        .header-left {
            flex: 1;
        }
        .header-right {
            width: 80px;
            height: 80px;
        }
        .logo {
            width: 80px;
            height: 80px;
            object-fit: contain;
        }
        .question-id {
            font-size: 12px;
            color: #8795BA;
            margin-bottom: 8px;
        }
        .question-title {
            font-size: 24px;
            font-weight: bold;
            color: #163C74;
            margin-bottom: 12px;
            line-height: 1.3;
        }
        .question-description {
            font-size: 14px;
            color: #211F30;
            line-height: 1.5;
            margin-bottom: 8px;
        }
        .meta-info {
            font-size: 12px;
            color: #8795BA;
        }
        .stats-row {
            display: flex;
            gap: 20px;
            margin-bottom: 24px;
        }
        .stat-card {
            flex: 1;
            background-color: #F5F7FA;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-label {
            font-size: 12px;
            color: #8795BA;
            margin-bottom: 4px;
        }
        .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #163C74;
        }
        .chart-container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 24px;
            border: 1px solid #E0E4EA;
        }
        .chart-image {
            width: 100%;
            max-width: 600px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .filters-section {
            background-color: #F5F7FA;
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 24px;
        }
        .filters-title {
            font-size: 12px;
            font-weight: bold;
            color: #163C74;
            margin-bottom: 8px;
        }
        .filters-text {
            font-size: 12px;
            color: #211F30;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #E0E4EA;
            font-size: 11px;
            color: #8795BA;
            text-align: center;
        }
        .footer-text {
            margin-bottom: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <div class="question-id">${questionId}</div>
            <h1 class="question-title">${questionTitle}</h1>
            ${questionDescription ? `<p class="question-description">${questionDescription}</p>` : ''}
            ${surveyVersion ? `<p class="meta-info">Encuesta: ${surveyVersion}</p>` : ''}
        </div>
        <div class="header-right">
            <img src="data:image/png;base64,${OBSERVATORY_LOGO_BASE64}" class="logo" alt="Logo Observatorio">
        </div>
    </div>

    <div class="stats-row">
        <div class="stat-card">
            <div class="stat-label">Muestra Total (N)</div>
            <div class="stat-value">${sampleSize}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Respuestas Válidas</div>
            <div class="stat-value">${validResponses}</div>
        </div>
    </div>

    <div class="chart-container">
        <img src="data:image/png;base64,${chartImageBase64}" class="chart-image" alt="Gráfica de resultados">
    </div>

    ${activeFiltersText && activeFiltersText !== 'Sin filtros activos' ? `
    <div class="filters-section">
        <div class="filters-title">Filtros Aplicados</div>
        <div class="filters-text">${activeFiltersText}</div>
    </div>
    ` : ''}

    <div class="footer">
        <p class="footer-text">Generado por la aplicación Jalisco Cómo Vamos</p>
        <p class="footer-text">Fecha de generación: ${currentDate}</p>
        <p class="footer-text">www.jaliscocomovamos.org</p>
    </div>
</body>
</html>
`
}

/**
 * Generates a PDF from the chart data and shares it.
 * 
 * @param data - The chart data to include in the PDF
 * @returns Promise that resolves when the PDF has been shared or rejects on error
 */
export async function generateAndShareChartPdf(data: ChartPdfData): Promise<void> {
    try {
        // Generate HTML content
        const htmlContent = generatePdfHtml(data)

        // Generate PDF from HTML
        const { uri: pdfUri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false,
        })

        // Check if sharing is available
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert(
                'Compartir no disponible',
                'La función de compartir no está disponible en este dispositivo.'
            )
            return
        }

        // Share the PDF directly - the user can choose to save or share
        await Sharing.shareAsync(pdfUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Descargar gráfica',
            UTI: 'com.adobe.pdf',
        })
    } catch (error) {
        console.error('Error generating PDF:', error)
        throw new Error('No se pudo generar el PDF. Por favor, intenta de nuevo.')
    }
}

/**
 * Checks if PDF generation is supported on the current platform.
 * 
 * @returns true if PDF generation is supported
 */
export function isPdfExportSupported(): boolean {
    // expo-print supports iOS and Android
    return Platform.OS === 'ios' || Platform.OS === 'android'
}
