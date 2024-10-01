import './SettingsMenu.css';
import { Tense } from '../Model/Problems';

interface SettingsMenuProps {
  tenseState: Record<Tense, boolean>;
  toggleTense: (tense: Tense) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  tenseState,
  toggleTense,
}) => {
  return (
    <div className="settings-menu">
      <h4>Filtrar Tempos Verbais:</h4>
      <div className="toggle-container">
        {Object.keys(tenseState).map((tense) => (
          <div key={tense} className="toggle">
            <label>
              <input
                type="checkbox"
                checked={tenseState[tense as Tense]}
                onChange={() => toggleTense(tense as Tense)}
              />
              {tense}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsMenu;
