type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export default function Switch({ checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        padding: 2,
        cursor: 'pointer',
        flexShrink: 0,
        position: 'relative',
        backgroundColor: checked ? '#4ade80' : '#d1d5db',
        transition: 'background-color 0.2s ease',
        outline: 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          transform: checked ? 'translateX(20px)' : 'translateX(0)',
          transition: 'transform 0.2s ease',
        }}
      />
    </button>
  );
}
