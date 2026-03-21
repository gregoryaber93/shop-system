import { type ChangeEvent } from "react";

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export const QuantitySelector = ({
  value,
  min = 1,
  max = 99,
  onChange,
}: QuantitySelectorProps) => {
  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);

    if (Number.isNaN(parsed)) {
      return;
    }

    onChange(Math.min(max, Math.max(min, parsed)));
  };

  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div aria-label="Quantity selector">
      <button type="button" onClick={decrease} disabled={value <= min} aria-label="Decrease quantity">-</button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={onInputChange}
        aria-label="Quantity"
      />
      <button type="button" onClick={increase} disabled={value >= max} aria-label="Increase quantity">+</button>
    </div>
  );
};
