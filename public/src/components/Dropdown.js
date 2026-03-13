function Dropdown({id, className, disabled = false, options, value, onChange}) {
  return (
    <select id={id} className={className} disabled={disabled} value={value} onChange={event => onChange(event.target.value)}>
      {options.map(option => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >{option.label}</option>
      ))}
    </select>
  );
}
