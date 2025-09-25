import React from 'react';
import { availableAlgorithms } from '../algorithms/distributionAlgorithms';
import { availablePatterns } from '../algorithms/distributionPatterns';

interface AlgorithmSelectorProps {
  selectedAlgorithm: string;
  selectedPattern: string;
  onAlgorithmChange: (algorithmType: string) => void;
  onPatternChange: (patternType: string) => void;
  disabled?: boolean;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  selectedPattern,
  onAlgorithmChange,
  onPatternChange,
  disabled = false
}) => {
  return (
    <div className="algorithm-selector">
      <h3>🔧 알고리즘 & 분포 설정</h3>
      
      <div className="selector-row">
        <div className="selector-group">
          <label htmlFor="algorithm-select">분배 알고리즘:</label>
          <select
            id="algorithm-select"
            value={selectedAlgorithm}
            onChange={(e) => onAlgorithmChange(e.target.value)}
            disabled={disabled}
          >
            {availableAlgorithms.map((algorithm) => (
              <option key={algorithm.type} value={algorithm.type}>
                {algorithm.name}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="pattern-select">고객 유입 패턴:</label>
          <select
            id="pattern-select"
            value={selectedPattern}
            onChange={(e) => onPatternChange(e.target.value)}
            disabled={disabled}
          >
            {availablePatterns.map((pattern) => (
              <option key={pattern.type} value={pattern.type}>
                {pattern.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="descriptions">
        <div className="description-item">
          <strong>알고리즘:</strong> {' '}
          {availableAlgorithms.find(a => a.type === selectedAlgorithm)?.description || '설명 없음'}
        </div>
        <div className="description-item">
          <strong>분포 패턴:</strong> {' '}
          {availablePatterns.find(p => p.type === selectedPattern)?.description || '설명 없음'}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSelector;