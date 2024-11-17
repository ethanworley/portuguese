import './SettingsMenu.css';
import { Tense } from '../Model/Problems';

interface SettingsMenuProps {
  tenseState: Record<Tense, boolean>;
  toggleTense: (tense: Tense) => void;
  verbState: Record<string, boolean>;
  toggleVerb: (verb: string) => void;
  selectAllVerbs: () => void;
  deselectAllVerbs: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  tenseState,
  toggleTense,
  verbState,
  toggleVerb,
  selectAllVerbs,
  deselectAllVerbs,
}) => {
  return (
    <div className="settings-menu">
      <div className="settings-content">
        <div className="settings-header">
          <h4>Filtrar Tempos Verbais:</h4>
        </div>
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
        <div className="settings-header">
          <h4>Filtrar Verbos:</h4>
        </div>
        <div className="toggle-container">
          <div key={'select-all'} className="toggle">
            <button onClick={selectAllVerbs}>marcar todos</button>
          </div>
          <div key={'select-all'} className="toggle">
            <button onClick={deselectAllVerbs}>desmarcar todos</button>
          </div>
          {Object.keys(verbState).map((verb) => (
            <div key={verb} className="toggle">
              <label>
                <input
                  type="checkbox"
                  checked={verbState[verb]}
                  onChange={() => toggleVerb(verb)}
                />
                {verb}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
