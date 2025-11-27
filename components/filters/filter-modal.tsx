import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { brandColors, textStyles } from '../../styles/theme';
import { useFilters } from '';
import { availableFilters, FilterConfig, QueryFilters } from '../../constants/indicators-map';

const { width } = Dimensions.get('window');

interface FilterSectionProps {
  filterConfig: FilterConfig;
  value: any;
  onValueChange: (value: any) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({ filterConfig, value, onValueChange }) => {
  switch (filterConfig.type) {
    case 'select':
      return (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{filterConfig.label}</Text>
          <View style={styles.optionsContainer}>
            {filterConfig.options?.map((option: any) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionButton,
                  value === option.value && styles.optionButtonSelected,
                ]}
                onPress={() => onValueChange(value === option.value ? null : option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    value === option.value && styles.optionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {value === option.value && (
                  <Ionicons name="checkmark" size={16} color={brandColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );

    case 'range':
      const rangeValue = Array.isArray(value) ? value : [filterConfig.range?.min || 0, filterConfig.range?.max || 100];
      return (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{filterConfig.label}</Text>
          <View style={styles.rangeContainer}>
            <Text style={styles.rangeLabel}>
              {rangeValue[0]} - {rangeValue[1]}
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>{filterConfig.range?.min}</Text>
              <View style={styles.slider}>
                <Slider
                  style={{ width: width - 120, height: 40 }}
                  minimumValue={filterConfig.range?.min || 0}
                  maximumValue={filterConfig.range?.max || 100}
                  value={rangeValue[0]}
                  onValueChange={(val: number) => onValueChange([Math.round(val), rangeValue[1]])}
                  minimumTrackTintColor={brandColors.primary}
                  maximumTrackTintColor={brandColors.muted}
                  thumbTintColor={brandColors.primary}
                />
              </View>
              <Text style={styles.sliderLabel}>{filterConfig.range?.max}</Text>
            </View>
          </View>
        </View>
      );

    case 'multiselect':
      const selectedValues = Array.isArray(value) ? value : [];
      return (
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>{filterConfig.label}</Text>
          <View style={styles.optionsContainer}>
            {filterConfig.options?.map((option: any) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionButtonSelected,
                  ]}
                  onPress={() => {
                    const newValues = isSelected
                      ? selectedValues.filter(v => v !== option.value)
                      : [...selectedValues, option.value];
                    onValueChange(newValues.length > 0 ? newValues : null);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={16} color={brandColors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      );

    default:
      return null;
  }
};

export const FilterModal: React.FC = () => {
  const {
    filterState,
    setPendingFilters,
    applyFilters,
    hideFilterModal,
    clearFilters,
    getActiveFilterCount,
  } = useFilters();

  const [localFilters, setLocalFilters] = useState<QueryFilters>({});

  // Sincronizar con filtros pendientes del contexto
  useEffect(() => {
    setLocalFilters(filterState.pendingFilters);
  }, [filterState.pendingFilters]);

  const handleFilterChange = (filterId: string, value: any) => {
    const newFilters = { ...localFilters };
    
    if (value === null || value === undefined) {
      delete newFilters[filterId];
    } else {
      newFilters[filterId] = value;
    }
    
    setLocalFilters(newFilters);
    setPendingFilters(newFilters);
  };

  const handleApplyFilters = () => {
    applyFilters(localFilters);
  };

  const handleClearAll = () => {
    Alert.alert(
      'Limpiar Filtros',
      '¿Estás seguro de que quieres limpiar todos los filtros?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            clearFilters();
            setLocalFilters({});
            hideFilterModal();
          },
        },
      ]
    );
  };

  const handleClose = () => {
    // Restaurar filtros originales
    setLocalFilters(filterState.activeFilters);
    hideFilterModal();
  };

  const pendingFilterCount = Object.keys(localFilters).length;
  const hasChanges = JSON.stringify(localFilters) !== JSON.stringify(filterState.activeFilters);

  return (
    <Modal
      visible={filterState.isFilterModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={brandColors.text} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Filtros</Text>
            <Text style={styles.subtitle}>
              {pendingFilterCount} filtro{pendingFilterCount !== 1 ? 's' : ''} seleccionado{pendingFilterCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {getActiveFilterCount() > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Text style={styles.clearText}>Limpiar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filtros */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {availableFilters.map((filterConfig: any) => (
            <FilterSection
              key={filterConfig.id}
              filterConfig={filterConfig}
              value={localFilters[filterConfig.id]}
              onValueChange={(value) => handleFilterChange(filterConfig.id, value)}
            />
          ))}

          {/* Información adicional */}
          <View style={styles.infoSection}>
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={20} color={brandColors.muted} />
              <Text style={styles.infoText}>
                Los filtros se aplican a todas las gráficas del dashboard actual.
                Los datos mostrados son agregados y anonimizados.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer con botones de acción */}
        <View style={styles.footer}>
          {hasChanges && (
            <View style={styles.changesIndicator}>
              <Ionicons name="alert-circle-outline" size={16} color={brandColors.accent} />
              <Text style={styles.changesText}>Tienes cambios sin aplicar</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.applyButton,
                !hasChanges && styles.buttonDisabled
              ]} 
              onPress={handleApplyFilters}
              disabled={!hasChanges}
            >
              <Text style={[
                styles.applyButtonText,
                !hasChanges && styles.buttonTextDisabled
              ]}>
                Aplicar Filtros
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brandColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: brandColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.muted,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  title: {
    ...textStyles.h2,
    color: brandColors.text,
  },
  subtitle: {
    ...textStyles.caption,
    color: brandColors.muted,
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearText: {
    ...textStyles.body,
    color: brandColors.accent,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: brandColors.muted,
  },
  filterLabel: {
    ...textStyles.body,
    fontWeight: '600',
    color: brandColors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brandColors.muted,
    backgroundColor: brandColors.surface,
    marginBottom: 8,
  },
  optionButtonSelected: {
    borderColor: brandColors.primary,
    backgroundColor: `${brandColors.primary}10`,
  },
  optionText: {
    ...textStyles.body,
    color: brandColors.text,
    marginRight: 4,
  },
  optionTextSelected: {
    color: brandColors.primary,
    fontWeight: '600',
  },
  rangeContainer: {
    alignItems: 'center',
  },
  rangeLabel: {
    ...textStyles.h3,
    color: brandColors.primary,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  sliderLabel: {
    ...textStyles.caption,
    color: brandColors.muted,
    minWidth: 30,
    textAlign: 'center',
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: `${brandColors.muted}10`,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  infoText: {
    ...textStyles.caption,
    color: brandColors.muted,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: brandColors.surface,
    borderTopWidth: 1,
    borderTopColor: brandColors.muted,
  },
  changesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  changesText: {
    ...textStyles.caption,
    color: brandColors.accent,
    marginLeft: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: brandColors.muted,
  },
  cancelButtonText: {
    ...textStyles.body,
    color: brandColors.text,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: brandColors.primary,
  },
  applyButtonText: {
    ...textStyles.body,
    color: 'white',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
