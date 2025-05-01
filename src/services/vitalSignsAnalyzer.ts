import { VitalSigns } from './vitalSignsService';

export interface VitalSignsAnalysisResult {
  hasCriticalSigns: boolean;
  criticalDetails: Array<{
    metric: string;
    value: any;
    normalRange: string;
    severity: 'warning' | 'critical';
    recommendation: string;
  }>;
  injurySpecificWarnings: string[];
  overallRecommendation: string;
}

/**
 * This service analyzes vital signs to detect critical conditions,
 * especially those that might indicate complications from injuries
 */
export class VitalSignsAnalyzer {
  /**
   * Analyze vital signs and detect critical conditions
   */
  static analyzeVitalSigns(
    vitalSigns: VitalSigns, 
    injuryType?: string, 
    injurySeverity: 'low' | 'medium' | 'high' = 'medium'
  ): VitalSignsAnalysisResult {
    const criticalDetails = [];
    const injurySpecificWarnings = [];
    let hasCriticalSigns = false;
    
    // Check heart rate
    if (vitalSigns.heartRate) {
      // Normal resting heart rate is 60-100 bpm
      if (vitalSigns.heartRate > 120) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Heart Rate',
          value: `${vitalSigns.heartRate} bpm`,
          normalRange: '60-100 bpm',
          severity: 'critical',
          recommendation: 'Elevated heart rate may indicate shock, pain, or cardiovascular distress'
        });
        
        // Injury-specific warnings for elevated heart rate
        if (injuryType) {
          if (injuryType.includes('cut') || injuryType.includes('lac') || injuryType.includes('wound')) {
            injurySpecificWarnings.push(
              'Elevated heart rate combined with an open wound may indicate significant blood loss or the onset of hypovolemic shock'
            );
          }
          if (injuryType.includes('burn')) {
            injurySpecificWarnings.push(
              'Elevated heart rate with burns may indicate burn shock developing, which can be life-threatening'
            );
          }
          if (injuryType.includes('fract')) {
            injurySpecificWarnings.push(
              'Elevated heart rate with a fracture may indicate internal bleeding, fat embolism, or pain-induced shock'
            );
          }
        }
      } else if (vitalSigns.heartRate < 50) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Heart Rate',
          value: `${vitalSigns.heartRate} bpm`,
          normalRange: '60-100 bpm',
          severity: 'critical',
          recommendation: 'Abnormally low heart rate may indicate cardiac problems or serious injury'
        });
        
        // Injury-specific warnings for low heart rate
        if (injuryType) {
          if (injuryType.includes('head') || injuryType.includes('concuss')) {
            injurySpecificWarnings.push(
              'Low heart rate combined with head injury could indicate increased intracranial pressure - immediate medical attention required'
            );
          }
        }
      } else if (vitalSigns.heartRate > 100) {
        criticalDetails.push({
          metric: 'Heart Rate',
          value: `${vitalSigns.heartRate} bpm`,
          normalRange: '60-100 bpm',
          severity: 'warning',
          recommendation: 'Slightly elevated heart rate - monitor for changes'
        });
      }
    }
    
    // Check blood pressure
    if (vitalSigns.bloodPressure) {
      const { systolic, diastolic } = vitalSigns.bloodPressure;
      
      // Check for hypertension (high blood pressure)
      if (systolic > 160 || diastolic > 100) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Blood Pressure',
          value: `${systolic}/${diastolic} mmHg`,
          normalRange: '90-140/60-90 mmHg',
          severity: 'critical',
          recommendation: 'Dangerously high blood pressure - may increase risk of bleeding or indicate other serious conditions'
        });
        
        // Injury-specific warnings for high blood pressure
        if (injuryType) {
          if (injuryType.includes('head') || injuryType.includes('brain')) {
            injurySpecificWarnings.push(
              'High blood pressure with head injury significantly increases risk of cerebral hemorrhage'
            );
          }
        }
      } 
      // Check for hypotension (low blood pressure)
      else if (systolic < 90 || diastolic < 60) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Blood Pressure',
          value: `${systolic}/${diastolic} mmHg`,
          normalRange: '90-140/60-90 mmHg',
          severity: 'critical',
          recommendation: 'Low blood pressure may indicate shock or significant blood loss'
        });
        
        // Injury-specific warnings for low blood pressure
        if (injuryType) {
          if (injuryType.includes('cut') || injuryType.includes('lac') || injuryType.includes('wound') || injuryType.includes('bleed')) {
            injurySpecificWarnings.push(
              'Low blood pressure with bleeding injury indicates significant blood loss and possible hypovolemic shock - medical emergency'
            );
          }
          if (injuryType.includes('burn') && (injurySeverity === 'medium' || injurySeverity === 'high')) {
            injurySpecificWarnings.push(
              'Low blood pressure with significant burns indicates burn shock - medical emergency'
            );
          }
        }
      }
    }
    
    // Check oxygen saturation
    if (vitalSigns.oxygenSaturation) {
      if (vitalSigns.oxygenSaturation < 90) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Oxygen Saturation',
          value: `${vitalSigns.oxygenSaturation}%`,
          normalRange: '95-100%',
          severity: 'critical',
          recommendation: 'Dangerously low blood oxygen levels - immediate medical attention required'
        });
        
        // Injury-specific warnings for low oxygen
        if (injuryType) {
          if (injuryType.includes('chest') || injuryType.includes('lung') || injuryType.includes('rib')) {
            injurySpecificWarnings.push(
              'Low oxygen with chest injury may indicate pneumothorax or hemothorax - medical emergency'
            );
          }
        }
      } else if (vitalSigns.oxygenSaturation < 95) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Oxygen Saturation',
          value: `${vitalSigns.oxygenSaturation}%`,
          normalRange: '95-100%',
          severity: 'warning',
          recommendation: 'Below normal blood oxygen levels - monitor closely'
        });
      }
    }
    
    // Check temperature
    if (vitalSigns.temperature) {
      if (vitalSigns.temperature > 39.0) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Body Temperature',
          value: `${vitalSigns.temperature.toFixed(1)}°C`,
          normalRange: '36.5-37.5°C',
          severity: 'critical',
          recommendation: 'High fever may indicate infection or inflammation'
        });
        
        // Injury-specific warnings for fever
        if (injuryType) {
          if (injuryType.includes('cut') || injuryType.includes('lac') || injuryType.includes('wound')) {
            injurySpecificWarnings.push(
              'Fever with open wound suggests infection - medical attention required'
            );
          }
          if (injuryType.includes('burn')) {
            injurySpecificWarnings.push(
              'Fever with burns may indicate infection or systemic inflammatory response'
            );
          }
        }
      } else if (vitalSigns.temperature < 35.5) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Body Temperature',
          value: `${vitalSigns.temperature.toFixed(1)}°C`,
          normalRange: '36.5-37.5°C',
          severity: 'critical',
          recommendation: 'Low body temperature may indicate shock or exposure'
        });
      }
    }
    
    // Check respiration rate
    if (vitalSigns.respirationRate) {
      if (vitalSigns.respirationRate > 24) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Respiration Rate',
          value: `${vitalSigns.respirationRate} bpm`,
          normalRange: '12-20 bpm',
          severity: 'critical',
          recommendation: 'Abnormally fast breathing may indicate respiratory distress'
        });
        
        // Injury-specific warnings for high respiration
        if (injuryType) {
          if (injuryType.includes('chest') || injuryType.includes('lung') || injuryType.includes('rib')) {
            injurySpecificWarnings.push(
              'Rapid breathing with chest injury suggests respiratory compromise - medical emergency'
            );
          }
        }
      } else if (vitalSigns.respirationRate < 10) {
        hasCriticalSigns = true;
        criticalDetails.push({
          metric: 'Respiration Rate',
          value: `${vitalSigns.respirationRate} bpm`,
          normalRange: '12-20 bpm',
          severity: 'critical',
          recommendation: 'Abnormally slow breathing may indicate neurological or respiratory depression'
        });
        
        // Injury-specific warnings for low respiration
        if (injuryType) {
          if (injuryType.includes('head') || injuryType.includes('brain') || injuryType.includes('concuss')) {
            injurySpecificWarnings.push(
              'Slow breathing with head injury suggests worsening neurological status - medical emergency'
            );
          }
        }
      }
    }
    
    // Generate overall recommendation
    let overallRecommendation = '';
    if (hasCriticalSigns) {
      if (injurySpecificWarnings.length > 0) {
        overallRecommendation = 'MEDICAL EMERGENCY: Critical vital signs detected with injury-specific concerns. Seek immediate medical attention.';
      } else {
        overallRecommendation = 'MEDICAL ALERT: Critical vital signs detected. Seek medical attention as soon as possible.';
      }
    } else if (criticalDetails.length > 0) {
      overallRecommendation = 'CAUTION: Some vital signs are abnormal. Monitor closely and consider medical consultation.';
    } else {
      overallRecommendation = 'Vital signs are currently within normal ranges. Continue to monitor.';
    }
    
    return {
      hasCriticalSigns,
      criticalDetails,
      injurySpecificWarnings,
      overallRecommendation
    };
  }
  
  /**
   * Get normal ranges for reference
   */
  static getNormalRanges() {
    return {
      heartRate: '60-100 bpm',
      bloodPressure: '90-140/60-90 mmHg',
      oxygenSaturation: '95-100%',
      temperature: '36.5-37.5°C',
      respirationRate: '12-20 bpm'
    };
  }
} 