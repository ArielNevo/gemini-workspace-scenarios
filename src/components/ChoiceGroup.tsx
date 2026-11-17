import { useId } from 'react';

interface Item {
  id: string;
  label: string;
}
interface Props {
  legend: string;
  hint?: string;
  items: Item[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  max?: number;
  name: string;
}

/** A fieldset of checkboxes or radios. All input in the site is choice-based (no free text). */
export function ChoiceGroup({ legend, hint, items, value, onChange, multiple = true, max, name }: Props) {
  const hintId = useId();
  const atMax = max !== undefined && value.length >= max;
  return (
    <fieldset className="choice-group" aria-describedby={hint ? hintId : undefined}>
      <legend>{legend}</legend>
      {hint && (
        <p id={hintId} className="muted">
          {hint}
        </p>
      )}
      <div className="choices">
        {items.map((item) => {
          const checked = value.includes(item.id);
          const disabled = multiple && !checked && atMax;
          return (
            <label
              key={item.id}
              className={`choice${checked ? ' is-checked' : ''}${disabled ? ' is-disabled' : ''}`}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={name}
                value={item.id}
                checked={checked}
                disabled={disabled}
                onChange={() => {
                  if (!multiple) onChange([item.id]);
                  else onChange(checked ? value.filter((v) => v !== item.id) : [...value, item.id]);
                }}
              />
              <span>{item.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
