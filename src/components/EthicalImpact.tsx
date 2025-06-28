'use client';
import React from 'react';
import isEqual from 'lodash.isequal';
import { Checkbox } from '@/components/ui/checkbox';

type Props = {
  value: {
    biasFairness: {
      historicalBias: boolean;
      demographicGaps: boolean;
      geographicBias: boolean;
      selectionBias: boolean;
      confirmationBias: boolean;
      temporalBias: boolean;
    };
    privacySecurity: {
      dataMinimization: boolean;
      consentManagement: boolean;
      dataAnonymization: boolean;
    };
  };
  onChange: (data: Props['value']) => void;
};

export default function EthicalImpact({ value, onChange }: Props) {
  const lastSent = React.useRef<any>(null);

  React.useEffect(() => {
    const currentData = {
      ...value,
    };
 
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [value, onChange]);

  return (
    <div className="space-y-8">
      <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-6">
        <div className="font-semibold text-purple-800 text-lg mb-1">Ethical Impact Assessment</div>
        <div className="text-purple-700">
          Evaluate potential ethical implications and ensure responsible AI implementation.
        </div>
      </div>

      {/* Bias and Fairness */}
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Bias and Fairness Analysis</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.historicalBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, historicalBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Historical bias in training data</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.demographicGaps}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, demographicGaps: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Demographic representation gaps</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.geographicBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, geographicBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Geographic bias</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.selectionBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, selectionBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Selection bias</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.confirmationBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, confirmationBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Confirmation bias</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={value.biasFairness.temporalBias}
                  onCheckedChange={(val) =>
                    onChange({ ...value, biasFairness: { ...value.biasFairness, temporalBias: !!val } } as Props['value'])
                  }
                />
                <span className="text-sm">Temporal bias</span>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy and Security */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-2">Privacy and Security</h4>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={value.privacySecurity.dataMinimization}
                onCheckedChange={(val) =>
                  onChange({ ...value, privacySecurity: { ...value.privacySecurity, dataMinimization: !!val } } as Props['value'])
                }
              />
              <span className="text-sm">Data minimization principle</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={value.privacySecurity.consentManagement}
                onCheckedChange={(val) =>
                  onChange({ ...value, privacySecurity: { ...value.privacySecurity, consentManagement: !!val } } as Props['value'])
                }
              />
              <span className="text-sm">Consent management</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={value.privacySecurity.dataAnonymization}
                onCheckedChange={(val) =>
                  onChange({ ...value, privacySecurity: { ...value.privacySecurity, dataAnonymization: !!val } } as Props['value'])
                }
              />
              <span className="text-sm">Data anonymization</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}