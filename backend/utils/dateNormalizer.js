import { format, isValid, parseISO } from 'date-fns';

/**
 * Utilidad para normalizar fechas desde diferentes formatos
 * Maneja: strings, números seriales de Excel, objetos Date
 */

export class DateNormalizer {
    /**
     * Normaliza una fecha de entrada a formato ISO (YYYY-MM-DD HH:MM:SS)
     * @param {string|number|Date} input - Fecha a normalizar
     * @returns {string|null} - Fecha en formato ISO o null si es inválida
     */
    static normalizeDateTime(input) {
        if (!input || input === '') return null;

        try {
            let date;

            // Manejar números seriales de Excel
            if (typeof input === 'number') {
                // Excel serial date: días desde 1900-01-01
                date = new Date((input - 25569) * 86400 * 1000);
            } 
            // Manejar strings de fecha
            else if (typeof input === 'string') {
                // Intentar parsear como ISO
                date = parseISO(input);
                if (!isValid(date)) {
                    // Intentar otros formatos comunes
                    date = new Date(input);
                }
            } 
            // Manejar objetos Date
            else if (input instanceof Date) {
                date = input;
            } else {
                return null;
            }

            return isValid(date) ? format(date, 'yyyy-MM-dd HH:mm:ss') : null;
        } catch (error) {
            console.error('Error normalizando fecha:', error);
            return null;
        }
    }

    /**
     * Normaliza una fecha a formato DATE (YYYY-MM-DD)
     * @param {string|number|Date} input - Fecha a normalizar
     * @returns {string|null} - Fecha en formato DATE o null si es inválida
     */
    static normalizeDate(input) {
        const normalized = this.normalizeDateTime(input);
        return normalized ? normalized.split(' ')[0] : null;
    }

    /**
     * Valida si una fecha es válida
     * @param {string|number|Date} input - Fecha a validar
     * @returns {boolean} - true si la fecha es válida
     */
    static isValidDate(input) {
        if (!input) return false;
        
        try {
            const normalized = this.normalizeDateTime(input);
            return normalized !== null;
        } catch {
            return false;
        }
    }

    /**
     * Maneja fechas desde Excel con diferentes formatos
     * @param {any} value - Valor de celda de Excel
     * @returns {string|null} - Fecha normalizada
     */
    static handleExcelDate(value) {
        if (!value) return null;

        // Si es número, asumir que es serial de Excel
        if (typeof value === 'number') {
            return this.normalizeDateTime(value);
        }

        // Si es string, intentar parsear
        if (typeof value === 'string') {
            // Limpiar espacios y caracteres especiales
            const cleanValue = value.trim();
            if (!cleanValue) return null;

            // Detectar formato DD/MM/YYYY o DD-MM-YYYY
            const dateRegex = /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/;
            const match = cleanValue.match(dateRegex);
            
            if (match) {
                const [, day, month, year] = match;
                const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                return this.normalizeDateTime(date);
            }

            // Intentar parsear como string de fecha
            return this.normalizeDateTime(cleanValue);
        }

        return null;
    }
}

// Exportar funciones individuales para compatibilidad
export const normalizeDateTime = DateNormalizer.normalizeDateTime;
export const normalizeDate = DateNormalizer.normalizeDate;
export const isValidDate = DateNormalizer.isValidDate;
export const handleExcelDate = DateNormalizer.handleExcelDate;
