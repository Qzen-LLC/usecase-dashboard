'use client';
import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';
import { Checkbox } from '@/components/ui/checkbox';


type Props = {
  onChange?: (data: {
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
  }) => void;
};


export default function EthicalImpact({ onChange }: Props) {
  const lastSent = useRef<any>(null);
  const [biasFairness, setBiasFairness] = useState({
    historicalBias: false,
    demographicGaps: false,
    geographicBias: false,
    selectionBias: false,
    confirmationBias: false,
    temporalBias: false,
  });


  const [privacySecurity, setPrivacySecurity] = useState({
    dataMinimization: false,
    consentManagement: false,
    dataAnonymization: false,
  });


  useEffect(() => {
    const currentData = {
      biasFairness,
      privacySecurity,
    };
 
    if (onChange && !isEqual(currentData, lastSent.current)) {
      onChange(currentData);
      lastSent.current = currentData;
    }
  }, [biasFairness, privacySecurity, onChange]);


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
                  checked={biasFairness.historicalBias}
                  onCheckedChange={(val) =>
                    setBiasFairness((prev) => ({ ...prev, historicalBias: !!val }))
                  }
                />
                <span className="text-sm">Historical bias in training data</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={biasFairness.demographicGaps}
                  onCheckedChange={(val) =>
                    setBiasFairness((prev) => ({ ...prev, demographicGaps: !!val }))
                  }
                />
                <span className="text-sm">Demographic representation gaps</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={biasFairness.geographicBias}
                  onCheckedChange={(val) =>
                    setBiasFairness((prev) => ({ ...prev, geographicBias: !!val }))
                  }
                />
                <span className="text-sm">Geographic bias</span>
              </label>
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={biasFairness.selectionBias}
                  onCheckedChange={(val) =>
                    setBiasFairness((prev) => ({ ...prev, selectionBias: !!val }))
                  }
                />
                <span className="text-sm">Selection bias</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={biasFairness.confirmationBias}
                  onCheckedChange={(val) =>
                    setBiasFairness((prev) => ({ ...prev, confirmationBias: !!val }))
                  }
                />
                <span className="text-sm">Confirmation bias</span>
              </label>
              <label className="flex items-center space-x-2">
                <Checkbox
                  checked={biasFairness.temporalBias}
                  onCheckedChange={(val) =>
                    setBiasFairness((prev) => ({ ...prev, temporalBias: !!val }))
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
                checked={privacySecurity.dataMinimization}
                onCheckedChange={(val) =>
                  setPrivacySecurity((prev) => ({ ...prev, dataMinimization: !!val }))
                }
              />
              <span className="text-sm">Data minimization principle</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={privacySecurity.consentManagement}
                onCheckedChange={(val) =>
                  setPrivacySecurity((prev) => ({ ...prev, consentManagement: !!val }))
                }
              />
              <span className="text-sm">Consent management</span>
            </label>
            <label className="flex items-center space-x-2">
              <Checkbox
                checked={privacySecurity.dataAnonymization}
                onCheckedChange={(val) =>
                  setPrivacySecurity((prev) => ({ ...prev, dataAnonymization: !!val }))
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