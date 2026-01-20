import { Input } from '@/components/ui/input';

export default function CurrencyInput({ value, onChange, required, min }) {
  return (
    <Input
      type="number"
      value={value}
      onChange={e => onChange(e.target.value)}
      required={required}
      min={min}
      step="0.01"
      className="font-mono"
      prefix="$"
    />
  );
}
