import { supabase } from "../lib/supabase"

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            preguntas: {
                Row: {
                    id: number
                    pregunta_id: string
                    nombre_categoria: string
                    texto_pregunta: string | null
                }
                Insert: {
                    id?: number
                    pregunta_id: string
                    nombre_categoria: string
                    texto_pregunta?: string | null
                }
                Update: {
                    id?: number
                    pregunta_id?: string
                    nombre_categoria?: string
                    texto_pregunta?: string | null
                }
            }

            Municipios: {
                Row: {
                    id: number
                    nombre: string
                }
                Insert: {
                    id?: number
                    nombre: string
                }
                Update: {
                    id?: number
                    nombre?: string
                }
            }

            encuestalol: {
                Row: {
                    // Metadata
                    Date: string
                    Duration: number

                    // Questions
                    Q_1: number
                    Q_2: number
                    Q_3: number
                    Q_4: number
                    Q_4_S: string // Text
                    Q_5: number
                    Q_6: number
                    Q_7: number
                    Q_8: number
                    Q_9: number
                    Q_10: number
                    Q_11: number

                    // T_Q_12
                    T_Q_12_1: number
                    T_Q_12_2: number
                    T_Q_12_3: number
                    T_Q_12_4: number
                    T_Q_12_5: number

                    // T_Q_13
                    T_Q_13_1: number
                    T_Q_13_2: number
                    T_Q_13_3: number
                    T_Q_13_4: number
                    T_Q_13_5: number
                    T_Q_13_6: number

                    Q_14: number
                    Q_15: number
                    Q_16: number
                    Q_17: number
                    Q_18: number
                    Q_19: number
                    Q_20: number
                    Q_21: number
                    Q_22: number

                    // Q_23 Options
                    Q_23_O1: number
                    Q_23_O2: number
                    Q_23_O3: number
                    Q_23_O4: number
                    Q_23_O5: number
                    Q_23_O6: number
                    Q_23_O7: number
                    Q_23_O8: number
                    Q_23_O9: number

                    Q_24: number
                    Q_24_S: number // Not in text list, assuming numeric

                    // T_Q_25
                    T_Q_25_1: number
                    T_Q_25_2: number
                    T_Q_25_3: number
                    T_Q_25_4: number
                    T_Q_25_5: number
                    T_Q_25_6: number

                    // T_Q_26
                    T_Q_26_1: number
                    T_Q_26_2: number
                    T_Q_26_3: number
                    T_Q_26_4: number
                    T_Q_26_5: number
                    T_Q_26_6: number

                    // T_Q_27
                    T_Q_27_1: number
                    T_Q_27_2: number
                    T_Q_27_3: number
                    T_Q_27_4: number
                    T_Q_27_5: number
                    T_Q_27_6: number

                    // T_Q_28
                    T_Q_28_1: number
                    T_Q_28_2: number
                    T_Q_28_3: number
                    T_Q_28_4: number
                    T_Q_28_5: number
                    T_Q_28_6: number
                    T_Q_28_7: number
                    T_Q_28_8: number
                    T_Q_28_9: number

                    // T_Q_29
                    T_Q_29_1: number
                    T_Q_29_2: number

                    // T_Q_30
                    T_Q_30_1: number
                    T_Q_30_2: number
                    T_Q_30_3: number
                    T_Q_30_4: number
                    T_Q_30_5: number
                    T_Q_30_6: number

                    Q_31: number
                    Q_32: number
                    Q_33: number

                    // Q_34 Options
                    Q_34_O1: number
                    Q_34_O2: number
                    Q_34_O3: number
                    Q_34_O4: number
                    Q_34_O5: number
                    Q_34_O6: number
                    Q_34_O7: number
                    Q_34_O8: number
                    Q_34_O9: number
                    Q_34_O10: number
                    Q_34_O11: number
                    Q_34_O12: number
                    Q_34_O13: number
                    Q_34_O14: number

                    Q_35: number

                    // T_Q_36
                    T_Q_36_1: number
                    T_Q_36_2: number
                    T_Q_36_3: number
                    T_Q_36_4: number
                    T_Q_36_5: number
                    T_Q_36_6: number

                    // T_Q_37
                    T_Q_37_1: number
                    T_Q_37_2: number
                    T_Q_37_3: number
                    T_Q_37_4: number
                    T_Q_37_5: number
                    T_Q_37_6: number
                    T_Q_37_7: number

                    Q_38: number

                    // T_Q_39
                    T_Q_39_1: number
                    T_Q_39_2: number
                    T_Q_39_3: number
                    T_Q_39_4: number
                    T_Q_39_5: number
                    T_Q_39_6: number

                    Q_40: number
                    Q_40_C: number
                    Q_41: number
                    Q_42: number
                    Q_42_C: number

                    // T_Q_43
                    T_Q_43_1: number
                    T_Q_43_2: number
                    T_Q_43_3: number
                    T_Q_43_4: number
                    T_Q_43_5: number
                    T_Q_43_6: number
                    T_Q_43_7: number

                    Q_44: number
                    Q_45: number

                    // Q_46 Options
                    Q_46_O1: number
                    Q_46_O2: number
                    Q_46_O3: number
                    Q_46_O4: number
                    Q_46_O5: number
                    Q_46_O6: number

                    Q_47: number
                    Q_48: number
                    Q_49: number
                    Q_50: number
                    Q_51: number
                    Q_52: number
                    Q_53: number
                    Q_54: number
                    Q_55: number
                    Q_56: number
                    Q_57: number

                    // T_Q_58
                    T_Q_58_1: number
                    T_Q_58_2: number
                    T_Q_58_3: number
                    T_Q_58_4: number

                    // T_Q_59
                    T_Q_59_1: number
                    T_Q_59_2: number
                    T_Q_59_3: number

                    // T_Q_60
                    T_Q_60_1: number
                    T_Q_60_2: number
                    T_Q_60_3: number
                    T_Q_60_4: number
                    T_Q_60_5: number

                    // T_Q_61
                    T_Q_61_1: number
                    T_Q_61_2: number
                    T_Q_61_3: number
                    T_Q_61_4: number
                    T_Q_61_5: number

                    Q_62: number

                    // T_Q_63
                    T_Q_63_1: number
                    T_Q_63_2: number
                    T_Q_63_3: number
                    T_Q_63_4: number
                    T_Q_63_5: number
                    T_Q_63_6: number
                    T_Q_63_7: number
                    T_Q_63_8: number
                    T_Q_63_9: number
                    T_Q_63_10: number
                    T_Q_63_11: number

                    // T_Q_64
                    T_Q_64_1: number
                    T_Q_64_2: number
                    T_Q_64_3: number

                    // T_Q_65
                    T_Q_65_1: number
                    T_Q_65_2: number
                    T_Q_65_3: number
                    T_Q_65_4: number

                    // T_Q_66
                    T_Q_66_1: number
                    T_Q_66_2: number
                    T_Q_66_3: number
                    T_Q_66_4: number
                    T_Q_66_5: number
                    T_Q_66_6: number
                    T_Q_66_7: number

                    // Q_67 Options
                    Q_67_O1: number
                    Q_67_O2: number
                    Q_67_O3: number
                    Q_67_O4: number
                    Q_67_O5: number
                    Q_67_O6: number
                    Q_67_O7: number
                    Q_67_O8: number

                    // T_Q_68
                    T_Q_68_1: number
                    T_Q_68_2: number
                    T_Q_68_3: number
                    T_Q_68_4: number

                    Q_69: number
                    Q_70: number
                    Q_71: number

                    // T_Q_72
                    T_Q_72_1: number
                    T_Q_72_2: number
                    T_Q_72_3: number
                    T_Q_72_4: number
                    T_Q_72_5: number
                    T_Q_72_6: number
                    T_Q_72_7: number
                    T_Q_72_8: number
                    T_Q_72_9: number
                    T_Q_72_10: number
                    T_Q_72_11: number
                    T_Q_72_12: number

                    // T_Q_73
                    T_Q_73_1: number
                    T_Q_73_2: number

                    Q_74: number
                    Q_74_S: number
                    Q_75: number
                    Q_76: number
                    Q_77: number
                    Q_78: number
                    Q_79: number

                    // T_Q_80
                    T_Q_80_1: number
                    T_Q_80_2: number
                    T_Q_80_3: number

                    Q_81: number
                    Q_82: number

                    // T_Q_83
                    T_Q_83_1: number
                    T_Q_83_2: number

                    // T_Q_84
                    T_Q_84_1: number
                    T_Q_84_2: number

                    Q_85: number
                    Q_86: number
                    Q_87: number
                    Q_88: number
                    Q_89: number
                    Q_90: number
                    Q_91: number

                    // T_Q_92
                    T_Q_92_1: string // Text
                    T_Q_92_2: string // Text
                    T_Q_92_3: string // Text

                    Q_94: number
                    Q_95: number
                    Q_96: number

                    // T_Q_98
                    T_Q_98_1: number
                    T_Q_98_2: number
                    T_Q_98_3: number
                    T_Q_98_4: number
                    T_Q_98_5: number
                    T_Q_98_6: number

                    // Demographics
                    SEXO: number
                    CALIDAD_VIDA: number
                    EDAD: number
                    ESC: number
                    IND_SE2024: number
                    NSE2024: number
                    NSE2024_C: number
                    FACTOR: number
                    MUNICIPIO: string // Added manually as requested
                }
                Insert: {
                    [key: string]: any
                }
                Update: {
                    [key: string]: any
                }
            }
        }
    }
    
    auth: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    email: string | null
                }
                Insert: {
                    id: string
                    full_name: string
                    email: string
                }
                Update: {
                    id?: string
                    full_name?: string
                    email?: string
                }
            }
        }
    }
}

export async function getMunicipios() {
    const { data, error } = await supabase
        .from('Municipios')
        .select('id, nombre')
        .order('nombre', { ascending: true });

    if (error) {
        console.error('Error fetching municipios:', error);
        return [];
    }

    return data || [];
}